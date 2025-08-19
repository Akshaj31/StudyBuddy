import { pineconeIndex } from "../config/pinecone.js";
import { getEmbedding } from "./embeddingService.js";
import { genAI } from "../config/gemini.js";

export const queryChunks = async (userQuery, userId) => {
	console.log("🔍 Query Debug - userId:", userId);
	console.log("🔍 Query Debug - userQuery:", userQuery);

	// 1. Get embedding for the user's query
	const queryEmbedding = await getEmbedding(userQuery);
	console.log("🔍 Query Debug - embedding length:", queryEmbedding.length);

	// 2. Query Pinecone for similar chunks (filtered by user)
	const queryResponse = await pineconeIndex.query({
		vector: queryEmbedding,
		topK: 3,
		includeMetadata: true,
		filter: {
			userId: String(userId), // Simple filter syntax
		},
	});

	console.log(
		"🔍 Query Debug - Pinecone response:",
		JSON.stringify(queryResponse, null, 2)
	);

	// 3. Extract similar chunks from Pinecone response
	const similarChunks = queryResponse.matches.map((match) => ({
		text: match.metadata.text,
		page: match.metadata.page,
		sourceFile: match.metadata.sourceFile,
		score: match.score,
	}));

	// 4. Check if we have relevant document context
	const hasRelevantContext =
		similarChunks.length > 0 && similarChunks[0].score > 0.6; // Adjust threshold as needed

	// 5. Generate response using Gemini
	const generativeModel = genAI.getGenerativeModel({
		model: "gemini-2.0-flash-exp",
	});

	let prompt;

	if (hasRelevantContext) {
		// Use document-based approach
		const context = similarChunks
			.map((chunk) => `Page ${chunk.page}:\n${chunk.text}`)
			.join("\n\n");

		prompt = `
You are StudyBuddy, an enthusiastic and engaging AI tutor! Your goal is to make learning fun and memorable for students. Use the provided context from the user's uploaded documents to answer their question in an engaging way.

Please format your response to be visually appealing and student-friendly:
- Use **bold** for key concepts and important terms (these will appear highlighted)
- Use ## for main topics and ### for subtopics (these will have colorful gradients)
- Use bullet points for lists (these will have sparkle emojis ✨)
- Keep explanations clear but engaging
- Add some enthusiasm to make learning enjoyable!
- Break complex topics into digestible chunks

Context from your documents:
${context}

Question:
${userQuery}

Answer based on the context above, and feel free to add relevant general knowledge if helpful. Remember to be encouraging and make this educational content engaging!`;
	} else {
		// Use general knowledge approach
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
