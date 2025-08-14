// backend/config/firebaseService.js
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the service account key
const serviceAccount = JSON.parse(
	readFileSync(join(__dirname, "../config/firebaseServiceKey.json"), "utf8")
);

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});
}

export default admin;
