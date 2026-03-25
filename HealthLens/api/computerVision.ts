// ─── Vision Analysis Model ────────────────────────────────────────────────────

import { Timestamp } from "firebase/firestore";

export interface VisionAnalysis {
  id: string;
  imageId: string; // ref to ImageUpload
  uid: string; // owner
  rawResult: string; // raw output from vision model
  createdAt: Timestamp;
}

// ─── LLM Result Model ────────────────────────────────────────────────────────

export interface LLMResult {
  id: string;
  imageId: string; // ref to ImageUpload
  analysisId: string; // ref to VisionAnalysis
  uid: string; // owner
  response: string; // final text shown to user
  createdAt: Timestamp;
}
