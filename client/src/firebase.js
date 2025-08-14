// firebase.js
import { initializeApp } from "firebase/app";
import {
	getAuth,
	GoogleAuthProvider,
	GithubAuthProvider,
	signInWithPopup,
} from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";

// Firebase config is now imported from firebaseConfig.js

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported and not blocked
let analytics = null;
try {
	if (typeof window !== "undefined") {
		import("firebase/analytics")
			.then(({ getAnalytics }) => {
				analytics = getAnalytics(app);
			})
			.catch((error) => {
				console.log("Analytics blocked or not available:", error);
			});
	}
} catch (error) {
	console.log("Analytics initialization failed:", error);
}

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { auth, provider, githubProvider, signInWithPopup };
