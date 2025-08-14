import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";

const Dashboard = () => {
	const [activeSection, setActiveSection] = useState("Dashboard");
	const [aiInput, setAiInput] = useState("");

	// Use the authentication hook
	const { user, authenticated, loading, logout } = useAuth();

	// Debug user data (remove in production)
	useEffect(() => {
		if (user) {
			console.log("Authenticated user:", user);
		}
	}, [user]);

	// Show loading state while checking authentication
	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-[#ffd859] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<div className="text-white text-xl">Loading your dashboard...</div>
				</div>
			</div>
		);
	}

	// If not authenticated, the useAuth hook will handle redirection
	if (!authenticated) {
		return null;
	}

	const subjects = [
		{
			name: "Mathematics",
			icon: "🔢",
			quizAvg: 8.5,
			totalQuizzes: 12,
			lastActive: "2 hours ago",
			progress: 85,
			color: "from-purple-500/30 via-blue-500/20 to-indigo-500/30",
			borderColor: "border-purple-400/40",
			shadowColor: "shadow-purple-500/20",
		},
		{
			name: "Physics",
			icon: "⚛️",
			quizAvg: 7.2,
			totalQuizzes: 8,
			lastActive: "1 day ago",
			progress: 62,
			color: "from-emerald-500/30 via-teal-500/20 to-cyan-500/30",
			borderColor: "border-emerald-400/40",
			shadowColor: "shadow-emerald-500/20",
		},
		{
			name: "Chemistry",
			icon: "🧪",
			quizAvg: 9.1,
			totalQuizzes: 15,
			lastActive: "3 hours ago",
			progress: 92,
			color: "from-rose-500/30 via-pink-500/20 to-red-500/30",
			borderColor: "border-rose-400/40",
			shadowColor: "shadow-rose-500/20",
		},
		{
			name: "History",
			icon: "📜",
			quizAvg: 6.8,
			totalQuizzes: 6,
			lastActive: "5 days ago",
			progress: 45,
			color: "from-amber-500/30 via-orange-500/20 to-yellow-500/30",
			borderColor: "border-amber-400/40",
			shadowColor: "shadow-amber-500/20",
		},
		{
			name: "Literature",
			icon: "📖",
			quizAvg: null,
			totalQuizzes: 0,
			lastActive: "Never",
			progress: 0,
			color: "from-slate-500/20 via-gray-500/10 to-slate-600/20",
			borderColor: "border-slate-400/30",
			shadowColor: "shadow-slate-500/10",
		},
		{
			name: "Biology",
			icon: "🧬",
			quizAvg: null,
			totalQuizzes: 0,
			lastActive: "Never",
			progress: 0,
			color: "from-slate-500/20 via-gray-500/10 to-slate-600/20",
			borderColor: "border-slate-400/30",
			shadowColor: "shadow-slate-500/10",
		},
	];

	const sidebarItems = [
		{ name: "Dashboard", icon: "📊", path: "/dashboard" },
		{ name: "Subjects", icon: "📚", path: "/subjects" },
		{ name: "AI Tutor", icon: "🤖", path: "/ai-tutor" },
		{ name: "Progress", icon: "📈", path: "/progress" },
		{ name: "Calendar", icon: "📅", path: "/calendar" },
		{ name: "Settings", icon: "⚙️", path: "/settings" },
	];

	// Handle logout functionality
	const handleLogout = () => {
		if (window.confirm("Are you sure you want to logout?")) {
			logout();
		}
	};

	const stats = [
		{
			label: "Total Study Hours",
			value: "127",
			suffix: "hrs",
			icon: "⏱️",
			color: "text-[#ffd859]",
		},
		{
			label: "Subjects Mastered",
			value: "3",
			suffix: "/6",
			icon: "🎯",
			color: "text-emerald-400",
		},
		{
			label: "Average Score",
			value: "8.2",
			suffix: "/10",
			icon: "⭐",
			color: "text-blue-400",
		},
		{
			label: "Study Streak",
			value: "12",
			suffix: "days",
			icon: "🔥",
			color: "text-orange-400",
		},
	];

	const recentActivity = [
		{
			subject: "Mathematics",
			action: "Completed Quiz",
			score: "9/10",
			time: "2 hours ago",
			icon: "✅",
		},
		{
			subject: "Chemistry",
			action: "Studied Notes",
			score: null,
			time: "3 hours ago",
			icon: "📝",
		},
		{
			subject: "Physics",
			action: "Watched Video",
			score: null,
			time: "1 day ago",
			icon: "🎥",
		},
	];

	return (
		<div className="flex h-screen">
			{/* Enhanced Sidebar */}
			<div className="w-72 bg-white/[0.02] backdrop-blur-xl border-r border-white/10 flex flex-col relative">
				{/* Decorative gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-b from-[#ffd859]/5 via-transparent to-[#4f8bff]/5 pointer-events-none" />

				{/* Logo Section */}
				<div className="relative p-8 border-b border-white/10">
					<div className="flex items-center gap-4">
						<div className="relative">
							<div className="w-12 h-12 bg-gradient-to-br from-[#ffd859] to-[#ffeb82] rounded-2xl flex items-center justify-center shadow-lg shadow-[#ffd859]/25">
								<span className="text-black font-bold text-xl">📚</span>
							</div>
							<div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900"></div>
						</div>
						<div>
							<h1 className="text-white font-bold text-2xl">StudyBuddy</h1>
							<p className="text-gray-400 text-sm">AI-Powered Learning</p>
						</div>
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 p-6 relative">
					<ul className="space-y-3">
						{sidebarItems.map((item) => (
							<li key={item.name}>
								<button
									onClick={() => setActiveSection(item.name)}
									className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 group relative overflow-hidden ${
										item.name === activeSection
											? "bg-gradient-to-r from-[#ffd859]/20 to-[#ffd859]/10 text-[#ffd859] border border-[#ffd859]/30 shadow-lg shadow-[#ffd859]/10"
											: "text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/20 border border-transparent"
									}`}
								>
									{item.name === activeSection && (
										<div className="absolute inset-0 bg-gradient-to-r from-[#ffd859]/10 to-transparent rounded-2xl" />
									)}
									<span className="text-xl relative z-10">{item.icon}</span>
									<span className="font-medium relative z-10">{item.name}</span>
									{item.name === activeSection && (
										<div className="absolute right-4 w-2 h-2 bg-[#ffd859] rounded-full" />
									)}
								</button>
							</li>
						))}
					</ul>
				</nav>

				{/* Enhanced User Profile */}
				<div className="relative p-6 border-t border-white/10">
					<div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
						<div className="flex items-center gap-4 mb-4">
							<div className="relative">
								<div className="w-12 h-12 bg-gradient-to-br from-[#ffd859] to-[#ffeb82] rounded-xl flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-[#ffd859]/25">
									{user?.username?.charAt(0)?.toUpperCase() || "U"}
								</div>
								<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900"></div>
							</div>
							<div className="flex-1 min-w-0">
								<div className="text-white font-semibold truncate">
									{user?.username || "User"}
								</div>
								<div className="text-gray-400 text-sm truncate">
									{user?.email || "user@example.com"}
								</div>
							</div>
						</div>

						{/* Logout Button */}
						<button
							onClick={handleLogout}
							className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-xl py-3 px-4 text-red-300 hover:text-red-200 font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
						>
							<span className="text-lg">🚪</span>
							<span>Logout</span>
							<div className="w-0 group-hover:w-2 h-2 bg-red-400 rounded-full transition-all duration-300"></div>
						</button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-auto bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50">
				<div className="p-8 space-y-8">
					{/* Welcome Header */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-4xl font-bold text-white mb-2">
								Welcome back, {user?.username || "User"}! 👋
							</h1>
							<p className="text-gray-400 text-lg">
								Ready to continue your learning journey?
							</p>
							{user?.lastActive && (
								<p className="text-gray-500 text-sm mt-1">
									Last active: {new Date(user.lastActive).toLocaleDateString()}
								</p>
							)}
						</div>
						<div className="text-right">
							<div className="text-gray-400 text-sm">Today</div>
							<div className="text-white font-semibold text-lg">
								{new Date().toLocaleDateString("en-US", {
									weekday: "long",
									month: "long",
									day: "numeric",
								})}
							</div>
							{/* Authentication Status */}
							<div className="flex items-center gap-2 mt-2">
								<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
								<span className="text-green-400 text-xs">Authenticated</span>
							</div>
						</div>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{stats.map((stat, index) => (
							<div
								key={index}
								className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 group"
							>
								<div className="flex items-center justify-between mb-4">
									<span className="text-2xl">{stat.icon}</span>
									<div className={`text-2xl font-bold ${stat.color}`}>
										{stat.value}
										<span className="text-gray-400 text-sm ml-1">
											{stat.suffix}
										</span>
									</div>
								</div>
								<div className="text-gray-300 font-medium">{stat.label}</div>
							</div>
						))}
					</div>

					{/* AI Helper Section */}
					<div className="bg-gradient-to-r from-white/[0.03] to-white/[0.06] backdrop-blur-xl rounded-3xl p-8 border border-white/10 relative overflow-hidden">
						<div className="absolute top-0 right-0 w-32 h-32 bg-[#ffd859]/10 rounded-full blur-3xl"></div>
						<div className="absolute bottom-0 left-0 w-24 h-24 bg-[#4f8bff]/10 rounded-full blur-2xl"></div>

						<div className="relative z-10">
							<div className="flex items-center gap-3 mb-6">
								<div className="w-12 h-12 bg-gradient-to-br from-[#ffd859] to-[#ffeb82] rounded-2xl flex items-center justify-center">
									<span className="text-black font-bold text-xl">🤖</span>
								</div>
								<div>
									<h2 className="text-2xl font-bold text-white">
										AI Study Assistant
									</h2>
									<p className="text-gray-400">
										Ask questions, get explanations, or upload your notes
									</p>
								</div>
							</div>

							<div className="relative">
								<input
									type="text"
									value={aiInput}
									onChange={(e) => setAiInput(e.target.value)}
									placeholder="Ask me anything about your subjects... 💡"
									className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-5 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd859]/50 focus:bg-white/15 transition-all duration-300 pr-32"
								/>
								<button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#ffd859] to-[#ffeb82] hover:from-[#ffeb82] hover:to-[#ffd859] px-6 py-3 rounded-xl text-black font-bold transition-all duration-300 shadow-lg shadow-[#ffd859]/25 hover:scale-105">
									Ask AI ✨
								</button>
							</div>
						</div>
					</div>

					{/* Subjects Grid */}
					<div>
						<div className="flex items-center justify-between mb-8">
							<h3 className="text-2xl font-bold text-white">Your Subjects</h3>
							<button className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-6 py-3 text-white font-medium transition-all duration-300 hover:scale-105">
								+ Add Subject
							</button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{subjects.map((subject, index) => (
								<div
									key={index}
									className={`bg-gradient-to-br ${subject.color} backdrop-blur-xl rounded-3xl p-6 border ${subject.borderColor} hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden ${subject.shadowColor} hover:shadow-xl`}
								>
									{/* Progress Ring */}
									<div className="absolute top-4 right-4">
										<div className="w-16 h-16 relative">
											<svg
												className="w-16 h-16 transform -rotate-90"
												viewBox="0 0 64 64"
											>
												<circle
													cx="32"
													cy="32"
													r="28"
													stroke="white"
													strokeOpacity="0.1"
													strokeWidth="4"
													fill="none"
												/>
												<circle
													cx="32"
													cy="32"
													r="28"
													stroke="#ffd859"
													strokeWidth="4"
													fill="none"
													strokeDasharray={`${2 * Math.PI * 28}`}
													strokeDashoffset={`${
														2 * Math.PI * 28 * (1 - subject.progress / 100)
													}`}
													className="transition-all duration-500"
												/>
											</svg>
											<div className="absolute inset-0 flex items-center justify-center">
												<span className="text-white font-bold text-sm">
													{subject.progress}%
												</span>
											</div>
										</div>
									</div>

									<div className="mb-4">
										<div className="flex items-center gap-3 mb-2">
											<span className="text-3xl">{subject.icon}</span>
											<h4 className="text-white font-bold text-xl">
												{subject.name}
											</h4>
										</div>
									</div>

									<div className="space-y-4">
										{subject.quizAvg ? (
											<>
												<div>
													<div className="text-gray-300 text-sm mb-1">
														Average Score
													</div>
													<div className="text-white font-bold text-2xl">
														{subject.quizAvg}/10
													</div>
												</div>
												<div>
													<div className="text-gray-300 text-sm mb-1">
														Quizzes Completed
													</div>
													<div className="text-white font-semibold">
														{subject.totalQuizzes} quizzes
													</div>
												</div>
											</>
										) : (
											<div>
												<div className="text-gray-300 text-sm mb-1">Status</div>
												<div className="text-yellow-400 font-semibold">
													Ready to start
												</div>
											</div>
										)}

										<div>
											<div className="text-gray-300 text-sm mb-1">
												Last Active
											</div>
											<div className="text-gray-400 text-sm">
												{subject.lastActive}
											</div>
										</div>
									</div>

									{/* Hover Button */}
									<div className="mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
										<button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl py-3 text-white font-semibold transition-all duration-300">
											{subject.quizAvg ? "Continue Learning" : "Start Subject"}{" "}
											→
										</button>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Recent Activity */}
					<div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl p-8 border border-white/10">
						<h3 className="text-2xl font-bold text-white mb-6">
							Recent Activity
						</h3>
						<div className="space-y-4">
							{recentActivity.map((activity, index) => (
								<div
									key={index}
									className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
								>
									<div className="w-12 h-12 bg-gradient-to-br from-[#ffd859]/20 to-[#ffd859]/10 rounded-xl flex items-center justify-center">
										<span className="text-xl">{activity.icon}</span>
									</div>
									<div className="flex-1">
										<div className="text-white font-semibold">
											{activity.subject}
										</div>
										<div className="text-gray-400 text-sm">
											{activity.action}
										</div>
									</div>
									{activity.score && (
										<div className="text-[#ffd859] font-bold">
											{activity.score}
										</div>
									)}
									<div className="text-gray-500 text-sm">{activity.time}</div>
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
