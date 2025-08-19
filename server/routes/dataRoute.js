import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
	getUserDocuments,
	getUserChatSessions,
	getChatSession,
	deleteDocument,
	deleteChatSession,
} from "../controller/dataController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Document routes
router.get("/documents", getUserDocuments);
router.delete("/documents/:documentId", deleteDocument);

// Chat session routes
router.get("/chats", getUserChatSessions);
router.get("/chats/:sessionId", getChatSession);
router.delete("/chats/:sessionId", deleteChatSession);

export default router;
