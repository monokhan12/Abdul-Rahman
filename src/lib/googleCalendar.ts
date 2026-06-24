import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, Auth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);

// Provider with required scope
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Try to check if token exists, otherwise set to null
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Google Sign-In with popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Retrieve token
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Sign Out
export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Interface for Event Details
export interface MeetEventDetails {
  summary: string;
  description: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  attendeeEmail: string;
}

// Google Calendar API call to schedule event with Google Meet
export const scheduleGoogleMeet = async (
  token: string,
  details: MeetEventDetails
): Promise<any> => {
  const requestId = Math.random().toString(36).substring(2, 15);
  
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: details.summary,
        description: details.description,
        start: {
          dateTime: details.startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        },
        end: {
          dateTime: details.endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        },
        attendees: [
          { email: details.attendeeEmail },
          { email: 'quanticschool@gmail.com' }, // Abdul's email
        ],
        conferenceData: {
          createRequest: {
            requestId: requestId,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Calendar API Error: ${errorText}`);
  }

  return response.json();
};

// Fetch upcoming calendar events (to show scheduled meetings)
export const fetchUpcomingEvents = async (token: string): Promise<any[]> => {
  const now = new Date().toISOString();
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&orderBy=startTime&singleEvents=true&maxResults=15`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Calendar API Error: ${errorText}`);
  }

  const data = await response.json();
  return data.items || [];
};
