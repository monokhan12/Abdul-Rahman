import { create } from 'zustand';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { CmsUser, UserRole } from '../types/cms';

interface AuthState {
  user: FirebaseUser | null;
  cmsUser: CmsUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Actions
  initialize: () => () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateCmsProfile: (displayName: string, bio?: string, avatarUrl?: string) => Promise<void>;
  clearError: () => void;
}

const adminEmails = ['quanticschool@gmail.com'];

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  cmsUser: null,
  loading: true,
  error: null,
  initialized: false,

  clearError: () => set({ error: null }),

  initialize: () => {
    // Prevent double initialization
    if (get().initialized) {
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      set({ loading: true });
      if (firebaseUser) {
        try {
          // Check for user profile in Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let cmsUserData: CmsUser;

          if (userDocSnap.exists()) {
            cmsUserData = userDocSnap.data() as CmsUser;
          } else {
            // First time login - determine default role (Admin for specified emails, subscriber otherwise)
            const isDefaultAdmin = firebaseUser.email ? adminEmails.includes(firebaseUser.email) : false;
            const defaultRole: UserRole = isDefaultAdmin ? 'admin' : 'subscriber';

            cmsUserData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Contributor',
              avatarUrl: firebaseUser.photoURL || undefined,
              role: defaultRole,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now()
            };

            await setDoc(userDocRef, cmsUserData);
          }

          set({ user: firebaseUser, cmsUser: cmsUserData, loading: false, error: null, initialized: true });
        } catch (err: any) {
          console.error('Error in auth store profile sync:', err);
          set({ 
            user: firebaseUser, 
            cmsUser: {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Contributor',
              role: firebaseUser.email && adminEmails.includes(firebaseUser.email) ? 'admin' : 'subscriber',
              createdAt: new Date(),
              updatedAt: new Date()
            }, 
            loading: false, 
            error: 'Failed to synchronize administrative profile.', 
            initialized: true 
          });
        }
      } else {
        set({ user: null, cmsUser: null, loading: false, error: null, initialized: true });
      }
    });

    return unsubscribe;
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      set({ error: err.message || 'Google OAuth authentication failed.', loading: false });
      throw err;
    }
  },

  signInWithEmail: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      set({ error: err.message || 'Invalid email or password credentials.', loading: false });
      throw err;
    }
  },

  signUpWithEmail: async (email, password, displayName, role = 'subscriber') => {
    set({ loading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update Firebase Auth profile displayName
      await updateProfile(firebaseUser, { displayName });

      // Create Firestore User Doc
      const isDefaultAdmin = adminEmails.includes(email);
      const assignedRole: UserRole = isDefaultAdmin ? 'admin' : role;

      const cmsUserData: CmsUser = {
        id: firebaseUser.uid,
        email: email,
        displayName: displayName,
        role: assignedRole,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), cmsUserData);
      set({ user: firebaseUser, cmsUser: cmsUserData, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Registration failed. Try again.', loading: false });
      throw err;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await signOut(auth);
      set({ user: null, cmsUser: null, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Logout process failed.', loading: false });
      throw err;
    }
  },

  resetPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email);
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Password reset email failed.', loading: false });
      throw err;
    }
  },

  updateCmsProfile: async (displayName, bio, avatarUrl) => {
    const { user, cmsUser } = get();
    if (!user || !cmsUser) throw new Error('Unauthenticated');

    set({ loading: true, error: null });
    try {
      // 1. Update Firebase User Profile
      await updateProfile(user, { 
        displayName, 
        photoURL: avatarUrl || user.photoURL 
      });

      // 2. Update Firestore Doc
      const updatedCmsUser: CmsUser = {
        ...cmsUser,
        displayName,
        bio: bio || cmsUser.bio || '',
        avatarUrl: avatarUrl || cmsUser.avatarUrl || '',
        updatedAt: Timestamp.now()
      };

      await setDoc(doc(db, 'users', user.uid), updatedCmsUser, { merge: true });
      set({ cmsUser: updatedCmsUser, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update user profile info.', loading: false });
      throw err;
    }
  }
}));
