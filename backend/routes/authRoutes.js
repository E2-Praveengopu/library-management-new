import {Router} from "express";
import { signup, login } from "../controllers/authController.js";

const app = Router();

app.post("/signup",signup);
app.post("/login",login);




export default app;