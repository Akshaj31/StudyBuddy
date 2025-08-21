import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import admin from "../services/firebaseService.js"; // Firebase Admin SDK

// Email/password registration
export const registerUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const username = email.split("@")[0];

		const newUser = new User({
			email,
			username,
			passwordHash: hashedPassword,
			authProvider: "email",
		});

		await newUser.save();

		const token = jwt.sign(
			{ id: newUser._id, email: newUser.email },
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

		return res.status(201).json({
			message: "User registered successfully",
			token,
			user: {
				id: newUser._id,
				email: newUser.email,
				username,
			},
		});
	} catch (error) {
		console.error("[Register Error]", error);
		return res.status(500).json({ message: "Server Error" });
	}
};

// Email/password login
export const loginUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: "User does not exist" });
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
		if (!isPasswordCorrect) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		const token = jwt.sign(
			{ id: user._id, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

		return res.status(200).json({
			message: "Login Successful",
			token,
			user: {
				id: user._id,
				email: user.email,
				username: user.username,
			},
		});
	} catch (error) {
		console.error("[Login Error]", error);
		return res.status(500).json({ message: "Server Error" });
	}
};

// Google Sign-In via Firebase
export const loginUserWithGoogle = async (req, res) => {
	try {
		const { idToken } = req.body;
		if (!idToken) {
			return res.status(400).json({ message: "No token provided" });
		}

		// Verify Firebase ID token
		const decodedToken = await admin.auth().verifyIdToken(idToken);
		const { uid, email, name, picture } = decodedToken;

		// Find or create user
		let user = await User.findOne({ email });
		if (!user) {
			user = await User.create({
				uid: uid, // Use uid instead of firebaseUid
				email,
				username: name || email.split("@")[0],
				fullName: name || "",
				authProvider: "google",
			});
		}

		// Create JWT for our app
		const token = jwt.sign(
			{ id: user._id, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

		return res.json({
			message: "Login successful",
			token,
			user,
		});
	} catch (error) {
		console.error("Google login error:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// GitHub Sign-In via Firebase
export const loginUserWithGithub = async (req, res) => {
	try {
		const { idToken } = req.body;
		if (!idToken) {
			return res.status(400).json({ message: "No token provided" });
		}

		// Verify Firebase ID token
		const decodedToken = await admin.auth().verifyIdToken(idToken);

		// GitHub tokens might have different field names
		const uid = decodedToken.uid || decodedToken.user_id;
		let email =
			decodedToken.email || decodedToken.firebase?.identities?.email?.[0];
		const name = decodedToken.name || decodedToken.display_name;
		const picture = decodedToken.picture || decodedToken.photo_url;

		// Handle case where GitHub doesn't provide email (private email settings)
		if (!email) {
			// Get GitHub username from the Firebase identities
			const githubId = decodedToken.firebase?.identities?.["github.com"]?.[0];
			if (githubId) {
				// Create a unique identifier using GitHub ID
				email = `github_${githubId}@placeholder.local`;
			} else {
				// Fallback to using Firebase UID
				email = `github_${uid}@placeholder.local`;
			}
		}

		// Find or create user - first try by Firebase UID, then by email
		let user = await User.findOne({
			$or: [{ uid: uid }, { email: email }],
		});

		if (!user) {
			user = await User.create({
				uid: uid,
				email,
				username: name || `github_user_${uid.substring(0, 8)}`,
				fullName: name || "",
				authProvider: "github",
			});
		} else {
			// Update the user's info if it was found by UID but has different email
			if (user.email !== email) {
				user.email = email;
				await user.save();
			}
		}

		// Create JWT for our app
		const token = jwt.sign(
			{ id: user._id, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

		return res.json({
			message: "GitHub login successful",
			token,
			user,
		});
	} catch (error) {
		console.error("GitHub login error:", error);
		console.error("Error stack:", error.stack); // More detailed error info
		res.status(500).json({
			message: "Internal server error",
			error: error.message, // Include error message for debugging
		});
	}
};

// Verify existing token and return user data (for automatic login)
export const verifyUserToken = async (req, res) => {
	try {
		// The user is already attached to req by the verifyToken middleware
		const user = req.user;

		return res.json({
			message: "Token valid",
			user: {
				id: user._id,
				email: user.email,
				username: user.username,
				avatar: user.avatar,
				authProvider: user.authProvider,
				createdAt: user.createdAt,
				lastActive: user.lastActive,
			},
			authenticated: true,
		});
	} catch (error) {
		console.error("Token verification error:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Get user profile (protected route)
export const getUserProfile = async (req, res) => {
	try {
		const user = req.user;

		return res.json({
			user: {
				id: user._id,
				email: user.email,
				username: user.username,
				avatar: user.avatar,
				authProvider: user.authProvider,
				role: user.role,
				createdAt: user.createdAt,
				lastActive: user.lastActive,
				settings: user.settings,
			},
		});
	} catch (error) {
		console.error("Get profile error:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Update user profile
export const updateUserProfile = async (req, res) => {
	try {
		const { username, avatar } = req.body;
		const userId = req.userId;

		const updateData = {};
		if (username) updateData.username = username;
		if (avatar) updateData.avatar = avatar;

		const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
			new: true,
			select: "-passwordHash",
		});

		return res.json({
			message: "Profile updated successfully",
			user: updatedUser,
		});
	} catch (error) {
		console.error("Update profile error:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Get all chat sessions for a user
export const getChatSessions = async (req, res) => {
	try {
		const userId = req.userId || req.user._id;

		const user = await User.findById(userId).select("chatSessions");
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Return sessions sorted by most recent
		const sessions = user.chatSessions.sort(
			(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
		);

		return res.status(200).json({ sessions });
	} catch (error) {
		console.error("Error getting chat sessions:", error);
		return res.status(500).json({ error: "Failed to get chat sessions" });
	}
};

// Get a specific chat session with messages
export const getChatSession = async (req, res) => {
	try {
		const userId = req.userId || req.user._id;
		const { sessionId } = req.params;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const session = user.chatSessions.find((s) => s.sessionId === sessionId);
		if (!session) {
			return res.status(404).json({ error: "Chat session not found" });
		}

		return res.status(200).json(session);
	} catch (error) {
		console.error("Error getting chat session:", error);
		return res.status(500).json({ error: "Failed to get chat session" });
	}
};

// Delete a chat session
export const deleteChatSession = async (req, res) => {
	try {
		const userId = req.userId || req.user._id;
		const { sessionId } = req.params;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Remove the session from the array
		user.chatSessions = user.chatSessions.filter(
			(s) => s.sessionId !== sessionId
		);
		await user.save();

		return res
			.status(200)
			.json({ message: "Chat session deleted successfully" });
	} catch (error) {
		console.error("Error deleting chat session:", error);
		return res.status(500).json({ error: "Failed to delete chat session" });
	}
};

// Get user's uploaded documents (simple projection)
export const getUserDocuments = async (req, res) => {
	try {
		const user = req.user; // populated by verifyToken middleware
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		return res.status(200).json({ documents: user.documents || [] });
	} catch (error) {
		console.error("Error getting user documents:", error);
		return res.status(500).json({ error: "Failed to get documents" });
	}
};

// Get aggregated dashboard data
export const getDashboardData = async (req, res) => {
	try {
		const user = req.user;
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Basic aggregation from stored fields; can be expanded with real calculations
		const data = {
			stats: {
				totalStudyHours: user.totalStudyHours || 0,
				subjectsMastered: user.subjectsMastered || 0,
				averageScore: user.averageScore || 0,
				studyStreakDays: user.studyStreakDays || 0,
			},
			recentActivity: (user.recentActivity || [])
				.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
				.slice(0, 10),
			documentsCount: (user.documents || []).length,
			chatSessionsCount: (user.chatSessions || []).length,
		};

		return res.status(200).json(data);
	} catch (error) {
		console.error("Error getting dashboard data:", error);
		return res.status(500).json({ error: "Failed to get dashboard data" });
	}
};
