import { genAI } from "../config/gemini.js";

const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });

export async function getEmbedding(text) {
  const embedContentRequest = {
    content: {
      parts: [{ text }],
    },
  };
  const result = await embeddingModel.embedContent(embedContentRequest);
  return result.embedding.values;
}

export const  saveEmbeddings = async() => {
    
}