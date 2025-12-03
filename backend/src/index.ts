// backend/index.ts
import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const DATA_DIR = path.join(__dirname, "..", "data"); // if compiled to dist, adjust accordingly
const STORE_FILE = path.join(DATA_DIR, "store.json");

// -- Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// -- Persistent store shape
interface SnapshotEntry {
  id: string;
  created_at: string;
  snapshot: any;
}
interface UserStore {
  budget: any | null;
  updatedAt: string | null;
  history: SnapshotEntry[];
}
interface Store {
  users: Record<string, UserStore>;
  tokens: Record<string, string>; // token -> userId
}

let store: Store = { users: {}, tokens: {} };

// load store from file if present
if (fs.existsSync(STORE_FILE)) {
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    store = JSON.parse(raw) as Store;
    // ensure keys exist
    store.users = store.users || {};
    store.tokens = store.tokens || {};
  } catch (e) {
    console.error("Failed to parse store.json; starting with empty store", e);
    store = { users: {}, tokens: {} };
  }
}

function persist() {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

function ensureUser(userId?: string | number) {
  const id = String(userId ?? "1");
  if (!store.users[id]) {
    store.users[id] = { budget: null, updatedAt: null, history: [] };
  }
  return store.users[id];
}

/** Very small helper to get userId from token or fallback to explicit param */
function getUserIdFromReq(req: Request): string | null {
  // 1) check Authorization header
  const auth = (req.headers["authorization"] || "") as string;
  if (auth.startsWith("Bearer ")) {
    const token = auth.slice(7).trim();
    if (token && store.tokens[token]) return store.tokens[token];
  }
  // 2) check query.userId
  if (req.query.userId) return String(req.query.userId);
  // 3) check body.userId
  if ((req as any).body && (req as any).body.userId) return String((req as any).body.userId);
  // fallback
  return null;
}

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

// --- Auth: POST /api/auth/login
// Simple mock: accepts any email/password (for dev) and returns userId and token.
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  // For dev, create a deterministic userId from email (so same email -> same user)
  const userId = crypto.createHash("sha1").update(email).digest("hex").slice(0, 8);

  // generate token and map to user
  const token = crypto.randomBytes(24).toString("hex");
  store.tokens[token] = userId;
  ensureUser(userId);
  persist();

  return res.json({ userId, token });
});

// --- GET /api/history?userId=1
app.get("/api/history", (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req) || "1";
  const user = ensureUser(userId);
  // return newest-first to help UI
  const snaps = user.history.slice().reverse();
  res.json({ snapshots: snaps });
});

// --- POST /api/history
// body: { userId?, snapshot }
app.post("/api/history", (req: Request, res: Response) => {
  const reqUserId = getUserIdFromReq(req) || "1";
  const { snapshot } = req.body || {};
  if (!snapshot) return res.status(400).json({ error: "snapshot required" });

  const user = ensureUser(reqUserId);
  const id = crypto.randomUUID();
  const entry: SnapshotEntry = { id, created_at: new Date().toISOString(), snapshot };
  user.history.push(entry);
  persist();
  return res.json({ ok: true, snapshot: entry });
});

// --- DELETE /api/history/:userId/:id
// Also support DELETE /api/history/:id for token-authenticated user
app.delete("/api/history/:param1/:param2?", (req: Request, res: Response) => {
  // if both params present -> /history/:userId/:id
  // if only param1 present -> could be /history/:id (anonymous) or /history/:userId (we won't treat that)
  const { param1, param2 } = req.params as any;

  let userId: string;
  let id: string | undefined;

  if (param2) {
    // path was /history/:userId/:id
    userId = String(param1);
    id = String(param2);
  } else {
    // path was /history/:id -> try token -> user
    id = String(param1);
    const tokenUser = getUserIdFromReq(req);
    userId = tokenUser ?? String(req.query.userId ?? "1");
  }

  const user = ensureUser(userId);
  const before = user.history.length;
  user.history = user.history.filter((h) => h.id !== id);
  persist();
  res.json({ ok: true, deleted: before - user.history.length });
});

// --- POST /api/history/:userId/:id/restore
// Also support /api/history/:id/restore for token-authenticated user
app.post("/api/history/:param1/:param2?/restore", (req: Request, res: Response) => {
  const { param1, param2 } = req.params as any;
  let userId: string;
  let id: string;

  if (param2) {
    userId = String(param1);
    id = String(param2);
  } else {
    id = String(param1);
    userId = getUserIdFromReq(req) || String(req.query.userId ?? "1");
  }

  const user = ensureUser(userId);
  const snap = user.history.find((h) => h.id === id);
  if (!snap) return res.status(404).json({ error: "snapshot not found" });
  user.budget = snap.snapshot;
  user.updatedAt = new Date().toISOString();
  persist();
  return res.json({ ok: true, budget: user.budget, updatedAt: user.updatedAt });
});

// --- POST /api/budget/sync
// body: { userId?, budget }
app.post("/api/budget/sync", (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req) || "1";
  const { budget } = req.body || {};
  if (!budget) return res.status(400).json({ error: "budget required" });
  const user = ensureUser(userId);
  user.budget = budget;
  user.updatedAt = new Date().toISOString();
  persist();
  return res.json({ ok: true, budget: user.budget, updatedAt: user.updatedAt, timestamp: user.updatedAt });
});

// --- GET /api/budget/latest?userId=1
app.get("/api/budget/latest", (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req) || String(req.query.userId ?? "1");
  const user = ensureUser(userId);
  if (!user.budget) return res.json({ latest: null });
  return res.json({ latest: { budget: user.budget, updatedAt: user.updatedAt } });
});

// --- health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// start server
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
  console.log(`Data file: ${STORE_FILE}`);
});
