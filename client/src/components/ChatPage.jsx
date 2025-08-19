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
	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);
	const initializationRef = useRef(false);

	// Initialize chat based on URL and route
	useEffect(() => {
		// Prevent multiple initializations using ref
		if (initializationRef.current) return;

		const initializeChat = async () => {
			try {
				initializationRef.current = true; // Set flag immediately

				const { initialMessage, uploadedDocuments } = location.state || {};
				const isNewChat =
					window.location.pathname === "/chat/new" ||
					window.location.pathname === "/chat";

				if (urlSessionId && urlSessionId !== "new") {
					// Load existing chat session
					try {
						const response = await queryAPI.getChatSession(urlSessionId);
						const result = await handleAPIError(response);

						// Load messages from the session
						const sessionMessages = result.messages || [];
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

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

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
					<div className="text-white text-xl">Loading...</div>
				</div>
			</div>
		);
	}

	if (!authenticated) {
		return null;
	}

	return (
		<div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
			{/* Sidebar */}
			<div className="w-72 bg-white/[0.02] backdrop-blur-xl border-r border-white/10 flex flex-col relative">
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
							<p className="text-gray-400 text-sm">AI Chat Assistant</p>
						</div>
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 p-6 relative">
					<ul className="space-y-3">
						<li>
							<button
								onClick={() => navigate("/dashboard")}
								className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 group relative overflow-hidden text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/20 border border-transparent"
							>
								<span className="text-xl relative z-10">📊</span>
								<span className="font-medium relative z-10">
									← Back to Dashboard
								</span>
							</button>
						</li>
						<li>
							<button
								onClick={() => navigate("/chat/new")}
								className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 group relative overflow-hidden text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/20 border border-transparent"
							>
								<span className="text-xl relative z-10">💬</span>
								<span className="font-medium relative z-10">New Chat</span>
							</button>
						</li>
						<li>
							<button
								onClick={clearChat}
								className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 group relative overflow-hidden text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/20 border border-transparent"
							>
								<span className="text-xl relative z-10">🗑️</span>
								<span className="font-medium relative z-10">Clear Chat</span>
							</button>
						</li>
					</ul>
				</nav>

				{/* User Profile */}
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

						<button
							onClick={handleLogout}
							className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-xl py-3 px-4 text-red-300 hover:text-red-200 font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
						>
							<span className="text-lg">🚪</span>
							<span>Logout</span>
						</button>
					</div>
				</div>
			</div>

			{/* Main Chat Area */}
			<div className="flex-1 flex flex-col">
				{/* Chat Header */}
				<div className="bg-white/[0.03] backdrop-blur-xl border-b border-white/10 p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-gradient-to-br from-[#ffd859] to-[#ffed95] rounded-full flex items-center justify-center">
								<svg
									className="w-5 h-5 text-slate-900"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
							</div>
							<div>
								<h3 className="text-white font-semibold">StudyBuddy AI Chat</h3>
								<p className="text-slate-400 text-sm">
									{currentSessionId
										? `Session active`
										: "Ready to help you learn"}
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
							<span className="text-green-400 text-sm">Online</span>
						</div>
					</div>
				</div>

				{/* Messages Container */}
				<div className="flex-1 overflow-y-auto p-6 space-y-4">
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
										? "bg-[#ffd859] text-slate-900"
										: message.isError
										? "bg-red-900/50 text-red-200 border border-red-700/50"
										: "bg-slate-800 text-white border border-slate-700"
								} rounded-lg p-4 shadow-lg`}
							>
								<div className="text-sm leading-relaxed">
									{message.role === "assistant" ? (
										<div className="prose prose-sm prose-invert max-w-none">
											<ReactMarkdown
												rehypePlugins={[rehypeHighlight]}
												components={{
													// Fun and engaging styling for students
													p: (props) => (
														<p
															className="mb-4 leading-relaxed text-gray-100"
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
															className="text-base font-bold mb-3 mt-4 text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text border-l-3 border-green-400 pl-2"
															{...props}
														/>
													),
													h3: (props) => (
														<h3
															className="text-sm font-bold mb-2 mt-3 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text"
															{...props}
														/>
													),
													ul: (props) => (
														<ul className="mb-4 ml-6 space-y-2" {...props} />
													),
													ol: (props) => (
														<ol className="mb-4 ml-6 space-y-2" {...props} />
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
														<em className="italic text-green-300" {...props} />
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
										<div className="whitespace-pre-wrap">{message.content}</div>
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
									<span className="text-sm text-slate-400">
										AI is thinking...
									</span>
								</div>
							</div>
						</div>
					)}

					<div ref={messagesEndRef} />
				</div>

				{/* Input Form */}
				<div className="bg-white/[0.03] backdrop-blur-xl border-t border-white/10 p-6">
					<div className="flex space-x-4">
						<input
							ref={inputRef}
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Continue the conversation..."
							className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ffd859] focus:border-transparent"
							disabled={isLoading}
						/>
						<button
							onClick={() => sendMessage()}
							disabled={!inputValue.trim() || isLoading}
							className="px-6 py-3 bg-gradient-to-r from-[#ffd859] to-[#ffed95] text-slate-900 font-medium rounded-xl hover:shadow-lg hover:shadow-[#ffd859]/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
						>
							{isLoading ? (
								<div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
							) : (
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
										d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
									/>
								</svg>
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
