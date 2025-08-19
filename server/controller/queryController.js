// controller/queryController.js
import { queryChunks } from "../services/queryService.js";
import User from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";

export const handleQuery = async (req, res) => {
	try {
		const { query, sessionId } = req.body;
		const userId = req.userId || req.user._id; // Use the correct field from auth middleware

		if (!query) {
			return res.status(400).json({ error: "Query is required." });
		}

		// Get response from Pinecone + Gemini
		const { response, similarChunks, hasRelevantContext } = await queryChunks(
			query,
			userId
		);

		// Create or update chat session
		const currentSessionId = sessionId || uuidv4();

		// Prepare related documents info
		const relatedDocs = similarChunks.map((chunk) => ({
			documentId: chunk.sourceFile,
			pages: [chunk.page],
		}));

		// User message
		const userMessage = {
			role: "user",
			content: query,
			timestamp: new Date(),
			relatedDocuments: [],
		};

		// Assistant message
		const assistantMessage = {
			role: "assistant",
			content: response,
			timestamp: new Date(),
			relatedDocuments: relatedDocs,
		};

		// Update or create chat session
		const user = await User.findById(userId);
		const existingSession = user.chatSessions.find(
			(session) => session.sessionId === currentSessionId
		);

		if (existingSession) {
			// Add messages to existing session
			existingSession.messages.push(userMessage, assistantMessage);
			existingSession.updatedAt = new Date();
		} else {
			// Create new session
			const newSession = {
				sessionId: currentSessionId,
				title: query.substring(0, 50) + (query.length > 50 ? "..." : ""),
				messages: [userMessage, assistantMessage],
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			user.chatSessions.push(newSession);
		}

		await user.save();

		return res.status(200).json({
			response,
			similarChunks,
			sessionId: currentSessionId,
			hasRelevantContext,
		});
	} catch (error) {
		console.error("Error querying:", error);
		return res.status(500).json({ error: "Failed to process query" });
	}
};
