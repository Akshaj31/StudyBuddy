// controller/queryController.js
import { queryChunks } from '../services/dataProcessingService.js';

export const handleQuery = async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required.' });
        }
        
        const { response, similarChunks } = await queryChunks(query);
        
        return res.status(200).json({ response, similarChunks });
    } catch (error) {
        console.error('Error querying:', error);
        return res.status(500).json({ error: 'Failed to process query' });
    }
};