import { getEmbedding } from "./embeddingService.js";

export const processPagesToEmbeddings = async (allPages) => {
	const validPages = allPages.filter(
		(page) => page.content && /\S/.test(page.content)
	);
	if (validPages.length === 0) {
		return [];
	}
	const embeddingPromises = validPages.map(async (page) => {
		return {
			text: page.content,
			embedding: await getEmbedding(page.content),
			page: page.page,
			sourceFile: page.sourceFile,
			userId: page.userId, // Preserve the userId
		};
	});
	return await Promise.all(embeddingPromises);
};
