import type { NextFunction, Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";

export async function verifyFirebaseAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Missing or invalid Authorization header",
    });
    return;
  }

  const idToken = header.slice("Bearer ".length).trim();
  if (!idToken) {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Empty bearer token",
    });
    return;
  }

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    req.firebaseUser = decoded;
    next();
  } catch {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
}
