# HealthLens API (Express)

REST API for the HealthLens mobile app and future clients. Verifies Firebase ID tokens with **firebase-admin** and exposes versioned routes under `/api/v1`.

## Setup

1. Copy `.env.example` to `.env` and fill in values. Never commit `.env` or real service account keys.
2. Install dependencies: `npm install`
3. **Firebase Admin credentials** (choose one):
   - Set `GOOGLE_APPLICATION_CREDENTIALS` to the absolute path of your downloaded service account JSON, or
   - Set `FIREBASE_SERVICE_ACCOUNT_JSON` to the raw JSON string (some deployment platforms prefer this).

The Firebase project must match the one used by the Expo app (`HealthLens/firebaseConfig.ts`).

## Scripts

- `npm run dev` — watch mode with `tsx`
- `npm run build` — compile to `dist/`
- `npm start` — run compiled `dist/index.js` (run `build` first)

## Endpoints

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `GET` | `/health` | No | Liveness |
| `GET` | `/api/v1/me` | Bearer Firebase ID token | `{ "uid": "..." }` |
| `POST` | `/api/v1/uploads` | Bearer | `501` stub — signed URLs / per-user Storage paths |
| `POST` | `/api/v1/classify` | Bearer | `501` stub — returns placeholder `jobId` |
| `GET` | `/api/v1/classify/:jobId` | Bearer | `501` stub — job result JSON |

Send `Authorization: Bearer <idToken>` where `<idToken>` is from Firebase Auth (`user.getIdToken()`). The Expo app can use `useAuth().getIdToken()` or `useFetchWithAuth()` from `app/AuthContext.tsx`.

## Mobile app base URL

In the Expo app, set `EXPO_PUBLIC_API_BASE_URL` (e.g. `http://localhost:3000` for a simulator pointing at your machine) and use `fetchWithAuth` / `useFetchWithAuth` to call this API.

## CORS

`CORS_ORIGINS` is a comma-separated list. For Expo web or tunnel URLs, add those origins explicitly in production.
