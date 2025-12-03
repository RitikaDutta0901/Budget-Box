// frontend/lib/api.ts
// Normalizes API base so endpoints always map to /api/*
// (prevents accidental requests to /history instead of /api/history)
const RAW_API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string | undefined) || "http://localhost:5000";

// Ensure API_BASE always has no trailing slash and includes '/api' path
function normalizeApiBase(raw: string) {
  let base = raw.trim();
  // remove trailing slash(es)
  base = base.replace(/\/+$/, "");
  // if already ends with /api, use as-is
  if (base.endsWith("/api")) return base;
  // otherwise append /api
  return `${base}/api`;
}
export const API_BASE = normalizeApiBase(RAW_API_BASE);

export const AUTH_URL = `${API_BASE}/auth/login`;
export const SYNC_URL = `${API_BASE}/budget/sync`;
export const LATEST_URL = `${API_BASE}/budget/latest`;
export const HISTORY_URL = `${API_BASE}/history`;

// small types
type Json = Record<string, any>;

/** Debug log to confirm runtime base */
console.info("[API] API_BASE =", API_BASE);

/** Parse response and throw helpful error for non-OK responses */
async function handleResp(res: Response): Promise<Json> {
  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || res.statusText || "API error";
    throw new Error(message);
  }
  return data;
}

/** Auth token helpers (persist token in localStorage) */
const TOKEN_KEY = "budgetbox_token";
export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Always-returning headers object (avoids TS union/null headaches) */
function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Small helper to build HeadersInit safely */
function buildHeaders(contentType?: string): HeadersInit {
  const base = authHeaders();
  if (contentType) {
    return { "Content-Type": contentType, ...base } as HeadersInit;
  }
  return base as HeadersInit;
}

/* ------------------------------
   Authentication
   ------------------------------ */

/**
 * login(email, password)
 * - POST /api/auth/login
 * - stores token in localStorage if returned
 */
export async function login(email: string, password: string): Promise<Json> {
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: buildHeaders("application/json"),
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResp(res);
  if (data?.token) setAuthToken(data.token);
  return data;
}

/* ------------------------------
   Snapshot + Budget API
   ------------------------------ */

/**
 * fetchSnapshots(userId?)
 * GET /api/history?userId=1
 */
export async function fetchSnapshots(userId?: number): Promise<Json> {
  const url = typeof userId !== "undefined" ? `${HISTORY_URL}?userId=${encodeURIComponent(String(userId))}` : HISTORY_URL;
  const res = await fetch(url, {
    method: "GET",
    headers: buildHeaders(),
    credentials: "include",
  });
  return handleResp(res);
}

/**
 * saveSnapshot(userId?, snapshot)
 * POST /api/history
 * body: { userId?, snapshot }
 */
export async function saveSnapshot(userId: number | undefined, snapshot: any): Promise<Json> {
  const payload: any = { snapshot };
  if (typeof userId !== "undefined") payload.userId = userId;

  // debug logging to help diagnose network issues
  console.info("[saveSnapshot] POST", HISTORY_URL, "payload:", payload, "token:", getAuthToken());

  const res = await fetch(HISTORY_URL, {
    method: "POST",
    headers: buildHeaders("application/json"),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResp(res);
}

/**
 * deleteSnapshot(userId?, id)
 * DELETE /api/history/:userId/:id  OR  DELETE /api/history/:id (token-auth)
 */
export async function deleteSnapshot(userId: number | undefined, id: string | number): Promise<Json> {
  const url =
    typeof userId !== "undefined"
      ? `${HISTORY_URL}/${encodeURIComponent(String(userId))}/${encodeURIComponent(String(id))}`
      : `${HISTORY_URL}/${encodeURIComponent(String(id))}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: buildHeaders(),
    credentials: "include",
  });
  return handleResp(res);
}

/**
 * restoreSnapshot(userId?, id)
 * POST /api/history/:userId/:id/restore  OR  /api/history/:id/restore (token-auth)
 */
export async function restoreSnapshot(userId: number | undefined, id: string | number): Promise<Json> {
  const url =
    typeof userId !== "undefined"
      ? `${HISTORY_URL}/${encodeURIComponent(String(userId))}/${encodeURIComponent(String(id))}/restore`
      : `${HISTORY_URL}/${encodeURIComponent(String(id))}/restore`;
  const res = await fetch(url, {
    method: "POST",
    headers: buildHeaders(),
    credentials: "include",
  });
  return handleResp(res);
}

/* ------------------------------
   Sync / Latest
   ------------------------------ */

/**
 * syncBudgetToServer({ userId?, budget })
 * POST /api/budget/sync
 */
export async function syncBudgetToServer(payload: { userId?: number; budget: any }): Promise<Json> {
  const res = await fetch(SYNC_URL, {
    method: "POST",
    headers: buildHeaders("application/json"),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResp(res);
}

/**
 * fetchLatestBudget(userId?)
 * GET /api/budget/latest?userId=1
 */
export async function fetchLatestBudget(userId?: number): Promise<Json> {
  const url = typeof userId !== "undefined" ? `${LATEST_URL}?userId=${encodeURIComponent(String(userId))}` : LATEST_URL;
  const res = await fetch(url, {
    method: "GET",
    headers: buildHeaders(),
    credentials: "include",
  });
  return handleResp(res);
}

/* Backwards/alternate compatibility helpers */
export async function syncBudget(budget: any): Promise<Json> {
  return syncBudgetToServer({ budget });
}
export async function fetchLatest(): Promise<Json> {
  return fetchLatestBudget();
}
