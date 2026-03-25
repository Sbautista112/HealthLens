import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

/**
 * Call once at startup. Uses in order:
 * - `FIREBASE_SERVICE_ACCOUNT_JSON` (full JSON string) for local/dev
 * - `applicationDefault()` which honors `GOOGLE_APPLICATION_CREDENTIALS` or GCP metadata
 */
export function initFirebaseAdmin(): void {
  if (getApps().length > 0) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    initializeApp({ credential: cert(parsed) });
    return;
  }

  initializeApp({ credential: applicationDefault() });
}
