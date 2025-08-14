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
});

const User = mongoose.model("User", userSchema);
export default User;
