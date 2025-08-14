// dataStore.js
let documentChunks = [];
let hnswIndex = null;

export const getDocumentChunks = () => documentChunks;
export const setDocumentChunks = (newChunks) => {
	documentChunks = newChunks;
};

export const getHnswIndex = () => hnswIndex;
export const setHnswIndex = (newIndex) => {
	hnswIndex = newIndex;
};