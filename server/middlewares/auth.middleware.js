import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Verify JWT token middleware
export const verifyToken = async (req, res, next) => {
	try {
		// Get token from Authorization header
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return res.status(401).json({
				message: "Access denied. No token provided.",
				requiresAuth: true,
			});
		}

		// Extract token (format: "Bearer <token>")
		const token = authHeader.split(" ")[1];

		if (!token) {
			return res.status(401).json({
				message: "Access denied. Invalid token format.",
				requiresAuth: true,
			});
		}

		// Verify the token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Get user from database (optional - for fresh user data)
		const user = await User.findById(decoded.id).select("-passwordHash");

		if (!user) {
			return res.status(401).json({
				message: "Access denied. User not found.",
				requiresAuth: true,
			});
		}

		// Attach user to request object
		req.user = user;
		req.userId = decoded.id;
		req.userEmail = decoded.email;

		next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({
				message: "Access denied. Token expired.",
				requiresAuth: true,
				expired: true,
			});
		}

		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({
				message: "Access denied. Invalid token.",
				requiresAuth: true,
			});
		}

		console.error("Auth middleware error:", error);
		return res.status(500).json({
			message: "Internal server error during authentication.",
		});
	}
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			req.user = null;
			req.userId = null;
			req.userEmail = null;
			return next();
		}

		const token = authHeader.split(" ")[1];

		if (!token) {
			req.user = null;
			req.userId = null;
			req.userEmail = null;
			return next();
		}

		// Try to verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id).select("-passwordHash");

		if (user) {
			req.user = user;
			req.userId = decoded.id;
			req.userEmail = decoded.email;
		} else {
			req.user = null;
			req.userId = null;
			req.userEmail = null;
		}

		next();
	} catch (error) {
		// Don't fail on optional auth
		req.user = null;
		req.userId = null;
		req.userEmail = null;
		next();
	}
};

// Check if user has specific roles/permissions
export const requireRole = (roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({
				message: "Access denied. Authentication required.",
			});
		}

		// Check if user has required role
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				message: "Access denied. Insufficient permissions.",
			});
		}

		next();
	};
};

// Rate limiting per user
export const rateLimitByUser = (
	maxRequests = 100,
	windowMs = 15 * 60 * 1000
) => {
	const requests = new Map();

	return (req, res, next) => {
		const userId = req.userId || req.ip;
		const now = Date.now();

		// Clean old entries
		for (const [key, data] of requests.entries()) {
			if (now - data.firstRequest > windowMs) {
				requests.delete(key);
			}
		}

		const userRequests = requests.get(userId);

		if (!userRequests) {
			requests.set(userId, {
				count: 1,
				firstRequest: now,
			});
			return next();
		}

		if (userRequests.count >= maxRequests) {
			return res.status(429).json({
				message: "Too many requests. Please try again later.",
				retryAfter: Math.ceil(
					(userRequests.firstRequest + windowMs - now) / 1000
				),
			});
		}

		userRequests.count++;
		next();
	};
};

// Middleware to refresh token if it's about to expire
export const refreshTokenIfNeeded = async (req, res, next) => {
	try {
		if (!req.user) {
			return next();
		}

		const authHeader = req.headers.authorization;
		const token = authHeader?.split(" ")[1];

		if (!token) {
			return next();
		}

		const decoded = jwt.decode(token);
		const now = Math.floor(Date.now() / 1000);
		const timeUntilExpiry = decoded.exp - now;

		// If token expires in less than 1 hour, refresh it
		if (timeUntilExpiry < 3600) {
			const newToken = jwt.sign(
				{ id: req.user._id, email: req.user.email },
				process.env.JWT_SECRET,
				{ expiresIn: "1d" }
			);

			// Add new token to response headers
			res.setHeader("X-New-Token", newToken);
		}

		next();
	} catch (error) {
		// Don't fail the request if refresh fails
		next();
	}
};

// Validate user account status
export const checkAccountStatus = async (req, res, next) => {
	try {
		if (!req.user) {
			return next();
		}

		// Check if account is active
		if (req.user.status === "suspended") {
			return res.status(403).json({
				message: "Account suspended. Contact support.",
				accountStatus: "suspended",
			});
		}

		if (req.user.status === "deleted") {
			return res.status(403).json({
				message: "Account no longer exists.",
				accountStatus: "deleted",
			});
		}

		// Update last active timestamp
		await User.findByIdAndUpdate(req.user._id, {
			lastActive: new Date(),
		});

		next();
	} catch (error) {
		console.error("Account status check error:", error);
		next(); // Don't fail the request
	}
};
