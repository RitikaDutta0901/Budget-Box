import { Router, Request, Response } from "express";
import { getPool } from "../db/connect";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

/**
 * POST /api/auth/login
 * body: { email, password }
 * returns: { userId, token }
 */
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email+password required" });

  try {
    const pool = getPool();
    const r = await pool.query("SELECT id, password_hash FROM users WHERE email = $1", [email]);
    if (!r.rows.length) return res.status(401).json({ error: "Invalid credentials" });

    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const secret = process.env.JWT_SECRET || "dev-secret";
    const token = jwt.sign({ sub: user.id }, secret, { expiresIn: "7d" });

    return res.json({ userId: user.id, token });
  } catch (err) {
    console.error("auth.login error", err);
    return res.status(500).json({ error: "login failed" });
  }
});

/**
 * Optional: create test user (for dev)
 * POST /api/auth/register { email, password }
 */
router.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email+password required" });

  try {
    const pool = getPool();
    const hash = await bcrypt.hash(password, 10);
    const q = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
      [email, hash]
    );
    const userId = q.rows[0].id;
    const secret = process.env.JWT_SECRET || "dev-secret";
    const token = jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
    return res.json({ userId, token });
  } catch (err: any) {
    console.error("auth.register error", err);
    if (err.code === "23505") return res.status(400).json({ error: "Email already exists" });
    return res.status(500).json({ error: "register failed" });
  }
});

export default router;
