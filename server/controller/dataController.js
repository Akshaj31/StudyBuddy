import User from "../models/user.model.js";

// Get user's documents
export const getUserDocuments = async (req, res) => {
	try {
		const userId = req.userId || req.user._id;
		const user = await User.findById(userId).select("documents");

		res.status(200).json({
			documents: user.documents,
		});
	} catch (error) {
		console.error("Error fetching documents:", error);
		res.status(500).json({ error: "Failed to fetch documents" });
	}
};

// Get user's chat sessions
export const getUserChatSessions = async (req, res) => {
	try {
		const userId = req.userId || req.user._id;
		const user = await User.findById(userId).select("chatSessions");

		res.status(200).json({
			chatSessions: user.chatSessions,
		});
	} catch (error) {
		console.error("Error fetching chat sessions:", error);
		res.status(500).json({ error: "Failed to fetch chat sessions" });
	}
};

// Get specific chat session
export const getChatSession = async (req, res) => {
	try {
		const userId = req.userId || req.user._id;
		const { sessionId } = req.params;

		const user = await User.findById(userId);
		const session = user.chatSessions.find((s) => s.sessionId === sessionId);

		if (!session) {
			return res.status(404).json({ error: "Chat session not found" });
		}

		res.status(200).json({ session });
	} catch (error) {
		console.error("Error fetching chat session:", error);
		res.status(500).json({ error: "Failed to fetch chat session" });
	}
};

// Delete document
export const deleteDocument = async (req, res) => {
	try {
		const userId = req.userId || req.user._id;
		const { documentId } = req.params;

		await User.findByIdAndUpdate(userId, {
			$pull: { documents: { documentId } },
		});

		// TODO: Also delete from Pinecone
		// await pineconeIndex.deleteMany({ filter: { userId, sourceFile: documentId } });

		res.status(200).json({ message: "Document deleted successfully" });
	} catch (error) {
		console.error("Error deleting document:", error);
		res.status(500).json({ error: "Failed to delete document" });
	}
};

// Delete chat session
export const deleteChatSession = async (req, res) => {
	try {
		const userId = req.userId || req.user._id;
		const { sessionId } = req.params;

		await User.findByIdAndUpdate(userId, {
			$pull: { chatSessions: { sessionId } },
		});

		res.status(200).json({ message: "Chat session deleted successfully" });
	} catch (error) {
		console.error("Error deleting chat session:", error);
		res.status(500).json({ error: "Failed to delete chat session" });
	}
};
