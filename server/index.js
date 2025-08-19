import express from "express";
import "dotenv/config";
import uploadRoute from "./routes/uploadRoute.js";
import queryRoute from "./routes/queryRoute.js";
import userRoute from "./routes/userRoute.js";
import dataRoute from "./routes/dataRoute.js";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import cors from "cors";
// import { Pinecone } from '@pinecone-database/pinecone';

// dotenv.config();

const app = express();

app.use(express.json());

app.use(cors());

// Ensure uploads folder exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir);
}

mongoose
	.connect(process.env.MONGO_DB_URI)
	.then(() => {
		console.log("✅ Connected to MongoDB Atlas");
	})
	.catch((err) => {
		console.error("❌ MongoDB connection error:", err);
		process.exit(1);
	});

// Serve static files from uploads folder
app.use("/uploads", express.static(uploadDir));

// Upload route
app.use("/api/v1/upload", uploadRoute);

app.use("/api/v1/query", queryRoute);

app.use("/api/v1/user", userRoute);

app.use("/api/v1/data", dataRoute);

app.get("/", (req, res) => {
	console.log("Hello World");
	res.send("Hello World");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`App started on port ${PORT}`);
});
