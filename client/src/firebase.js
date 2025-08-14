// firebase.js
import { initializeApp } from "firebase/app";
import {
	getAuth,
	GoogleAuthProvider,
	GithubAuthProvider,
	signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyAOE9s0386qyGOLTPe77_huObgSFPa8jBU",
	authDomain: "studybuddy-9003a.firebaseapp.com",
	projectId: "studybuddy-9003a",
	storageBucket: "studybuddy-9003a.firebasestorage.app",
	messagingSenderId: "411733866528",
	appId: "1:411733866528:web:525b5c0b52efa5cb862445",
	measurementId: "G-H29XYM4096",
};

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
