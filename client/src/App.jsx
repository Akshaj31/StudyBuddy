import React, { useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ChatPage from "./components/ChatPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Hero from "./components/Hero";
import HeroCards from "./components/HeroCards";

function AppContent() {
	const location = useLocation();

	useEffect(() => {
		// Pages that should not scroll and hide navbar
		const noScrollPages = ["/login", "/register", "/dashboard"];
		const chatPages = location.pathname.startsWith("/chat");

		if (noScrollPages.includes(location.pathname) || chatPages) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}

		// Cleanup function to reset overflow when component unmounts
		return () => {
			document.body.style.overflow = "auto";
		};
	}, [location.pathname]);

	return (
		<div className="text-white min-h-screen relative">
			<div className="light-orb light-orb-1"></div>
			<div className="light-orb light-orb-2"></div>
			{/* Hide navbar on dashboard and chat */}
			{!["/dashboard"].includes(location.pathname) &&
				!location.pathname.startsWith("/chat") && <Navbar />}
			<AnimatePresence mode="wait" initial={false}>
				<Routes location={location} key={location.pathname}>
					<Route path="/register" element={<Register />} />
					<Route path="/login" element={<Login />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route
						path="/chat/new"
						element={
							<ErrorBoundary>
								<ChatPage />
							</ErrorBoundary>
						}
					/>
					<Route
						path="/chat/:sessionId"
						element={
							<ErrorBoundary>
								<ChatPage />
							</ErrorBoundary>
						}
					/>
					<Route
						path="/chat"
						element={
							<ErrorBoundary>
								<ChatPage />
							</ErrorBoundary>
						}
					/>
					<Route path="/" element={<Hero />} />
					<Route path="/features" element={<HeroCards />} />
				</Routes>
			</AnimatePresence>
		</div>
	);
}

function App() {
	return (
		<BrowserRouter>
			<AppContent />
		</BrowserRouter>
	);
}

export default App;
