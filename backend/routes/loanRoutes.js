import { Router } from "express";
import { issueBook, returnBook, getAllLoans, getMyLoans, getLoanById } from "../controllers/loanController.js";
import protectedRoutes from "../middleware/protectedRoutes.js";

const router = Router();

router.post("/issue", protectedRoutes, issueBook);
router.patch("/:id/return", protectedRoutes, returnBook);
router.get("/", protectedRoutes, getAllLoans);
router.get("/my-loans", protectedRoutes, getMyLoans);
router.get("/:id", protectedRoutes, getLoanById);

export default router;
