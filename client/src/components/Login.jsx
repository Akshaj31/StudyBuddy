import React, { useState } from "react";
import GoogleLogo from "../assets/google_logo.svg";
import GithubLogo from "../assets/github_logo.svg";
import { Link, useNavigate } from "react-router-dom";
import {
	auth,
	provider,
	githubProvider,
	signInWithPopup,
} from "../firebase.js";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const handleGoogleSignIn = async () => {
		try {
			const result = await signInWithPopup(auth, provider);
			const user = result.user;
			const idToken = await user.getIdToken();

			console.log("User Info", user);
			console.log("ID Token", idToken);

			// Send the token to your backend
			const res = await fetch(
				"http://localhost:4000/api/v1/user/google-login",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ idToken }),
				}
			);

			const data = await res.json();

			if (res.ok) {
				// Store the JWT token and user data
				localStorage.setItem("token", data.token);
				localStorage.setItem("user", JSON.stringify(data.user));

				console.log("Google login successful:", data);
				navigate("/dashboard");
			} else {
				alert(data.message || "Google sign-in failed");
			}
		} catch (error) {
			console.error("Google Sign-In Error:", error);
			alert("Failed to sign in with Google. Please try again.");
		}
	};

	const handleGithubSignIn = async () => {
		try {
			const result = await signInWithPopup(auth, githubProvider);
			const user = result.user;
			const idToken = await user.getIdToken();

			console.log("User Info", user);
			console.log("ID Token", idToken);

			// Send the token to your backend
			const res = await fetch(
				"http://localhost:4000/api/v1/user/github-login",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ idToken }),
				}
			);

			const data = await res.json();

			if (res.ok) {
				// Store the JWT token and user data
				localStorage.setItem("token", data.token);
				localStorage.setItem("user", JSON.stringify(data.user));

				console.log("GitHub login successful:", data);
				navigate("/dashboard");
			} else {
				alert(data.message || "GitHub sign-in failed");
			}
		} catch (error) {
			console.error("GitHub Sign-In Error:", error);
			alert("Failed to sign in with GitHub. Please try again.");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await fetch("http://localhost:4000/api/v1/user/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					password,
				}),
			});
			const data = await res.json();
			if (res.ok) {
				console.log("Login successful:", data);
				// Save token to localStorage
				localStorage.setItem("token", data.token);
				// Save user data to localStorage (optional)
				localStorage.setItem("user", JSON.stringify(data.user));
				// Navigate to dashboard
				navigate("/dashboard");
			} else {
				console.error("Login failed:", data.message);
				// You can add user-friendly error handling here
				alert(data.message || "Login failed. Please try again.");
			}
		} catch (err) {
			console.error("Error during login:", err.message);
			alert("Network error. Please check your connection and try again.");
		}
	};
	return (
		<div
			className="flex justify-center items-center"
			style={{
				height: "calc(100vh - 60px)",
				overflow: "hidden",
			}}
		>
			{/* Outer container with enhanced styling */}
			<div className="relative w-[500px] max-w-[90vw] p-8 rounded-3xl bg-white/10 backdrop-blur-sm border-light-gradient shadow-2xl">
				{/* Centered inner form container */}
				<div className="mx-auto w-[320px]">
					<h2 className="text-2xl font-bold text-white mb-8">Create Account</h2>{" "}
					<div className="flex flex-col gap-4 mb-6">
						<div className="border-light-gradient rounded-xl">
							<input
								type="text"
								placeholder="Email or Username"
								className="w-full bg-white/8 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:bg-white/12 transition-all duration-300 focus:shadow-lg focus:shadow-blue-500/20"
								onChange={(e) => {
									setEmail(e.target.value);
								}}
							/>
						</div>

						{/* Password Field with enhanced styling */}
						<div className="border-light-gradient rounded-xl">
							<input
								type="password"
								placeholder="Password"
								className="w-full bg-white/8 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:bg-white/12 transition-all duration-300 focus:shadow-lg focus:shadow-blue-500/20"
								onChange={(e) => {
									setPassword(e.target.value);
								}}
							/>
						</div>
						<a
							className="text-sm text-right text-gray-400 hover:text-[#4f8bff] transition-colors duration-300 cursor-pointer"
							href="#"
						>
							Forgot Password?
						</a>
					</div>
					<div className="flex justify-center mb-6">
						<button
							className="w-full bg-[#ffd859] py-4 rounded-xl text-black font-bold text-lg hover:bg-[#ffeb82] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-yellow-500/40 transform hover:scale-[1.02]"
							onClick={handleSubmit}
						>
							Sign In
						</button>
					</div>
					<div className="flex items-center my-6">
						<hr className="flex-grow border-t border-white/30" />
						<span className="px-6 text-gray-400 font-medium">
							or continue with
						</span>
						<hr className="flex-grow border-t border-white/30" />
					</div>
					<div className="flex flex-col gap-4">
						<button
							className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white/[0.03] border-light-gradient text-white font-medium hover:bg-white/[0.06] transition-all duration-300 cursor-pointer backdrop-blur-sm shadow-lg hover:shadow-white/5"
							onClick={handleGoogleSignIn}
						>
							<img src={GoogleLogo} alt="Google logo" className="w-5 h-5" />
							Continue with Google
						</button>
						<button
							className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white/[0.03] border-light-gradient text-white font-medium hover:bg-white/[0.06] transition-all duration-300 cursor-pointer backdrop-blur-sm shadow-lg hover:shadow-white/5"
							onClick={handleGithubSignIn}
						>
							<img src={GithubLogo} alt="GitHub logo" className="w-5 h-5" />
							Continue with GitHub
						</button>
					</div>
					<p className="text-center text-sm mt-8 text-gray-400">
						Don't have an account?
						<Link
							to="/register"
							className="text-[#4f8bff] hover:text-[#6fa3ff] ml-1 font-medium transition-colors duration-300"
						>
							Register here.
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;
