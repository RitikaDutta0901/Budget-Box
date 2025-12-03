// backend/src/controllers/budgetController.ts
import { Request, Response } from "express";
import { getPool } from "../db/connect";

function getUserIdFromReq(req: Request) {
  // prefer req.userId (if JWT middleware added later)
  const maybe = (req as any).userId || req.query.userId || req.body?.userId;
  if (!maybe) return null;
  const asNum = Number(maybe);
  return Number.isNaN(asNum) ? null : asNum;
}

/**
 * POST /api/budget/sync?userId=...
 * Body: { budget: {..., updatedAt?: ISO } }
 */
export async function postBudgetSync(req: Request, res: Response) {
  const pool = getPool();
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(400).json({ error: "userId required" });

    const incoming = req.body?.budget ?? {};
    const incomingUpdatedAt = incoming?.updatedAt ? new Date(incoming.updatedAt).toISOString() : new Date().toISOString();
    const now = new Date().toISOString();

    // Upsert/resolve with SELECT ... FOR UPDATE inside a transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const cur = await client.query("SELECT budget_data, updated_at FROM budgets WHERE user_id = $1 FOR UPDATE", [userId]);

      if (!cur.rows.length) {
        await client.query(
          "INSERT INTO budgets (user_id, budget_data, updated_at) VALUES ($1, $2::jsonb, $3)",
          [userId, JSON.stringify(incoming), now]
        );
        await client.query("COMMIT");
        return res.json({ success: true, timestamp: now, budget: incoming });
      } else {
        const server = cur.rows[0];
        const serverUpdatedAt = server.updated_at ? new Date(server.updated_at).toISOString() : null;

        if (!serverUpdatedAt || new Date(incomingUpdatedAt) >= new Date(serverUpdatedAt)) {
          await client.query("UPDATE budgets SET budget_data = $1::jsonb, updated_at = $2 WHERE user_id = $3", [
            JSON.stringify(incoming),
            now,
            userId,
          ]);
          await client.query("COMMIT");
          return res.json({ success: true, timestamp: now, budget: incoming });
        } else {
          await client.query("COMMIT");
          return res.json({ success: true, timestamp: serverUpdatedAt, budget: server.budget_data });
        }
      }
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("budget.sync error:", err);
    const dev = process.env.NODE_ENV !== "production";
    return res.status(500).json({ error: "sync failed", detail: dev ? { message: err.message, stack: err.stack } : undefined });
  }
}

/**
 * GET /api/budget/latest?userId=...
 */
export async function getLatestBudget(req: Request, res: Response) {
  const pool = getPool();
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(400).json({ error: "userId required" });

    const q = await pool.query("SELECT budget_data, updated_at FROM budgets WHERE user_id = $1", [userId]);
    if (!q.rows.length) return res.status(204).end();

    const row = q.rows[0];
    return res.json({ latest: { budget: row.budget_data, updatedAt: row.updated_at } });
  } catch (err: any) {
    console.error("budget.latest error:", err);
    const dev = process.env.NODE_ENV !== "production";
    return res.status(500).json({ error: "fetch latest failed", detail: dev ? { message: err.message, stack: err.stack } : undefined });
  }
}