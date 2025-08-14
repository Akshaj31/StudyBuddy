import express from "express";
import {
	loginUser,
	registerUser,
	loginUserWithGoogle,
	loginUserWithGithub,
	verifyUserToken,
	getUserProfile,
	updateUserProfile,
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

export default router;
