import { genAI } from "../config/gemini.js";

// Generate an intelligent title from the chat summary or conversation
export const generateChatTitle = async (summary, firstQuestion = "") => {
	try {
		const titleModel = genAI.getGenerativeModel({
			model: "gemini-2.0-flash-exp",
		});

		const prompt = `
Generate a concise, descriptive title (3-6 words) for a study session based on the content below. The title should capture the main learning topic or subject discussed.

Guidelines:
- Keep it under 50 characters
- Focus on the main subject/topic
- Make it descriptive and clear
- Use student-friendly language
- Examples: "Physics - Momentum", "Math - Quadratic Equations", "Biology - Cell Division"

${summary ? `Learning Summary: ${summary}` : ""}
${firstQuestion ? `First Question: ${firstQuestion}` : ""}

Generate a title:`;

		const result = await titleModel.generateContent(prompt);
		const generatedTitle = result.response.text().trim();

		// Clean up the title (remove quotes, extra spaces, etc.)
		let cleanTitle = generatedTitle
			.replace(/['"]/g, "")
			.replace(/^Title:\s*/i, "")
			.trim();

		// Fallback if title is too long or empty
		if (!cleanTitle || cleanTitle.length > 50) {
			cleanTitle = firstQuestion.substring(0, 47) + "...";
		}

		return cleanTitle;
	} catch (error) {
		console.error("Error generating chat title:", error);
		// Fallback to first question
		return firstQuestion.substring(0, 47) + "...";
	}
};

// Update title when summary gets updated (called after summary updates)
export const updateChatTitle = async (
	sessionSummary,
	currentTitle,
	firstQuestion = ""
) => {
	try {
		// Only update title if we have a meaningful summary
		if (!sessionSummary || sessionSummary.length < 50) {
			return currentTitle; // Keep current title
		}

		// Generate new title based on summary
		const newTitle = await generateChatTitle(sessionSummary, firstQuestion);

		// Only update if the new title is different and meaningful
		if (newTitle && newTitle !== currentTitle && !newTitle.includes("...")) {
			return newTitle;
		}

		return currentTitle; // Keep current title
	} catch (error) {
		console.error("Error updating chat title:", error);
		return currentTitle;
	}
};
