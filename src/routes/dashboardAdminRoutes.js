import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleBasedAuth } from "../middleware/roleBasedAccessMiddleware.js";
import { getDashboardStats } from "../controllers/adminDashboardControllers.js";

const router = Router();

router.get("/dashboard/stats", authMiddleware, roleBasedAuth(['admin']), getDashboardStats);

export default router