// routes/queryRoutes.js
import express from "express";
import { handleQuery } from "../controller/queryController.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Route for handling queries
router.post("/", verifyToken, express.json(), handleQuery);

export default router;
