import { Router } from "express";
import { getAdminDashboard, getMemberDashboard } from "../controllers/dashboardController.js";
import protectedRoutes from "../middleware/protectedRoutes.js";

const router = Router();

// GET /api/dashboard/admin  — Admin dashboard (stats + recent activity)
router.get("/admin", protectedRoutes, getAdminDashboard);

// GET /api/dashboard/member — Member dashboard (current loans + history)
router.get("/member", protectedRoutes, getMemberDashboard);

export default router;
