import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import postsData from '../content/posts.json';

// Initialize Firebase App uniquely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// Test connection on boot according to guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'posts', 'test-connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration if you are offline.");
    }
  }
}
testConnection();

// Timeout utility to prevent Firestore requests from hanging in sandboxed environments
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => {
      console.warn(`Firestore operation timed out after ${timeoutMs}ms. Using fallback.`);
      resolve(fallbackValue);
    }, timeoutMs))
  ]);
};

// Types representing Blog Data
export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  date: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  createdAt: any;
  updatedAt?: any;
}

export interface BlogComment {
  id?: string;
  postId: string;
  authorName: string;
  content: string;
  createdAt: any;
}

// Error Handling following Eight Pillars of Hardened Rules
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Pre-seeded high-quality blog posts to show immediately when database is empty
// Built-in articles live in src/content/posts.json so the build can also prerender them as static pages.
export const defaultBlogPosts: BlogPost[] = (postsData as Array<Omit<BlogPost, 'createdAt'> & { createdAt: string }>).map((p) => ({
  ...p,
  createdAt: new Date(p.createdAt),
}));

export const seedDefaultPostsIfEmpty = async () => {
  // Only attempt write operations if an authorized administrator is actively signed in
  if (!auth.currentUser || auth.currentUser.email !== 'quanticschool@gmail.com') {
    return;
  }

  try {
    const postsRef = collection(db, 'posts');
    const postsSnapshotPromise = getDocs(postsRef);
    const postsSnapshot = await withTimeout(postsSnapshotPromise, 1500, null);
    
    if (!postsSnapshot) {
      console.warn("Skipping seeding because Firestore query timed out.");
      return;
    }
    
    let seededCount = 0;
    for (const post of defaultBlogPosts) {
      const docId = post.id || post.slug;
      const { id, ...postData } = post;
      const postDocRef = doc(db, 'posts', docId);
      await setDoc(postDocRef, {
        ...postData,
        createdAt: Timestamp.fromDate(new Date(post.createdAt))
      });
      seededCount++;
    }
    if (seededCount > 0) {
      console.log(`Synced ${seededCount} default blog posts to Firestore successfully.`);
    }
  } catch (error) {
    console.error('Failed to seed default posts:', error);
  }
};

// Fetch all posts ordered by date/createdAt
export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const postsPath = 'posts';
  try {
    const q = query(collection(db, postsPath), orderBy('createdAt', 'desc'));
    const fetchPromise = getDocs(q).then((snapshot) => {
      if (snapshot.empty) {
        // Return default blog posts if Firestore is completely empty
        return defaultBlogPosts;
      }

      const mapped = snapshot.docs.map(doc => {
        const data = doc.data();
        if (!data || !data.title || !data.slug) {
          console.warn(`Ignoring invalid document in posts collection with ID: ${doc.id}`);
          return null;
        }
        return {
          id: doc.id,
          title: data.title || '',
          slug: data.slug || '',
          date: data.date || '',
          summary: data.summary || '',
          content: data.content || '',
          category: data.category || 'General',
          author: data.author || 'Abdul Rahman',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : undefined)
        } as BlogPost;
      }).filter((p): p is BlogPost => p !== null);

      if (mapped.length === 0) {
        return defaultBlogPosts;
      }
      return mapped;
    });

    return await withTimeout(fetchPromise, 2000, defaultBlogPosts);
  } catch (error) {
    // If we hit permission issues or unconfigured Firestore errors, gracefully fallback to default seeded data!
    console.warn('Firestore fetch failed, falling back to static default posts:', error);
    return defaultBlogPosts;
  }
};

// Slug aliases to map between full titles and short slugs
export const slugAliases: Record<string, string> = {
  'materials-informatics-accelerating-alloy-design': 'alloy-optimization-ml',
  'direct-recycling-nmc-cathode-materials': 'direct-cathode-recycling',
  'alloy-optimization-ml': 'materials-informatics-accelerating-alloy-design',
  'direct-cathode-recycling': 'direct-recycling-nmc-cathode-materials'
};

