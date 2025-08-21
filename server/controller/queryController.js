// controller/queryController.js
import { queryChunks } from "../services/queryService.js";
import {
	isMessageImportant,
	updateSummary,
} from "../services/summaryService.js";
import { updateChatTitle } from "../services/titleService.js";
import User from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";

export const handleQuery = async (req, res) => {
	try {
		const { query, sessionId } = req.body;
		const userId = req.userId || req.user._id; // Use the correct field from auth middleware

		if (!query) {
			return res.status(400).json({ error: "Query is required." });
		}

		// Get response from Pinecone + Gemini (with hybrid RAG)
		// This will fetch chat history WITHOUT the current message
		const { response, similarChunks, hasRelevantContext } = await queryChunks(
			query,
			userId,
			sessionId // Pass sessionId for chat history retrieval
		);

		// Create session ID
		const currentSessionId = sessionId || uuidv4();

		// Prepare related documents info
		const relatedDocs = similarChunks.map((chunk) => ({
			documentId: chunk.sourceFile,
			pages: [chunk.page],
		}));

		// Send response to frontend immediately
		res.status(200).json({
			response,
			similarChunks,
			sessionId: currentSessionId,
			hasRelevantContext,
		});

		// Continue with async operations (message storage, summary updates)
		// This happens AFTER responding to the user for better performance
		setImmediate(async () => {
			try {
				await saveMessageAndUpdateSummary(
					userId,
					currentSessionId,
					query,
					response,
					relatedDocs
				);
			} catch (error) {
				console.error("Error in async message/summary operations:", error);
			}
		});
	} catch (error) {
		console.error("Error querying:", error);
		return res.status(500).json({ error: "Failed to process query" });
	}
};

// Async function to handle message saving and summary updates
const saveMessageAndUpdateSummary = async (
	userId,
	currentSessionId,
	query,
	response,
	relatedDocs
) => {
	try {
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

			// Keep only recent messages (last 8 messages = 4 exchanges)
			if (existingSession.messages.length > 8) {
				existingSession.messages = existingSession.messages.slice(-8);
			}

			// Save first, then do summary evaluation asynchronously
			await user.save();

			// Check if we should update the summary (async)
			const shouldUpdateSummary = await isMessageImportant(query, response);
			if (shouldUpdateSummary) {
				const oldSummary = existingSession.summary;
				existingSession.summary = await updateSummary(
					existingSession.summary,
					query,
					response
				);
				existingSession.summaryUpdatedAt = new Date();

				// Update title based on new summary
				const firstQuestion =
					existingSession.messages.find((msg) => msg.role === "user")
						?.content || "";
				existingSession.title = await updateChatTitle(
					existingSession.summary,
					existingSession.title,
					firstQuestion
				);

				await user.save(); // Save again after summary update
			}
		} else {
			// Create new session
			const newSession = {
				sessionId: currentSessionId,
				title: query.substring(0, 50) + (query.length > 50 ? "..." : ""),
				summary: "", // Start with empty summary
				summaryUpdatedAt: new Date(),
				messages: [userMessage, assistantMessage],
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			user.chatSessions.push(newSession);
			await user.save();
		}
	} catch (error) {
		console.error("Error saving message and updating summary:", error);
	}
};
