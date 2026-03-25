import { Router } from "express";
import { verifyFirebaseAuth } from "../middleware/verifyFirebaseAuth.js";

const router = Router();

router.use(verifyFirebaseAuth);

router.get("/me", (req, res) => {
  const uid = req.firebaseUser?.uid;
  if (!uid) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "No user context" });
    return;
  }
  res.json({ uid });
});

router.post("/uploads", (_req, res) => {
  res.status(501).json({
    code: "NOT_IMPLEMENTED",
    message:
      "Upload pipeline not wired yet. Expect signed URL or Storage path under users/{uid}/…",
  });
});

router.post("/classify", (_req, res) => {
  res.status(501).json({
    code: "NOT_IMPLEMENTED",
    message:
      "Classification stub. Body may include imageRef or imageUrl for the ML adapter.",
    jobId: `stub-${Date.now()}`,
  });
});

router.get("/classify/:jobId", (req, res) => {
  res.status(501).json({
    code: "NOT_IMPLEMENTED",
    message: "Job status + classifier JSON not implemented yet.",
    jobId: req.params.jobId,
  });
});

export default router;
