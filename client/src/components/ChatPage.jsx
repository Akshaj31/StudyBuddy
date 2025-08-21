import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { queryAPI, handleAPIError } from "../services/api.js";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

const ChatPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { sessionId: urlSessionId } = useParams();
	const { user, authenticated, loading, logout } = useAuth();

	const [messages, setMessages] = useState([]);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [currentSessionId, setCurrentSessionId] = useState(null);
	const [chatSessions, setChatSessions] = useState([]);
	const [loadingChats, setLoadingChats] = useState(true);
	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);

	// Fetch chat sessions for sidebar
	const fetchChatSessions = useCallback(async () => {
		if (!authenticated) return;

		try {
			setLoadingChats(true);
			const response = await queryAPI.getChatSessions();
			const result = await handleAPIError(response);
			setChatSessions(result.sessions || []);
		} catch (error) {
			console.error("Error fetching chat sessions:", error);
			setChatSessions([]);
		} finally {
			setLoadingChats(false);
		}
	}, [authenticated]);

	// Load chat sessions when component mounts
	useEffect(() => {
		fetchChatSessions();
	}, [fetchChatSessions]);

	// Initialize chat based on URL and route
	useEffect(() => {
		const initializeChat = async () => {
			try {
				const { initialMessage, uploadedDocuments } = location.state || {};
				const isNewChat =
					window.location.pathname === "/chat/new" ||
					window.location.pathname === "/chat";

				if (urlSessionId && urlSessionId !== "new") {
					// Load existing chat session
					try {
						console.log("🔍 Loading chat session:", urlSessionId);
						const response = await queryAPI.getChatSession(urlSessionId);
						const result = await handleAPIError(response);

						// Load messages from the session
						const sessionMessages = result.messages || [];
						console.log("🔍 Loaded messages:", sessionMessages.length);

						// Set flag to prevent auto-scroll when loading existing chat
						isLoadingExistingChat.current = true;
						setMessages(sessionMessages);
						setCurrentSessionId(urlSessionId);
					} catch (error) {
						console.error("Error loading chat session:", error);
						// If session not found, redirect to new chat
						navigate("/chat/new", { replace: true });
						return;
					}
				} else if (isNewChat) {
					// Create new chat session
					const welcomeMessage = {
						role: "assistant",
						content: uploadedDocuments
							? `Great! I've received your ${uploadedDocuments.length} document(s). I'm ready to help you understand and learn from them. What would you like to know?`
							: "Hi! I'm your StudyBuddy AI assistant. How can I help you today?",
						timestamp: new Date(),
					};

					// Reset scroll behavior for new chat
					shouldAutoScroll.current = true;
					setMessages([welcomeMessage]);

					// If there's an initial message from dashboard, send it automatically
					if (initialMessage) {
						// Wait a bit for the welcome message to render
						await new Promise((resolve) => setTimeout(resolve, 500));

						const userMessage = {
							role: "user",
							content: initialMessage.trim(),
							timestamp: new Date(),
						};

						setMessages((prev) => [...prev, userMessage]);
						setIsLoading(true);

						try {
							const response = await queryAPI.askQuestion(
								initialMessage.trim(),
								null // No session ID for new chat
							);
							const result = await handleAPIError(response);

							const aiMessage = {
								role: "assistant",
								content: result.response,
								timestamp: new Date(),
								sources: result.sources || [],
								hasRelevantContext: result.hasRelevantContext || false,
							};

							setMessages((prev) => [...prev, aiMessage]);

							if (result.sessionId) {
								setCurrentSessionId(result.sessionId);
								// Update URL to reflect the new session
								navigate(`/chat/${result.sessionId}`, { replace: true });
							}
						} catch (error) {
							console.error("Initial message error:", error);

							const errorMessage = {
								role: "assistant",
								content: `Sorry, I encountered an error: ${error.message}. Please make sure you have uploaded some documents first.`,
								timestamp: new Date(),
								isError: true,
							};

							setMessages((prev) => [...prev, errorMessage]);
						} finally {
							setIsLoading(false);
						}
					}
				}
			} catch (error) {
				console.error("Chat initialization error:", error);
			}
		};

		initializeChat();
	}, [urlSessionId, location.state, navigate]); // Include URL params and navigation

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	// Scroll behavior management
	const prevMessagesLength = useRef(0);
	const isLoadingExistingChat = useRef(false);
	const shouldAutoScroll = useRef(true);

	useEffect(() => {
		// Don't auto-scroll when loading an existing chat
		if (isLoadingExistingChat.current) {
			isLoadingExistingChat.current = false;
			shouldAutoScroll.current = false;
			prevMessagesLength.current = messages.length;
			return;
		}

		// Only scroll if new messages were added and auto-scroll is enabled
		if (
			messages.length > prevMessagesLength.current &&
			shouldAutoScroll.current
		) {
			// Use setTimeout to ensure DOM is updated
			setTimeout(() => {
				scrollToBottom();
			}, 100);
		}

		prevMessagesLength.current = messages.length;
	}, [messages]);

	// Enable auto-scroll when user scrolls near bottom
	const handleScroll = (e) => {
		const { scrollTop, scrollHeight, clientHeight } = e.target;
		const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
		shouldAutoScroll.current = isNearBottom;
	};

	const sendMessage = useCallback(
		async (messageText = inputValue) => {
			if (!messageText.trim() || isLoading) return;

			const userMessage = {
				role: "user",
				content: messageText.trim(),
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, userMessage]);
			setInputValue("");
			setIsLoading(true);

			try {
				const response = await queryAPI.askQuestion(
					messageText.trim(),
					currentSessionId
				);
				const result = await handleAPIError(response);

				const aiMessage = {
					role: "assistant",
					content: result.response,
					timestamp: new Date(),
					sources: result.sources || [],
					hasRelevantContext: result.hasRelevantContext || false,
				};

				setMessages((prev) => [...prev, aiMessage]);

				if (result.sessionId && !currentSessionId) {
					setCurrentSessionId(result.sessionId);
					// Update URL to reflect the new session
					navigate(`/chat/${result.sessionId}`, { replace: true });
				}
			} catch (error) {
				console.error("Query error:", error);

				const errorMessage = {
					role: "assistant",
					content: `Sorry, I encountered an error: ${error.message}. Please make sure you have uploaded some documents first.`,
					timestamp: new Date(),
					isError: true,
				};

				setMessages((prev) => [...prev, errorMessage]);
			} finally {
				setIsLoading(false);
				inputRef.current?.focus();
			}
		},
		[inputValue, isLoading, currentSessionId, navigate]
	);

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const clearChat = () => {
		setMessages([
			{
				role: "assistant",
				content: "Chat cleared! How can I help you?",
				timestamp: new Date(),
			},
		]);
		setCurrentSessionId(null);
	};

	const formatTimestamp = (timestamp) => {
		return new Date(timestamp).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Handle logout functionality
	const handleLogout = () => {
		if (window.confirm("Are you sure you want to logout?")) {
			logout();
		}
	};

	// Show loading state while checking authentication
	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-[#ffd859] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<div className="text-white text-lg">Loading...</div>
				</div>
			</div>
		);
	}

	if (!authenticated) {
		return null;
	}

	return (
		<div className="fixed inset-0 flex overflow-hidden">
			{/* Sidebar */}
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
							<span className="text-sm font-medium">Clear</span>
						</button>
					</div>

					{/* Chat History */}
					<div className="flex-1 flex flex-col min-h-0 overflow-hidden">
						<div className="flex items-center justify-between mb-4 flex-shrink-0">
							<h3 className="text-gray-300 font-medium text-base">Chats</h3>
							<span className="text-xs text-gray-500">
								{chatSessions.length}
							</span>
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
							) : chatSessions.length > 0 ? (
								chatSessions.map((session) => {
									const isActive = session.sessionId === currentSessionId;
									const messageCount = session.messages
										? session.messages.length
										: 0;

									return (
										<button
											type="button"
											key={session.sessionId}
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												console.log(
													"🔍 Clicking chat session:",
													session.sessionId
												);
												console.log("🔍 Current sessionId:", currentSessionId);

												// Add small delay to ensure click is registered
												setTimeout(() => {
													navigate(`/chat/${session.sessionId}`);
												}, 50);
											}}
											className={`w-full flex items-center gap-2 p-3 rounded-md text-left transition-all duration-200 ${
												isActive
													? "bg-gray-800/50 text-gray-100"
													: "text-gray-400 hover:bg-gray-800/30 hover:text-gray-200"
											}`}
										>
											<div className="flex-1 min-w-0">
												<div className="font-medium truncate text-base leading-5">
													{session.title || "Untitled Chat"}
												</div>
												<div className="text-sm opacity-60 mt-0.5">
													{messageCount} msgs
												</div>
											</div>
											{isActive && (
												<div className="w-2 h-2 bg-[#ffd859] rounded-full"></div>
											)}
										</button>
									);
								})
							) : (
								<div className="text-center py-8">
									<div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
										<span className="text-2xl opacity-50">💬</span>
									</div>
									<p className="text-gray-400 text-base">No chat history yet</p>
								</div>
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

			{/* Main Chat Area */}
			<div className="flex-1 flex flex-col h-full overflow-hidden">
				{/* Chat Header */}
				<div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4 flex-shrink-0">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div>
								<h3 className="text-gray-200 font-medium text-base">Chat</h3>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<span className="text-green-400 text-xs">●</span>
							<span className="text-gray-400 text-xs font-medium">Online</span>
						</div>
					</div>
				</div>

				{/* Messages Container */}
				<div className="flex-1 flex flex-col min-h-0 overflow-hidden">
					<div
						className="flex-1 overflow-y-auto p-6 min-h-0"
						onScroll={handleScroll}
					>
						<div className="space-y-4">
							{messages.map((message, index) => (
								<div
									key={index}
									className={`flex ${
										message.role === "user" ? "justify-end" : "justify-start"
									}`}
								>
									<div
										className={`max-w-[80%] ${
											message.role === "user"
												? "bg-gray-700 text-gray-100"
												: message.isError
												? "bg-red-900/30 text-red-300 border border-red-800/50"
												: "bg-gray-800/50 text-gray-200"
										} rounded-lg p-4 border-light-gradient`}
									>
										<div className="text-base leading-relaxed">
											{message.role === "assistant" ? (
												<div className="prose prose-sm prose-invert max-w-none">
													<ReactMarkdown
														rehypePlugins={[rehypeHighlight]}
														components={{
															// Fun and engaging styling for students
															p: (props) => (
																<p
																	className="mb-3 text-gray-200 leading-relaxed text-base"
																	{...props}
																/>
															),
															h1: (props) => (
																<h1
																	className="text-lg font-bold mb-4 mt-5 text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text border-l-4 border-yellow-400 pl-3"
																	{...props}
																/>
															),
															h2: (props) => (
																<h2
																	className="text-lg font-bold mb-3 mt-4 text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text border-l-3 border-green-400 pl-2"
																	{...props}
																/>
															),
															h3: (props) => (
																<h3
																	className="text-base font-bold mb-2 mt-3 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text"
																	{...props}
																/>
															),
															ul: (props) => (
																<ul
																	className="mb-4 ml-6 space-y-2"
																	{...props}
																/>
															),
															ol: (props) => (
																<ol
																	className="mb-4 ml-6 space-y-2"
																	{...props}
																/>
															),
															li: (props) => (
																<li
																	className="relative before:content-['✨'] before:absolute before:-left-6 before:text-yellow-400 text-gray-100"
																	{...props}
																/>
															),
															strong: (props) => (
																<strong
																	className="font-semibold text-yellow-300 bg-yellow-300/10 px-1 rounded"
																	{...props}
																/>
															),
															em: (props) => (
																<em
																	className="italic text-green-300"
																	{...props}
																/>
															),
															code: ({ inline, ...props }) =>
																inline ? (
																	<code
																		className="bg-gradient-to-r from-purple-900 to-blue-900 px-2 py-1 rounded text-yellow-200 text-xs font-mono border border-purple-500/30"
																		{...props}
																	/>
																) : (
																	<code
																		className="block bg-gradient-to-br from-gray-900 to-slate-800 p-4 rounded-lg overflow-x-auto border border-slate-600 shadow-lg"
																		{...props}
																	/>
																),
															blockquote: (props) => (
																<blockquote
																	className="border-l-4 border-blue-400 pl-4 my-4 bg-blue-900/20 py-2 rounded-r italic text-blue-200"
																	{...props}
																/>
															),
															hr: (props) => (
																<hr
																	className="my-6 border-gradient-to-r from-transparent via-yellow-400 to-transparent"
																	{...props}
																/>
															),
														}}
													>
														{message.content}
													</ReactMarkdown>
												</div>
											) : (
												<div className="whitespace-pre-wrap">
													{message.content}
												</div>
											)}
										</div>

										{/* Show source type indicator for AI messages */}
										{message.role === "assistant" && !message.isError && (
											<div className="mt-2 mb-1">
												<span
													className={`text-xs px-2 py-1 rounded-full ${
														message.hasRelevantContext
															? "bg-green-500/20 text-green-400 border border-green-500/30"
															: "bg-blue-500/20 text-blue-400 border border-blue-500/30"
													}`}
												>
													{message.hasRelevantContext
														? "📚 Based on your documents"
														: "🧠 General knowledge"}
												</span>
											</div>
										)}

										{message.sources && message.sources.length > 0 && (
											<div className="mt-3 pt-3 border-t border-slate-600">
												<p className="text-xs text-slate-400 mb-2">Sources:</p>
												<div className="space-y-1">
													{message.sources.map((source, idx) => (
														<div
															key={idx}
															className="text-xs text-slate-300 bg-slate-700/50 rounded px-2 py-1"
														>
															📄 Page {source.page}{" "}
															{source.score &&
																`(${Math.round(source.score * 100)}% match)`}
														</div>
													))}
												</div>
											</div>
										)}

										<div
											className={`text-xs mt-2 ${
												message.role === "user"
													? "text-slate-700"
													: "text-slate-500"
											}`}
										>
											{formatTimestamp(message.timestamp)}
										</div>
									</div>
								</div>
							))}

							{isLoading && (
								<div className="flex justify-start">
									<div className="bg-slate-800 text-white rounded-lg p-4 shadow-lg border border-slate-700">
										<div className="flex items-center space-x-2">
											<div className="flex space-x-1">
												<div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
												<div
													className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
													style={{ animationDelay: "0.1s" }}
												></div>
												<div
													className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
													style={{ animationDelay: "0.2s" }}
												></div>
											</div>
											<span className="text-base text-slate-400">
												AI is thinking...
											</span>
										</div>
									</div>
								</div>
							)}

							<div ref={messagesEndRef} />
						</div>
					</div>
				</div>

				{/* Input Form */}
				<div className="bg-black/20 backdrop-blur-sm border-t border-white/10 p-6 flex-shrink-0">
					<div className="flex space-x-3">
						<input
							ref={inputRef}
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Type a message..."
							className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600 text-base border-light-gradient"
							disabled={isLoading}
						/>
						<button
							onClick={() => sendMessage()}
							disabled={!inputValue.trim() || isLoading}
							className="px-5 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-base font-medium"
						>
							{isLoading ? (
								<div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
							) : (
								"Send"
							)}
							<span>Send</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatPage;
