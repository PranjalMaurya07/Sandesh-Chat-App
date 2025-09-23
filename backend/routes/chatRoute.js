import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createConversation,
  getConversations,
  sendMessage,
  getMessages,
} from "../controllers/chat.js";

const router = express.Router();

router.post("/conversation", authMiddleware, createConversation);
router.get("/conversation", authMiddleware, getConversations);
router.post("/message", authMiddleware, sendMessage);
router.get("/message/:conversationId", authMiddleware, getMessages);

export default router;
