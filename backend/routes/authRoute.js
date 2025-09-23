import express from "express";
const router = express.Router();
import {registerUser,loginUser} from "../controllers/auth.js";

// Register
router.post("/register",registerUser);

// Login
router.post("/login",loginUser);

export default router;
