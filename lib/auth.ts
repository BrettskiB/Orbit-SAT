import type { StudentProfile } from "./types";

/**
 * Boundary for a future Supabase/Auth.js adapter. UI code should depend on
 * this shape instead of a specific authentication provider.
 */
export interface AuthService {
  getCurrentStudent(): Promise<StudentProfile | null>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
}
