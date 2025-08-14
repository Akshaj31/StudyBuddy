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
		console.log("Google decoded token:", decodedToken); // Debug log

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
		console.log("GitHub decoded token:", JSON.stringify(decodedToken, null, 2)); // Debug log

		// GitHub tokens might have different field names
		const uid = decodedToken.uid || decodedToken.user_id;
		let email =
			decodedToken.email || decodedToken.firebase?.identities?.email?.[0];
		const name = decodedToken.name || decodedToken.display_name;
		const picture = decodedToken.picture || decodedToken.photo_url;

		console.log("Extracted data:", { uid, email, name, picture }); // Debug log

		// Handle case where GitHub doesn't provide email (private email settings)
		if (!email) {
			// Get GitHub username from the Firebase identities
			const githubId = decodedToken.firebase?.identities?.["github.com"]?.[0];
			if (githubId) {
				// Create a unique identifier using GitHub ID
				email = `github_${githubId}@placeholder.local`;
				console.log("Created placeholder email for GitHub user:", email);
			} else {
				// Fallback to using Firebase UID
				email = `github_${uid}@placeholder.local`;
				console.log("Created fallback email using Firebase UID:", email);
			}
		}

		console.log("Final email for user creation/lookup:", email); // Debug log

		// Find or create user - first try by Firebase UID, then by email
		let user = await User.findOne({
			$or: [{ uid: uid }, { email: email }],
		});

		if (!user) {
			console.log("Creating new user for GitHub authentication"); // Debug log
			user = await User.create({
				uid: uid,
				email,
				username: name || `github_user_${uid.substring(0, 8)}`,
				fullName: name || "",
				authProvider: "github",
			});
			console.log("New user created:", user); // Debug log
		} else {
			console.log("Existing user found:", user); // Debug log
			// Update the user's info if it was found by UID but has different email
			if (user.email !== email) {
				user.email = email;
				await user.save();
				console.log("Updated user email:", email);
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
