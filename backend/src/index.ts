import "dotenv/config";
import cors from "cors";
import express from "express";
import { initFirebaseAdmin } from "./firebaseAdmin.js";
import v1 from "./routes/v1.js";

initFirebaseAdmin();

const app = express();
const port = Number(process.env.PORT) || 3000;

const corsOrigins = process.env.CORS_ORIGINS?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin:
      corsOrigins && corsOrigins.length > 0 ? corsOrigins : true,
  })
);
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1", v1);

app.listen(port, () => {
  console.log(`healthlens-api listening on :${port}`);
});
