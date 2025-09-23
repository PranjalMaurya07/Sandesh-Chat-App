import express from "express";
import { getAllUsers } from "../controllers/users.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/users", authMiddleware, getAllUsers);

export default router;
