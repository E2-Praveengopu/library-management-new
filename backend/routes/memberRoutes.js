import { Router } from "express";
import { getAllMembers, getMemberById, getMemberLoans, toggleMemberStatus } from "../controllers/memberController.js";
import protectedRoutes from "../middleware/protectedRoutes.js";

const router = Router();

router.get("/", protectedRoutes, getAllMembers);
router.get("/:id/loans", protectedRoutes, getMemberLoans);
router.get("/:id", protectedRoutes, getMemberById);
router.patch("/:id/status", protectedRoutes, toggleMemberStatus);

export default router;
