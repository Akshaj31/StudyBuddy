import { parsePdfPages } from "../services/pdfParser.js";
import { processPagesToEmbeddings } from "../services/dataProcessingService.js";
import { saveEmbeddingsToPinecone } from "../services/embeddingStorageService.js";
import User from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";

export const handleFileUpload = async (req, res) => {
	const files = req.files;
	const userId = req.userId || req.user?._id || req.user?.id; // Use the correct field from auth middleware

	if (!files || files.length === 0) {
		return res.status(400).json({ error: "No files uploaded" });
	}
	try {
		const uploadedDocuments = [];

		for (const file of files) {
			const documentId = uuidv4();

			// Step 1: Parse PDF
			const parsedPages = await parsePdfPages(file.path);

			// Add documentId and userId to each page for Pinecone storage
			const pagesWithMetadata = parsedPages.map((page) => ({
				...page,
				sourceFile: documentId,
				userId: userId,
			}));

			// Step 2: Generate embeddings
			const pageEmbeddings = await processPagesToEmbeddings(pagesWithMetadata);

			// Step 3: Store embeddings in Pinecone
			const upsertCount = await saveEmbeddingsToPinecone(pageEmbeddings);

			// Step 4: Update user document in MongoDB
			const documentRecord = {
				documentId,
				filename: file.filename,
				originalName: file.originalname,
				filePath: file.path,
				pageCount: parsedPages.length,
				status: "completed",
				uploadedAt: new Date(),
			};

			await User.findByIdAndUpdate(userId, {
				$push: { documents: documentRecord },
			});

			uploadedDocuments.push({
				documentId,
				filename: file.filename,
				originalName: file.originalname,
				pageCount: parsedPages.length,
				upsertCount,
			});
		}

		res.status(200).json({
			message: "Files uploaded, parsed, and embeddings stored successfully",
			documents: uploadedDocuments,
		});
	} catch (error) {
		console.error("Error processing PDFs:", error);
		console.error("Full Error Details:", JSON.stringify(error, null, 2));
		res.status(500).json({ error: "Failed to process PDFs" });
	}
};
