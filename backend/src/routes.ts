// backend/src/routes.ts
import { Router } from "express";
import path from "path";

const router = Router();

/**
 * Try to require a module and return the exported router/middleware if present.
 * Accepts multiple shapes:
 *  - module.exports = router
 *  - export default router
 *  - export const router = ...
 * If the exported value is an object but looks like a Router (has .use or .stack),
 * we'll accept it. Otherwise return null and log diagnostics.
 */
function loadController(relPath: string) {
  try {
    // require relative to this file
    const fullPath = path.join(__dirname, relPath);
    const mod = require(fullPath);
    // prefer default, but fallback to module itself
    let exported = mod && (mod.default ?? mod);

    // If exported is an object with multiple named exports, try common candidates
    if (exported && typeof exported === "object") {
      // common patterns: { router: Router }, { default: Router }, { attachUserFromBearer: fn } etc.
      if (exported.router) exported = exported.router;
      else if (exported.default && (typeof exported.default === "function" || typeof exported.default.use === "function")) {
        exported = exported.default;
      }
    }

    // final check: exported should be a function (middleware) or have .use (Router)
    if (typeof exported === "function" || (exported && typeof exported.use === "function")) {
      console.log(`[routes] Loaded controller ${relPath} -> OK`);
      return exported;
    }

    console.warn(`[routes] Controller ${relPath} loaded but is not a router/middleware. Type: ${typeof exported}`, { exported });
    return null;
  } catch (err: any) {
    console.error(`[routes] Failed to require controller ${relPath}:`, err && (err.stack || err.message || err));
    return null;
  }
}

/* Load controllers — adjust filenames if you renamed files */
const authController = loadController("./controllers/auth");
const budgetController = loadController("./controllers/budgetController");
const historyController = loadController("./controllers/history");

// Attach controllers only when valid
if (authController) router.use("/auth", authController); else console.warn("[routes] /auth unavailable");
if (budgetController) router.use("/budget", budgetController); else console.warn("[routes] /budget unavailable");
if (historyController) router.use("/history", historyController); else console.warn("[routes] /history unavailable");

export default router;
