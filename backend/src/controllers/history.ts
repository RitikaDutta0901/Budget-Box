// backend/src/controllers/history.ts
import { Router, Request, Response } from "express";
import { getPool } from "../db/connect";

const router = Router();

// POST /api/history?userId=...
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId || (req as any).userId);
    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const { budget } = req.body;
    const pool = getPool();

    await pool.query(
      `INSERT INTO history (user_id, snapshot, created_at)
       VALUES ($1, $2::jsonb, NOW())`,
      [userId, JSON.stringify(budget)]
    );

    return res.json({ success: true });
  } catch (err: any) {
    console.error("history.create error:", err);
    return res.status(500).json({ error: "failed to save snapshot" });
  }
});

// GET /api/history?userId=...
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId || (req as any).userId);
    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const pool = getPool();
    const q = await pool.query(
      `SELECT id, snapshot, created_at
       FROM history
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({ snapshots: q.rows });
  } catch (err: any) {
    console.error("history.list error:", err);
    return res.status(500).json({ error: "failed to fetch snapshots" });
  }
});

export default router;
