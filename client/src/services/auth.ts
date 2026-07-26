import { auth, googleProvider } from './firebase';
import { 
  signInWithPopup, 
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

export async function loginWithGoogle(): Promise<{ success: boolean; error?: string }> {
  try {
    window.localStorage.removeItem(USER_KEY);
    await signInWithPopup(auth, googleProvider);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
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
