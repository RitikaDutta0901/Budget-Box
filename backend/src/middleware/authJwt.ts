import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function attachUserFromBearer(req: Request, _res: Response, next: NextFunction) {
  try {
    const auth = String(req.header("authorization") || "");
    if (!auth.startsWith("Bearer ")) return next();
    const token = auth.slice(7);
    const secret = process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(token, secret) as any;
    if (payload && payload.sub) {
      (req as any).userId = Number(payload.sub);
    }
  } catch (err) {
    // don't block — endpoints will check for userId where required
    console.warn("attachUserFromBearer failed:", (err as any)?.message ?? err);
  } finally {
    next();
  }
}