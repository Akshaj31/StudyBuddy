import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useNavigate } from "react-router-dom";
import {
	documentAPI,
	handleAPIError,
	dashboardAPI,
	queryAPI,
} from "../services/api.js";

const Dashboard = () => {
	const [activeSection, setActiveSection] = useState("Dashboard");
	const [aiInput, setAiInput] = useState("");
	const [attachedFiles, setAttachedFiles] = useState([]);
	const [uploading, setUploading] = useState(false);
	const [stats, setStats] = useState(null);
	const [recentActivity, setRecentActivity] = useState([]);
	const [loadingDashboard, setLoadingDashboard] = useState(true);
	const [recentChats, setRecentChats] = useState([]);
	const [loadingChats, setLoadingChats] = useState(true);
	const [showChats, setShowChats] = useState(false);

	// Use the authentication hook
	const { user, authenticated, loading, logout } = useAuth();
	const navigate = useNavigate();

	// File attachment handlers
	const handleFileSelect = (e) => {
		const files = Array.from(e.target.files);
		const validFiles = files.filter((file) => file.type === "application/pdf");

		if (validFiles.length !== files.length) {
			alert("Only PDF files are supported. Other files were skipped.");
		}

		setAttachedFiles((prev) => [...prev, ...validFiles]);
		// Clear the input so same file can be selected again
		e.target.value = "";
	};

	const handleRemoveFile = (index) => {
		setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const handleSendMessage = async () => {
		if ((!aiInput.trim() && attachedFiles.length === 0) || uploading) return;

		try {
			setUploading(true);

			// If files are attached, upload them first
			if (attachedFiles.length > 0) {
				const response = await documentAPI.uploadFiles(attachedFiles);
				const result = await handleAPIError(response);

				// Navigate to chat page with initial message and uploaded documents
				navigate("/chat/new", {
					state: {
						initialMessage:
							aiInput.trim() ||
							"I've uploaded some documents. Can you help me understand them?",
						uploadedDocuments: result.documents,
					},
				});
			} else if (aiInput.trim()) {
				// Navigate to chat page with just the message
				navigate("/chat/new", {
					state: {
						initialMessage: aiInput.trim(),
					},
				});
			}
		} catch (error) {
			console.error("Error:", error);
			alert(`Error: ${error.message}`);
		} finally {
			setUploading(false);
		}
	};

	// Debug user data (remove in production)
	useEffect(() => {
		if (user) {
			console.log("Authenticated user:", user);
		}
	}, [user]);

	const sidebarItems = [
		{ name: "Dashboard", icon: "📊", path: "/dashboard" },
		{ name: "AI Tutor", icon: "🤖", path: "/chat/new" },
		{ name: "Progress", icon: "📈", path: "/progress" },
		{ name: "Settings", icon: "⚙️", path: "/settings" },
	];

	// Handle logout functionality
	const handleLogout = () => {
		if (window.confirm("Are you sure you want to logout?")) {
			logout();
		}
	};

	// Fetch dashboard data
	useEffect(() => {
		let isMounted = true;
		const fetchDashboard = async () => {
			try {
				setLoadingDashboard(true);
				const response = await dashboardAPI.getDashboard();
				const data = await handleAPIError(response);
				if (!isMounted) return;
				setStats([
					{
						label: "Total Study Hours",
						value: data.stats.totalStudyHours?.toString() || "0",
						suffix: "hrs",
						icon: "⏱️",
						color: "text-[#ffd859]",
					},
					{
						label: "Subjects Mastered",
						value: data.stats.subjectsMastered?.toString() || "0",
						suffix: "",
						icon: "🎯",
						color: "text-emerald-400",
					},
					{
						label: "Average Score",
						value: data.stats.averageScore?.toString() || "0",
						suffix: "/10",
						icon: "⭐",
						color: "text-blue-400",
					},
					{
						label: "Study Streak",
						value: data.stats.studyStreakDays?.toString() || "0",
						suffix: "days",
						icon: "🔥",
						color: "text-orange-400",
					},
				]);

				setRecentActivity(
					(data.recentActivity || []).map((a) => ({
						icon: a.icon || "✅",
						// Converting to display fields similar to previous structure
						subject: a.description || "Activity",
						time: timeAgo(a.timestamp),
					}))
				);
			} catch (e) {
				console.error("Failed to load dashboard:", e);
			} finally {
				if (isMounted) setLoadingDashboard(false);
			}
		};
		fetchDashboard();
		return () => {
			isMounted = false;
		};
	}, []);

	// Fetch recent chats (last 5)
	useEffect(() => {
		let active = true;
		const fetchChats = async () => {
			if (!authenticated) return;
			try {
				setLoadingChats(true);
				const response = await queryAPI.getChatSessions();
				const data = await handleAPIError(response);
				if (!active) return;
				const sessions = (data.sessions || [])
					.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
					.slice(0, 5)
					.map((s) => ({
						id: s.sessionId,
						title: s.title || "Untitled Chat",
						updatedAt: s.updatedAt,
					}));
				setRecentChats(sessions);
			} catch (e) {
				console.error("Failed to load chat sessions", e);
				setRecentChats([]);
			} finally {
				if (active) setLoadingChats(false);
			}
		};
		fetchChats();
		return () => {
			active = false;
		};
	}, [authenticated]);

	const timeAgo = (date) => {
		if (!date) return "";
		const d = new Date(date);
		const diff = Date.now() - d.getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 60) return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h ago`;
		const days = Math.floor(hrs / 24);
		return `${days}d ago`;
	};

	// Unified early return section (after all hooks to satisfy rules of hooks)
	if (loading || loadingDashboard) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-[#ffd859] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<div className="text-white text-lg">
						{loading ? "Authenticating..." : "Loading your dashboard..."}
					</div>
				</div>
			</div>
		);
	}

	if (!authenticated) return null;

	return (
		<div className="flex h-screen">
			{/* Minimal Sidebar */}
			<div className="w-64 bg-black/30 backdrop-blur-sm border-r border-white/10 flex flex-col border-light-gradient">
				{/* Logo Section */}
				<div className="p-6 border-b border-white/10">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
							<span className="text-gray-300 text-base">📚</span>
						</div>
						<div>
							<h1 className="text-gray-100 font-medium text-lg">StudyBuddy</h1>
						</div>
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 p-6">
					<ul className="space-y-2">
						{sidebarItems.map((item) => (
							<li key={item.name}>
								<button
									onClick={() => {
										setActiveSection(item.name);
										if (item.path) navigate(item.path);
									}}
									className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
										item.name === activeSection
											? "bg-gray-800/50 text-gray-100"
											: "text-gray-400 hover:bg-gray-800/30 hover:text-gray-200"
									}`}
								>
									<span className="text-base">{item.icon}</span>
									<span className="text-base font-medium">{item.name}</span>
								</button>
							</li>
						))}

						<li className="pt-2">
							<button
								onClick={() => setShowChats((s) => !s)}
								className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
									showChats
										? "bg-gray-800/50 text-gray-100"
										: "text-gray-400 hover:bg-gray-800/30 hover:text-gray-200"
								}`}
							>
								<span className="flex items-center gap-3">
									<span className="text-base">💬</span>
									<span className="text-base font-medium">Recent Chats</span>
								</span>
								<span className="text-xs text-gray-400">
									{showChats ? "▾" : "▸"}
								</span>
							</button>

							{showChats && (
								<div className="mt-2 space-y-1">
									{loadingChats ? (
										<div className="text-gray-500 text-sm px-2 py-1">
											Loading...
										</div>
									) : recentChats.length === 0 ? (
										<div className="text-gray-500 text-sm px-2 py-1">
											No chats yet
										</div>
									) : (
										recentChats.map((chat) => (
											<button
												key={chat.id}
												onClick={() => navigate(`/chat/${chat.id}`)}
												className="w-full text-left px-3 py-2 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 text-gray-300 hover:text-white transition-colors group"
											>
												<div className="flex items-center justify-between gap-2">
													<span className="truncate text-sm group-hover:text-white">
														{chat.title}
													</span>
													<span className="text-[10px] text-gray-500 whitespace-nowrap">
														{timeAgo(chat.updatedAt)}
													</span>
												</div>
											</button>
										))
									)}
									{!loadingChats && recentChats.length > 0 && (
										<button
											onClick={() => navigate("/chat")}
											className="w-full mt-1 text-center text-xs px-3 py-1.5 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 text-gray-400 hover:text-gray-200 transition-colors"
										>
											View more
										</button>
									)}
								</div>
							)}
						</li>
					</ul>
				</nav>

				{/* User Profile */}
				<div className="relative p-6 border-t border-white/10">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 text-base font-medium">
							{user?.username?.charAt(0)?.toUpperCase() || "U"}
						</div>
						<div className="flex-1 min-w-0">
							<div className="text-gray-200 text-base font-medium truncate">
								{user?.username || "User"}
							</div>
						</div>
					</div>

					<button
						onClick={handleLogout}
						className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg py-2.5 px-4 text-gray-400 hover:text-gray-200 text-base font-medium transition-colors flex items-center justify-center gap-2"
					>
						<span>Logout</span>
					</button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-auto bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50">
				<div className="p-4 space-y-4">
					{/* Welcome Header - More Prominent */}
					<div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 mb-6">
						<h1 className="text-3xl font-bold text-white mb-2">
							Welcome back, {user?.username || "User"}! 👋
						</h1>
						<p className="text-gray-300 text-lg">
							Ready to continue your learning journey?
						</p>
					</div>

					{/* Stats Cards - Simplified One Line */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
						{stats.map((stat, index) => (
							<div
								key={index}
								className="bg-white/[0.02] backdrop-blur-xl rounded-xl p-3 border border-white/5"
							>
								<div className="flex items-center gap-2">
									<span className="text-lg">{stat.icon}</span>
									<div>
										<div className={`text-sm font-bold ${stat.color}`}>
											{stat.value}
											<span className="text-gray-500 text-xs ml-1">
												{stat.suffix}
											</span>
										</div>
										<div className="text-gray-400 text-xs">{stat.label}</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* AI Study Assistant - Main Feature */}
					<div className="border-light-gradient  backdrop-blur-xl rounded-2xl p-6 border-0 relative overflow-hidden mb-8">
						<div className="absolute top-0 right-0 w-40 h-40 bg-[#ffd859]/20 rounded-full blur-3xl"></div>
						<div className="absolute bottom-0 left-0 w-32 h-32 bg-[#4f8bff]/20 rounded-full blur-2xl"></div>

						<div className="relative z-10">
							<div className="flex items-center gap-4 mb-4">
								<div className="w-14 h-14 bg-gradient-to-br from-[#ffd859] to-[#ffeb82] rounded-2xl flex items-center justify-center shadow-lg">
									<span className="text-black font-bold text-xl">🤖</span>
								</div>
								<div>
									<h2 className="text-xl font-bold text-white">
										AI Study Assistant
									</h2>
									<p className="text-gray-300 text-base">
										Your personal learning companion
									</p>
								</div>
							</div>

							{/* Attached Files Display */}
							{attachedFiles.length > 0 && (
								<div className="mb-4 space-y-2">
									<div className="text-base text-gray-400 mb-2">
										Attached files:
									</div>
									{attachedFiles.map((file, index) => (
										<div
											key={index}
											className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3"
										>
											<div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
												<svg
													className="w-4 h-4 text-red-400"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-white text-base font-medium truncate">
													{file.name}
												</div>
												<div className="text-gray-400 text-sm">
													{(file.size / 1024 / 1024).toFixed(1)} MB
												</div>
											</div>
											<button
												onClick={() => handleRemoveFile(index)}
												className="p-1 text-gray-400 hover:text-red-400 transition-colors"
											>
												<svg
													className="w-4 h-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</button>
										</div>
									))}
								</div>
							)}

							<div className="space-y-3">
								{/* Input with attachment button */}
								<div className="relative">
									<div className="flex items-center gap-2">
										<div className="flex-1 relative">
											<input
												type="text"
												value={aiInput}
												onChange={(e) => setAiInput(e.target.value)}
												onKeyPress={handleKeyPress}
												placeholder={
													attachedFiles.length > 0
														? "Ask about your uploaded files..."
														: "Ask me anything or upload files to get started... 💡"
												}
												className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd859]/50 focus:bg-white/15 transition-all duration-300 text-sm"
												disabled={uploading}
											/>
										</div>

										{/* File Upload Button */}
										<label className="flex-shrink-0 p-3 text-gray-400 hover:text-[#ffd859] transition-colors cursor-pointer hover:bg-white/10 rounded-lg border border-transparent hover:border-white/20">
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
												/>
											</svg>
											<input
												type="file"
												accept=".pdf"
												multiple
												className="hidden"
												onChange={handleFileSelect}
												disabled={uploading}
											/>
										</label>

										{/* Send Button */}
										<button
											onClick={handleSendMessage}
											disabled={
												(!aiInput.trim() && attachedFiles.length === 0) ||
												uploading
											}
											className="flex-shrink-0 bg-gradient-to-r from-[#ffd859] to-[#ffeb82] hover:from-[#ffeb82] hover:to-[#ffd859] px-4 py-3 rounded-xl text-black font-semibold transition-all duration-300 shadow-lg shadow-[#ffd859]/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-light-gradient text-sm"
										>
											{uploading ? (
												<div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
											) : (
												"Ask AI ✨"
											)}
										</button>
									</div>
								</div>

								{/* Quick Actions */}
								<div className="flex gap-2 text-sm">
									<button
										onClick={() => setAiInput("Summarize this document for me")}
										className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-gray-300 hover:text-white transition-all duration-200"
									>
										✨ Summarize
									</button>
									<button
										onClick={() =>
											setAiInput("Create study notes from this material")
										}
										className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-gray-300 hover:text-white transition-all duration-200"
									>
										📝 Study Notes
									</button>
									<button
										onClick={() =>
											setAiInput("Generate quiz questions from this content")
										}
										className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-gray-300 hover:text-white transition-all duration-200"
									>
										❓ Quiz Me
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Recent Activity - Minimal */}
					<div className="bg-white/[0.02] backdrop-blur-xl rounded-xl p-4 border border-white/5">
						<h3 className="text-base font-semibold text-white mb-3">
							Recent Activity
						</h3>
						<div className="space-y-2">
							{recentActivity.slice(0, 2).map((activity, index) => (
								<div
									key={index}
									className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
								>
									<span className="text-sm">{activity.icon}</span>
									<div className="flex-1">
										<div className="text-white text-sm">{activity.subject}</div>
										<div className="text-gray-500 text-xs">{activity.time}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