const findStaticPost = (slug: string): BlogPost | null => {
  const alias = slugAliases[slug];
  return defaultBlogPosts.find(p => 
    p.slug === slug || 
    p.id === slug || 
    (alias && (p.slug === alias || p.id === alias))
  ) || null;
};

// Fetch a single post by slug
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const postsPath = 'posts';
  const alias = slugAliases[slug];
  const querySlugs = alias ? [slug, alias] : [slug];

  try {
    const q = query(collection(db, postsPath), where('slug', 'in', querySlugs));
    const fetchPromise = getDocs(q).then((snapshot) => {
      if (snapshot.empty) {
        return findStaticPost(slug);
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      if (!data || !data.title || !data.slug) {
        return findStaticPost(slug);
      }
      return {
        id: docSnap.id,
        title: data.title || '',
        slug: data.slug || '',
        date: data.date || '',
        summary: data.summary || '',
        content: data.content || '',
        category: data.category || 'General',
        author: data.author || 'Abdul Rahman',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : undefined)
      } as BlogPost;
    });

    return await withTimeout(fetchPromise, 2000, findStaticPost(slug));
  } catch (error) {
    console.warn(`Firestore slug fetch failed, checking static: ${slug}`, error);
    return findStaticPost(slug);
  }
};

// Add a blog post (Admin only)
export const createBlogPost = async (post: Omit<BlogPost, 'id' | 'createdAt'>): Promise<string> => {
  const postsPath = 'posts';
  try {
    const docId = post.slug;
    const postData = {
      ...post,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    await setDoc(doc(db, postsPath, docId), postData);
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${postsPath}/${post.slug}`);
    throw error;
  }
};

// Update an existing blog post (Admin only)
export const updateBlogPost = async (slug: string, post: Partial<BlogPost>): Promise<void> => {
  const postsPath = 'posts';
  try {
    const postData = {
      ...post,
      updatedAt: Timestamp.now()
    };
    await setDoc(doc(db, postsPath, slug), postData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${postsPath}/${slug}`);
    throw error;
  }
};

// Delete a blog post (Admin only)
export const deleteBlogPost = async (slug: string): Promise<void> => {
  const postsPath = 'posts';
  try {
    await deleteDoc(doc(db, postsPath, slug));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${postsPath}/${slug}`);
    throw error;
  }
};

// Delete a comment (Admin only)
export const deleteComment = async (commentId: string): Promise<void> => {
  const commentsPath = 'comments';
  try {
    await deleteDoc(doc(db, commentsPath, commentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${commentsPath}/${commentId}`);
    throw error;
  }
};

// Fetch comments for a specific post
export const getComments = async (postId: string): Promise<BlogComment[]> => {
  const commentsPath = 'comments';
  const alias = slugAliases[postId];
  const queryIds = alias && alias !== postId ? [postId, alias] : [postId];

  try {
    const q = query(
      collection(db, commentsPath), 
      where('postId', 'in', queryIds)
    );
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        postId: data.postId,
        authorName: data.authorName,
        content: data.content,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
      } as BlogComment;
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Comments query failed, returning empty list:', error);
    return [];
  }
};

// Fetch ALL comments for administrative moderation
export const getAllComments = async (): Promise<BlogComment[]> => {
  const commentsPath = 'comments';
  try {
    const q = query(
      collection(db, commentsPath),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        postId: data.postId,
        authorName: data.authorName,
        content: data.content,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
      } as BlogComment;
    });
  } catch (error) {
    console.warn('All comments query failed, returning empty list:', error);
    return [];
  }
};

// Add a comment to a specific post
export const createComment = async (comment: Omit<BlogComment, 'id' | 'createdAt'>): Promise<string> => {
  const commentsPath = 'comments';
  try {
    const commentData = {
      ...comment,
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, commentsPath), commentData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, commentsPath);
    throw error;
  }
};
