import { parsePdfPages } from "../services/pdfParser.js";
import { processAndStoreChunks } from "../services/dataProcessingService.js"; // Import the new service

export const handleFileUpload = async (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
    }

    try {
        // Step 1: Parse all files
        const parsePromises = files.map((file) => parsePdfPages(file.path));
        const parsedPagesByFile = await Promise.all(parsePromises);
        const allPages = parsedPagesByFile.flat();

        // Step 2: Process the parsed data (embedding and indexing)
        const chunkCount = await processAndStoreChunks(allPages);

        // Step 3: Build the response for the client
        const response = files.map((file, idx) => ({
            filename: file.filename,
            parsedPagesCount: parsedPagesByFile[idx].length,
        }));

        res.status(200).json({
            message: "Files uploaded, parsed, and embeddings stored successfully",
            chunkCount: chunkCount,
            files: response,
        });
    } catch (error) {
        console.error("Error processing PDFs:", error);
        console.error('Full Error Details:', JSON.stringify(error, null, 2));
        res.status(500).json({ error: "Failed to process PDFs" });
    }
};