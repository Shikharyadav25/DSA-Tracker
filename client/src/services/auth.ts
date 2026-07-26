import { auth, googleProvider } from './firebase';
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { User } from '../types/types';
import { USER_KEY, setCurrentUid } from './storage';

export interface AppUser extends User {
  uid: string;
  isGuest?: boolean;
}

export let currentUser: AppUser | null = null;
export let authMode: 'login' | 'signup' = 'login';
let authObserverCallback: ((user: AppUser | null) => void) | null = null;

export function setAuthMode(mode: 'login' | 'signup') {
  authMode = mode;
}

export function initials(name: string): string {
  return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

export async function loginAsGuest(): Promise<void> {
  currentUser = {
    uid: 'guest',
    name: 'Guest User',
    email: 'guest@example.com',
    provider: 'email',
    isGuest: true
  };
  setCurrentUid('guest');
  window.localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
  if (authObserverCallback) {
    authObserverCallback(currentUser);
  }
}

export function formatAuthError(error: any): string {

  if (!error) return 'An unknown authentication error occurred.';
  const code = error.code || '';
  const message = error.message || '';

  if (code === 'auth/unauthorized-domain' || message.includes('auth/unauthorized-domain')) {
    const currentDomain = window.location.hostname || 'your domain';
    return `Domain non-authorized (${currentDomain}). In Firebase Console -> Authentication -> Settings -> Authorized Domains, please add "${currentDomain}".`;
  }
  if (code === 'auth/operation-not-allowed' || message.includes('auth/operation-not-allowed')) {
    return 'Google Sign-In is disabled in your Firebase project. Go to Firebase Console -> Authentication -> Sign-in method -> Google and click Enable.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Sign-in popup was blocked by your browser. Please disable popup blocker for this site or click Continue with Google again.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Google Sign-In popup was closed before completing.';
  }
  if (code === 'auth/cancelled-popup-request') {
    return 'Sign-in request was cancelled.';
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return 'An account already exists with the same email address using a different sign-in method.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  if (code === 'auth/invalid-api-key') {
    return 'Invalid Firebase API Key. Please verify your client/.env configuration.';
  }
  return message || 'Authentication failed. Please try again.';
}

export async function loginWithGoogle(): Promise<{ success: boolean; error?: string }> {
  try {
    window.localStorage.removeItem(USER_KEY);
    await signInWithPopup(auth, googleProvider);
    return { success: true };
  } catch (error: any) {
    console.error('Google Popup Auth Error:', error);
    
    // If popup was blocked or failed, attempt redirect mode as fallback
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { success: true };
      } catch (redirectErr: any) {
        console.error('Google Redirect Auth Error:', redirectErr);
        return { success: false, error: formatAuthError(redirectErr) };
      }
    }
    
    return { success: false, error: formatAuthError(error) };
  }
}


export async function submitAuth(email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Enter a valid email address.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Password needs at least 6 characters.' };
  }
  
  window.localStorage.removeItem(USER_KEY);
  try {
    if (authMode === 'signup') {
      if (!name) {
        return { success: false, error: 'Tell us your name.' };
      }
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      return { success: true };
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    }
  } catch (error: any) {
    let msg = error.message || 'Authentication error.';
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      msg = 'Invalid email/password combination. If you originally registered using Google, click "Continue with Google" above.';
    } else if (error.code === 'auth/email-already-in-use') {
      msg = 'An account with this email already exists. If registered via Google, click "Continue with Google" above, or Sign In with password.';
    } else if (error.code === 'auth/weak-password') {
      msg = 'Password should be at least 6 characters long.';
    }
    return { success: false, error: msg };
  }
}

export async function resetPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter your valid email address in the Email field above.' };
  }
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: `Password reset link sent to ${email}. Check your inbox!` };
  } catch (error: any) {
    console.error("Password reset error:", error);
    let msg = error.message || 'Failed to send password reset email.';
    if (error.code === 'auth/user-not-found') {
      msg = 'No user account found with this email.';
    }
    return { success: false, error: msg };
  }
}

export async function logout(): Promise<void> {
  window.localStorage.removeItem(USER_KEY);
  currentUser = null;
  setCurrentUid('guest');
  if (authObserverCallback) {
    authObserverCallback(null);
  }
  await firebaseSignOut(auth);
}

// Observe state changes and run the callback with the active user context.
export function registerAuthObserver(callback: (user: AppUser | null) => void) {
  authObserverCallback = callback;

  // Handle redirect result if returning from Google Auth redirect
  getRedirectResult(auth).catch((err) => {
    if (err && err.code !== 'auth/popup-closed-by-user') {
      console.error('Google Auth Redirect error:', err);
    }
  });

  // Check if there is an active guest session in localStorage on boot
  const guestUserVal = window.localStorage.getItem(USER_KEY);
  if (guestUserVal) {
    try {
      const parsed = JSON.parse(guestUserVal);
      if (parsed.isGuest) {
        currentUser = parsed;
        setCurrentUid('guest');
        callback(currentUser);
      }
    } catch (e) {}
  }


  // Firebase auth state change listener
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      currentUser = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email || 'User',
        email: firebaseUser.email || '',
        provider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email'
      };
      setCurrentUid(firebaseUser.uid);
      window.localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      callback(currentUser);
    } else {
      // Check if we are currently a Guest. If so, don't clear state on Firebase sign out.
      const savedUserVal = window.localStorage.getItem(USER_KEY);
      if (savedUserVal) {
        try {
          const parsed = JSON.parse(savedUserVal);
          if (parsed.isGuest) return;
        } catch (e) {}
      }
      currentUser = null;
      setCurrentUid('guest');
      window.localStorage.removeItem(USER_KEY);
      callback(null);
    }
  });
}
