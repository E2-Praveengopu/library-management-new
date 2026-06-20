import { Router } from "express";
import { addBook, getAllBooks, getBookById, updateBook, deleteBook } from "../controllers/bookController.js";
import protectedRoutes from "../middleware/protectedRoutes.js";

const router = Router();

router.post("/", protectedRoutes, addBook);
router.get("/", protectedRoutes, getAllBooks);
router.get("/:id", protectedRoutes, getBookById);
router.put("/:id", protectedRoutes, updateBook);
router.delete("/:id", protectedRoutes, deleteBook);

export default router;
