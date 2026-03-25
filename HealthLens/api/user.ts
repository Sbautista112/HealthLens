import { Timestamp } from "firebase/firestore";

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "user";
export type AuthProvider = "google" | "email";

// ─── User Model ───────────────────────────────────────────────────────────────

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  authProvider: AuthProvider;
  createdAt: Timestamp;
  lastLoginAt: Timestamp | null;
}
