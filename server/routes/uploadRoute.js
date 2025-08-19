import express from "express";
import { upload } from "../middlewares/multerMiddleware.js";
import { handleFileUpload } from "../controller/uploadController.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 8 is the maximum amount of files we can store(can adjust as per need)
router.post("/", verifyToken, upload.array("files", 8), handleFileUpload);

export default router;
