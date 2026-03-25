# HealthLens API (Express)

REST API for the HealthLens React Native (Expo) app and future web clients. It sits **beside** the mobile app in this repo (`HealthLens/backend/`) so the frontend team can call stable, versioned HTTP endpoints while Firebase remains the database and storage layer.

## What this backend adds

| Area | Implementation |
|------|----------------|
| **Runtime** | Node.js, Express 4, TypeScript (`module: NodeNext`, ESM imports). |
| **Config** | `dotenv` loads `.env` at startup; see `.env.example`. |
| **Auth** | Every `/api/v1/*` route runs **`verifyFirebaseAuth`**: reads `Authorization: Bearer <Firebase ID token>`, verifies with **firebase-admin**, attaches `req.firebaseUser` (decoded JWT). Missing/invalid tokens return `401` with `{ code, message }`. |
| **Firebase Admin** | **`src/firebaseAdmin.ts`** — `initFirebaseAdmin()` uses `FIREBASE_SERVICE_ACCOUNT_JSON` or **`applicationDefault()`** (honors `GOOGLE_APPLICATION_CREDENTIALS` on GCP or locally). Must be the **same Firebase project** as the Expo app. |
| **CORS** | Configurable via **`CORS_ORIGINS`** (comma-separated). If unset, all origins are allowed (dev only; tighten for production). |
| **JSON body** | `express.json({ limit: "10mb" })` for future image metadata / classify payloads. |

## Project layout

```
backend/
├── .env.example          # Copy to .env — never commit real secrets
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts              # App entry: CORS, JSON, /health, mounts /api/v1
    ├── firebaseAdmin.ts      # One-time Firebase Admin initialization
    ├── middleware/
    │   └── verifyFirebaseAuth.ts
    ├── routes/
    │   └── v1.ts             # Versioned API routes (all behind auth middleware)
    └── types/
        └── express.d.ts      # req.firebaseUser typing
```

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
| `GET` | `/health` | No | Liveness: `{ "status": "ok" }` |
| `GET` | `/api/v1/me` | Bearer Firebase ID token | `{ "uid": "..." }` |
| `POST` | `/api/v1/uploads` | Bearer | **`501`** — skeleton for per-user uploads (signed URLs, Storage paths under `users/{uid}/…`) |
| `POST` | `/api/v1/classify` | Bearer | **`501`** — skeleton for starting classification; placeholder `jobId` in body |
| `GET` | `/api/v1/classify/:jobId` | Bearer | **`501`** — skeleton for job status + classifier JSON |

Send `Authorization: Bearer <idToken>` where `<idToken>` is from Firebase Auth (`user.getIdToken()`). The Expo app can use `useAuth().getIdToken()` or `useFetchWithAuth()` from `HealthLens/app/AuthContext.tsx`.

### Error shape (auth failures)

```json
{ "code": "UNAUTHORIZED", "message": "..." }
```

## Mobile app base URL

In the Expo app, set `EXPO_PUBLIC_API_BASE_URL` (e.g. `http://localhost:3000` for a simulator pointing at your machine) and use `fetchWithAuth` / `useFetchWithAuth` to call this API.

## CORS

`CORS_ORIGINS` is a comma-separated list. For Expo web or tunnel URLs, add those origins explicitly in production.

## Roadmap (not implemented yet)

These are the natural next steps on top of this skeleton:

- **`POST /api/v1/uploads`** — Generate Firebase Storage **signed upload URLs** or accept server-side uploads, scoped to **`users/{uid}/`**.
- **`POST /api/v1/classify`** — Accept `imageRef` / `imageUrl`, enqueue or call an **ML adapter** (Vertex AI, Cloud Run, external HTTP model).
- **`GET /api/v1/classify/:jobId`** — Poll async jobs; return **classifier JSON** when inference completes (optionally persist results in Firestore from the API).
- **Rate limiting**, structured logging, request IDs, and **Firestore security rules** aligned with per-`uid` data.
