import { Timestamp } from "firebase/firestore";

// ─── Image Model ──────────────────────────────────────────────────────────────

export interface ImageUpload {
  id: string;
  uid: string; // owner
  storageUrl: string; // Firebase Storage path
  downloadUrl: string; // public URL for display
  createdAt: Timestamp;
}
