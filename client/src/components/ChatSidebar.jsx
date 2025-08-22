import React from "react";

const ChatSidebar = ({
	user,
	chatSessions,
	loadingChats,
	searchQuery,
	setSearchQuery,
	currentSessionId,
	navigate,
	clearChat,
	logout,
}) => {
	// Helper function to group chats by date
	const groupChatsByDate = (sessions) => {
		if (!sessions.length) return {};

		const groups = {};
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
		const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

		sessions.forEach((session) => {
			const sessionDate = new Date(session.updatedAt);
			const sessionDay = new Date(
				sessionDate.getFullYear(),
				sessionDate.getMonth(),
				sessionDate.getDate()
			);

			let group;
			if (sessionDay.getTime() === today.getTime()) {
				group = "Today";
			} else if (sessionDay.getTime() === yesterday.getTime()) {
				group = "Yesterday";
			} else if (sessionDate >= weekAgo) {
				group = "Previous 7 days";
			} else {
				group = "Older";
			}

			if (!groups[group]) groups[group] = [];
			groups[group].push(session);
		});

		return groups;
	};

	// Filter chats based on search query
	const getFilteredChats = () => {
		if (!searchQuery.trim()) return chatSessions;

		return chatSessions.filter((session) =>
			(session.title || "Untitled Chat")
				.toLowerCase()
				.includes(searchQuery.toLowerCase())
		);
	};

	const handleLogout = () => {
		if (window.confirm("Are you sure you want to logout?")) {
			logout();
		}
	};

	return (
		<div className="w-64 bg-black/30 backdrop-blur-sm border-r border-white/10 flex flex-col relative h-full border-light-gradient">
			{/* Logo Section */}
			<div className="relative p-6 border-b border-white/10 flex-shrink-0">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
						<span className="text-gray-300 text-sm">📚</span>
					</div>
					<div>
						<h1 className="text-gray-100 font-medium text-lg">StudyBuddy</h1>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 p-6 relative flex flex-col min-h-0">
				{/* Quick Actions */}
				<div className="space-y-2 mb-6 flex-shrink-0">
					<button
						onClick={() => navigate("/dashboard")}
						className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 text-gray-400 hover:bg-gray-800/30 hover:text-gray-200"
					>
						<span className="text-base">←</span>
						<span className="text-base font-medium">Dashboard</span>
					</button>
					<button
						onClick={() => navigate("/chat/new")}
						className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 text-gray-400 hover:bg-gray-800/30 hover:text-gray-200"
					>
						<span className="text-base">+</span>
						<span className="text-base font-medium">New Chat</span>
					</button>
					<button
						onClick={clearChat}
						className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 text-gray-400 hover:bg-gray-800/30 hover:text-gray-200"
					>
						<span className="text-base">×</span>
						<span className="text-base font-medium">Clear</span>
					</button>
				</div>

				{/* Chat History */}
				<div className="flex-1 flex flex-col min-h-0 overflow-hidden">
					<div className="flex items-center justify-between mb-4 flex-shrink-0">
						<h3 className="text-gray-300 font-semibold text-base">Chats</h3>
						<span className="text-xs text-gray-500">
							{getFilteredChats().length}
						</span>
					</div>

					{/* Search Bar */}
					<div className="mb-4 flex-shrink-0">
						<input
							type="text"
							placeholder="Search chats..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600 text-sm"
						/>
					</div>

					<div className="flex-1 overflow-y-auto space-y-2 min-h-0">
						{loadingChats ? (
							<div className="space-y-3">
								{[1, 2, 3, 4, 5].map((i) => (
									<div
										key={i}
										className="animate-pulse flex gap-3 p-3 bg-white/5 rounded-xl"
									>
										<div className="w-8 h-8 bg-white/10 rounded-lg"></div>
										<div className="flex-1 space-y-2">
											<div className="h-3 bg-white/10 rounded w-3/4"></div>
											<div className="h-2 bg-white/10 rounded w-1/2"></div>
										</div>
									</div>
								))}
							</div>
						) : (
							(() => {
								const filteredChats = getFilteredChats();
								const groupedChats = groupChatsByDate(filteredChats);
								const groupOrder = [
									"Today",
									"Yesterday",
									"Previous 7 days",
									"Older",
								];

								if (filteredChats.length === 0) {
									return (
										<div className="text-center py-8">
											<div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
												<span className="text-2xl opacity-50">💬</span>
											</div>
											<p className="text-gray-400 text-sm">
												{searchQuery ? "No chats found" : "No chat history yet"}
											</p>
										</div>
									);
								}

								return (
									<div className="space-y-4">
										{groupOrder.map((groupName) => {
											const groupChats = groupedChats[groupName];
											if (!groupChats || groupChats.length === 0) return null;

											return (
												<div key={groupName}>
													<div className="text-xs text-gray-500 font-medium mb-2 px-1">
														{groupName}
													</div>
													<div className="space-y-1">
														{groupChats.map((session) => {
															const isActive =
																session.sessionId === currentSessionId;
															const messageCount = session.messages
																? session.messages.length
																: 0;
															const title = session.title || "Untitled Chat";

															return (
																<button
																	type="button"
																	key={session.sessionId}
																	onClick={() =>
																		navigate(`/chat/${session.sessionId}`)
																	}
																	className={`w-full flex items-center gap-2 p-3 rounded-md text-left transition-all duration-200 ${
																		isActive
																			? "bg-gray-800/50 text-gray-100"
																			: "text-gray-400 hover:bg-gray-800/30 hover:text-gray-200"
																	}`}
																	title={title}
																>
																	<div className="flex-1 min-w-0">
																		<div className="font-medium text-sm leading-5 truncate">
																			{title}
																		</div>
																		<div className="text-xs opacity-60 mt-0.5">
																			{messageCount} msgs
																		</div>
																	</div>
																	{isActive && (
																		<div className="w-2 h-2 bg-[#ffd859] rounded-full flex-shrink-0"></div>
																	)}
																</button>
															);
														})}
													</div>
												</div>
											);
										})}
									</div>
								);
							})()
						)}
					</div>
				</div>
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
	);
};

export default ChatSidebar;
