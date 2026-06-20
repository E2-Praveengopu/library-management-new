import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dbSequelize } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import protectedRoutes from "./middleware/protectedRoutes.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Public routes (no token required)
app.use("/api/auth", authRoutes);

// Book routes
app.use("/api/books", bookRoutes);

// Loan routes
app.use("/api/loans", loanRoutes);

// Member routes
app.use("/api/members", memberRoutes);

// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);

// Protected routes (token required)
app.get("/api/me", protectedRoutes, (req, res) => {
    res.status(200).json({
        success: true,
        message: "You are authenticated",
        data: {
            user: req.user,
        },
    });
});

try {
  await dbSequelize.authenticate();
  console.log('Connection has been established successfully.');
  await dbSequelize.sync({ alter: true });
  console.log('All models synced.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}



app.listen(PORT,()=>{
    console.log(`server listening to the port ${PORT}`);
});