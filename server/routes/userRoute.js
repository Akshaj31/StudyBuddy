import express from "express";
import {
	loginUser,
	registerUser,
	loginUserWithGoogle,
	loginUserWithGithub,
	verifyUserToken,
	getUserProfile,
	updateUserProfile,
	getChatSessions,
	getChatSession,
	deleteChatSession,
} from "../controller/userController.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/google-login", loginUserWithGoogle);
router.post("/github-login", loginUserWithGithub);

// Protected routes (require authentication)
router.get("/verify-token", verifyToken, verifyUserToken);
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);

// Chat session routes
router.get("/chat-sessions", verifyToken, getChatSessions);
router.get("/chat-sessions/:sessionId", verifyToken, getChatSession);
router.delete("/chat-sessions/:sessionId", verifyToken, deleteChatSession);

export default router;
