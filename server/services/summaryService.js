import { genAI } from "../config/gemini.js";

const SUMMARY_MAX_TOKENS = 1000;

// Check if a message contains important learning information
export const isMessageImportant = async (userMessage, assistantMessage) => {
	try {
		const evaluationModel = genAI.getGenerativeModel({
			model: "gemini-2.0-flash-exp",
		});

		const prompt = `
You are analyzing a conversation between a student and StudyBuddy (an AI tutor). Determine if this exchange contains important learning information that should be preserved in a conversation summary.

Consider important:
- New concepts, definitions, or explanations
- Problem-solving steps or methodologies
- Key facts, formulas, or principles
- Examples that illustrate important concepts
- Student questions that reveal learning needs
- Corrections of misconceptions

Consider NOT important:
- Casual greetings or small talk
- Simple confirmations ("ok", "thanks", "got it")
- Repetitive information already covered
- Off-topic discussions

Student message: "${userMessage}"
Assistant response: "${assistantMessage}"

Respond with only "IMPORTANT" or "NOT_IMPORTANT"`;

		const result = await evaluationModel.generateContent(prompt);
		const evaluation = result.response.text().trim();

		return evaluation === "IMPORTANT";
	} catch (error) {
		console.error("Error evaluating message importance:", error);
		// Default to important if evaluation fails
		return true;
	}
};

// Update the session summary with new important information
export const updateSummary = async (
	currentSummary,
	userMessage,
	assistantMessage
) => {
	try {
		const summaryModel = genAI.getGenerativeModel({
			model: "gemini-2.0-flash-exp",
		});

		const prompt = `
You are maintaining a learning summary for a student's conversation with StudyBuddy (AI tutor). 

Your task:
1. Analyze the new exchange for important learning content
2. Integrate it into the existing summary
3. Keep the summary focused on key learning points
4. Maintain approximately ${SUMMARY_MAX_TOKENS} tokens or less
5. Prioritize recent and important information
6. Remove or compress less relevant details if needed

Current summary:
${currentSummary || "No previous summary."}

New exchange to integrate:
Student: ${userMessage}
StudyBuddy: ${assistantMessage}

Provide an updated summary that captures the most important learning content from both the existing summary and the new exchange. Focus on concepts, explanations, examples, and key facts that would help the student in future questions.

Updated Summary:`;

		const result = await summaryModel.generateContent(prompt);
		const updatedSummary = result.response.text().trim();

		// Basic length check - if too long, ask for compression
		if (updatedSummary.length > SUMMARY_MAX_TOKENS * 4) {
			// Rough token estimate
			return await compressSummary(updatedSummary);
		}

		return updatedSummary;
	} catch (error) {
		console.error("Error updating summary:", error);
		// Return current summary if update fails
		return currentSummary;
	}
};

// Compress summary if it gets too long
const compressSummary = async (longSummary) => {
	try {
		const compressionModel = genAI.getGenerativeModel({
			model: "gemini-2.0-flash-exp",
		});

		const prompt = `
The following learning summary has grown too long. Compress it to approximately ${SUMMARY_MAX_TOKENS} tokens while preserving the most important learning content.

Focus on:
- Core concepts and definitions
- Key facts and principles
- Important examples and methodologies
- Critical learning points

Remove:
- Redundant information
- Less important details
- Overly verbose explanations

Original summary:
${longSummary}

Provide a compressed version that maintains the essential learning content:`;

		const result = await compressionModel.generateContent(prompt);
		return result.response.text().trim();
	} catch (error) {
		console.error("Error compressing summary:", error);
		// Return truncated version if compression fails
		return longSummary.substring(0, SUMMARY_MAX_TOKENS * 4);
	}
};
