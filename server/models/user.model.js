import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema({
	uid: {
		type: String,
		required: true,
		default: uuidv4, // only used for manual sign-ups
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		// Allow placeholder emails for GitHub users without public emails
		validate: {
			validator: function (email) {
				// Allow placeholder emails or valid email format
				return (
					email.includes("@placeholder.local") || /\S+@\S+\.\S+/.test(email)
				);
			},
			message: "Please provide a valid email address",
		},
	},
	username: {
		type: String,
		required: true, // required always
	},
	fullName: {
		type: String,
		default: "",
	},
	userType: {
		type: String,
		enum: ["student", "teacher", "other"],
		default: "student",
	},
	authProvider: {
		type: String,
		enum: ["google", "github", "email"],
		required: true,
	},
	passwordHash: {
		type: String,
		default: null, // used only for manual login
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	documents: [
		{
			documentId: {
				type: String,
				required: true,
			},
			filename: {
				type: String,
				required: true,
			},
			originalName: {
				type: String,
				required: true,
			},
			filePath: {
				type: String,
				required: true,
			},
			uploadedAt: {
				type: Date,
				default: Date.now,
			},
			pageCount: {
				type: Number,
				default: 0,
			},
			status: {
				type: String,
				enum: ["processing", "completed", "failed"],
				default: "processing",
			},
		},
	],
	chatSessions: [
		{
			sessionId: {
				type: String,
				required: true,
			},
			title: {
				type: String,
				default: "New Chat",
			},
			messages: [
				{
					role: {
						type: String,
						enum: ["user", "assistant"],
						required: true,
					},
					content: {
						type: String,
						required: true,
					},
					timestamp: {
						type: Date,
						default: Date.now,
					},
					relatedDocuments: [
						{
							documentId: String,
							pages: [Number],
						},
					],
				},
			],
			createdAt: {
				type: Date,
				default: Date.now,
			},
			updatedAt: {
				type: Date,
				default: Date.now,
			},
		},
	],
	// Dashboard metrics (basic placeholders, can be updated elsewhere in app logic)
	totalStudyHours: {
		type: Number,
		default: 0,
	},
	subjectsMastered: {
		type: Number,
		default: 0,
	},
	averageScore: {
		type: Number,
		default: 0,
	},
	studyStreakDays: {
		type: Number,
		default: 0,
	},
	recentActivity: [
		{
			type: {
				type: String,
				default: "activity",
			},
			description: {
				type: String,
				default: "",
			},
			icon: {
				type: String,
				default: "✅",
			},
			timestamp: {
				type: Date,
				default: Date.now,
			},
		},
	],
});

const User = mongoose.model("User", userSchema);
export default User;
