import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  AuthError 
} from 'firebase/auth'
import { auth } from '../firebase/firebase'

/**
 * Login user with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns The authenticated user
 * @throws Error with readable message if login fails
 */
export async function login(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    const authError = error as AuthError
    throw new Error(getAuthErrorMessage(authError.code))
  }
}

/**
 * Logout current user
 * @throws Error with readable message if logout fails
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error) {
    const authError = error as AuthError
    throw new Error(getAuthErrorMessage(authError.code))
  }
}

/**
 * Get currently authenticated user
 * @returns The current user or null if not authenticated
 */
export function getCurrentUser(): User | null {
  return auth.currentUser
}

/**
 * Listen to authentication state changes
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function to stop listening
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

/**
 * Convert Firebase auth error codes to readable messages
 * @param code - Firebase auth error code
 * @returns Readable error message
 */
function getAuthErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Invalid email address format.',
    'auth/user-disabled': 'This user account has been disabled.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed by the user.',
    'auth/cancelled-popup-request': 'Sign-in popup was cancelled.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  }

  return errorMessages[code] || 'An authentication error occurred. Please try again.'
}
