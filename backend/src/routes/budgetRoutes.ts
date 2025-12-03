import express from "express";
import { postBudgetSync, getLatestBudget } from "../controllers/budgetController";

const router = express.Router();

router.post("/sync", postBudgetSync);
router.get("/latest", getLatestBudget);

export default router;