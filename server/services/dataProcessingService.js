import { GoogleGenerativeAI } from "@google/generative-ai";
import Hnswlib from "hnswlib-node";
const { HierarchicalNSW } = Hnswlib;
import {
	getDocumentChunks,
	setDocumentChunks,
	getHnswIndex,
	setHnswIndex,
} from "../dataStore.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const processAndStoreChunks = async (allPages) => {
	const validPages = allPages.filter(
		(page) => page.content && /\S/.test(page.content)
	);

	console.log(
		`Found a total of ${allPages.length} pages. Processing ${validPages.length} with content...`
	);

	if (validPages.length === 0) {
		setDocumentChunks([]);
		setHnswIndex(null);
		console.log("No valid pages found to process.");
		return 0;
	}

	const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });

	const embeddingPromises = validPages.map(async (page) => {
		const embedContentRequest = {
			content: {
				parts: [{ text: page.content }],
			},
		};

		const result = await embeddingModel.embedContent(embedContentRequest);

		return {
			text: page.content,
			embedding: result.embedding.values,
			page: page.page,
			sourceFile: page.sourceFile,
		};
	});

	const newChunks = await Promise.all(embeddingPromises);
	setDocumentChunks(newChunks);

	if (newChunks.length > 0) {
		const index = new Hnswlib.HierarchicalNSW(
			"cosine",
			newChunks[0].embedding.length
		);
		index.initIndex(newChunks.length);

		newChunks.forEach((chunk, i) => {
			index.addPoint(chunk.embedding, i);
		});

		console.log("HNSW Type:", typeof index); // 'object'
		console.log("searchKNN exists?", typeof index.searchKnn); // 'function'

		setHnswIndex(index);
		console.log("HNSW index built and stored in memory.");
	} else {
		setHnswIndex(null);
		console.log("No chunks to index.");
	}

	console.log("Embeddings generated and stored.");
	return newChunks.length;
};

export const queryChunks = async (userQuery) => {
	if (!getDocumentChunks() || !getHnswIndex()) {
		throw new Error("Embeddings not available. Please upload a PDF first.");
	}

	const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
	const generativeModel = genAI.getGenerativeModel({
		model: "gemini-1.5-flash",
	});

	// 1. Embed the user's query
	const embedContentRequest = {
		content: {
			parts: [
				{
					text: userQuery,
				},
			],
		},
	};
	const queryEmbedding = (
		await embeddingModel.embedContent(embedContentRequest)
	).embedding.values;

	// 2. Search the HNSW index for the top 3 most similar chunks
	const k = Math.min(3, getDocumentChunks().length);
	const result = getHnswIndex().searchKnn(queryEmbedding, k);
	const similarChunks = result.neighbors.map((i) => getDocumentChunks()[i]);

	// 3. Create a context string from the retrieved chunks
	const context = similarChunks
		.map((chunk) => `Page ${chunk.page}:\n${chunk.text}`)
		.join("\n\n");

	// 4. Construct a prompt for the LLM
	const prompt = `
        You are a helpful assistant. Use ONLY the provided context to answer the question below.
        If the answer is not contained in the context, respond with:
        "I don't have enough information to answer that question."
        
        Context:
        ${context}
        
        Question:
        ${userQuery}
    `;

	// 5. Send the prompt to the LLM and get the answer
	const chat = generativeModel.startChat({
		history: [],
		generationConfig: {
			maxOutputTokens: 500,
		},
	});

	const chatResult = await chat.sendMessage(prompt);
	const response = chatResult.response.text();

	const cleanedChunks = similarChunks.map(({ text, page, sourceFile }) => ({
		text,
		page,
		sourceFile,
	}));
	return { response };
};
