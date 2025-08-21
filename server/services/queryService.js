import { pineconeIndex } from "../config/pinecone.js";
import { getEmbedding } from "./embeddingService.js";
import { genAI } from "../config/gemini.js";
import User from "../models/user.model.js";

export const queryChunks = async (userQuery, userId, sessionId = null) => {
	// 1. Get embedding for the user's query
	const queryEmbedding = await getEmbedding(userQuery);

	// 2. Query Pinecone for similar chunks (filtered by user)
	const queryResponse = await pineconeIndex.query({
		vector: queryEmbedding,
		topK: 3,
		includeMetadata: true,
		filter: {
			userId: String(userId), // Simple filter syntax
		},
	});

	// 3. Extract similar chunks from Pinecone response
	const similarChunks = queryResponse.matches.map((match) => ({
		text: match.metadata.text,
		page: match.metadata.page,
		sourceFile: match.metadata.sourceFile,
		score: match.score,
	}));

	// 4. Fetch recent chat history and summary if sessionId is provided
	let chatHistory = "";
	let sessionSummary = "";
	if (sessionId) {
		try {
			const user = await User.findById(userId).select("chatSessions");
			const session = user?.chatSessions?.find(
				(s) => s.sessionId === sessionId
			);

			if (session) {
				// Get session summary
				if (session.summary) {
					sessionSummary = session.summary;
				}

				// Get recent messages with ordering tags
				if (session.messages.length > 0) {
					// Get last 6 messages (3 exchanges) to keep context manageable
					const recentMessages = session.messages.slice(-6);
					chatHistory = recentMessages
						.map((msg, index) => {
							const messageAge = recentMessages.length - index;
							const ageTag =
								messageAge === 1
									? "[MOST RECENT]"
									: messageAge === 2
									? "[RECENT-1]"
									: messageAge === 3
									? "[RECENT-2]"
									: messageAge === 4
									? "[RECENT-3]"
									: messageAge === 5
									? "[RECENT-4]"
									: "[RECENT-5]";
							return `${ageTag} ${
								msg.role === "user" ? "Student" : "StudyBuddy"
							}: ${msg.content}`;
						})
						.join("\n\n");
				}
			}
		} catch (error) {
			console.error("Error fetching chat history:", error);
			// Continue without chat history if there's an error
		}
	}

	// 5. Check if we have relevant document context
	const hasRelevantContext =
		similarChunks.length > 0 && similarChunks[0].score > 0.6; // Adjust threshold as needed

	// 6. Generate response using Gemini
	const generativeModel = genAI.getGenerativeModel({
		model: "gemini-2.0-flash-exp",
	});

	let prompt;

	if (hasRelevantContext || chatHistory || sessionSummary) {
		// Use enhanced hybrid RAG approach (documents + recent messages + summary)
		const documentContext = hasRelevantContext
			? similarChunks
					.map((chunk) => `Page ${chunk.page}:\n${chunk.text}`)
					.join("\n\n")
			: "";

		prompt = `
You are StudyBuddy, an enthusiastic and engaging AI tutor! Your goal is to make learning fun and memorable for students. Use the provided context from multiple sources to answer their question in an engaging way.

Please format your response to be visually appealing and student-friendly:
- Use **bold** for key concepts and important terms (these will appear highlighted)
- Use ## for main topics and ### for subtopics (these will have colorful gradients)
- Use bullet points for lists (these will have sparkle emojis ✨)
- Keep explanations clear but engaging
- Add some enthusiasm to make learning enjoyable!
- Break complex topics into digestible chunks

${
	sessionSummary
		? `Learning Summary from this conversation:
${sessionSummary}

`
		: ""
}${
			chatHistory
				? `Recent conversation (newest first):
${chatHistory}

`
				: ""
		}${
			documentContext
				? `Context from your uploaded documents:
${documentContext}

`
				: ""
		}Current question:
${userQuery}

Answer based on the context above, building upon previous discussions when relevant. Feel free to add relevant general knowledge if helpful. Remember to be encouraging and make this educational content engaging!`;
	} else {
		// Use general knowledge approach (no relevant context available)
		prompt = `
You are StudyBuddy, an enthusiastic and engaging AI tutor! The user hasn't uploaded relevant documents for this question, so provide an exciting and educational answer using your general knowledge.

Please format your response to be visually appealing and student-friendly:
- Use **bold** for key concepts and important terms (these will appear highlighted)
- Use ## for main topics and ### for subtopics (these will have colorful gradients)
- Use bullet points for lists (these will have sparkle emojis ✨)
- Keep explanations clear but engaging
- Add some enthusiasm to make learning enjoyable!
- Break complex topics into digestible chunks
- Use analogies and examples when helpful

Question:
${userQuery}

Provide a comprehensive, engaging, and fun educational answer that makes learning exciting!`;
	}

	const chat = generativeModel.startChat({
		history: [],
		generationConfig: {
			maxOutputTokens: 500,
		},
	});

	const chatResult = await chat.sendMessage(prompt);
	const response = chatResult.response.text();

	return { response, similarChunks, hasRelevantContext };
};
