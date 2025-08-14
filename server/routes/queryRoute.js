// routes/queryRoutes.js
import express from 'express';
import { handleQuery } from '../controller/queryController.js';

const router = express.Router();

// Route for handling queries
router.post('/', express.json(), handleQuery);

export default router;