import { pineconeIndex } from "../config/pinecone.js";

/**
 * Save an array of page embeddings to Pinecone
 * @param {Array} pageEmbeddings - Array of objects: { text, embedding, page, sourceFile }
 */
export const saveEmbeddingsToPinecone = async (pageEmbeddings) => {
	if (!Array.isArray(pageEmbeddings) || pageEmbeddings.length === 0) return;

	const upserts = pageEmbeddings.map((page) => ({
		id: `${page.userId}-${page.sourceFile}-page-${page.page}`,
		values: page.embedding,
		metadata: {
			page: page.page,
			text: page.text,
			sourceFile: page.sourceFile || "unknown",
			userId: String(page.userId), // Ensure it's a string
		},
	}));

	// Debug logs can be removed once confirmed working
	// console.log(
	// 	"🔍 Upload Debug - Sample upsert:",
	// 	JSON.stringify(upserts[0], null, 2)
	// );
	// console.log(
	// 	"🔍 Upload Debug - UserId being stored:",
	// 	upserts[0].metadata.userId
	// );

	await pineconeIndex.upsert(upserts);
	return upserts.length;
};
