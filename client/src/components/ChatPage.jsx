import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { queryAPI, handleAPIError } from "../services/api.js";
import { useFileUpload } from "../hooks/useFileUpload.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import ChatSidebar from "./ChatSidebar.jsx";
import ChatInput from "./ChatInput.jsx";

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
	const [searchQuery, setSearchQuery] = useState("");

	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);
	const {
		attachedFiles,
		uploading,
		handleFileSelect,
		handleRemoveFile,
		uploadFiles,
	} = useFileUpload();

	// Helper function to get current chat title
	const getCurrentChatTitle = () => {
		if (!currentSessionId) return "New Chat";
		const currentSession = chatSessions.find(
			(s) => s.sessionId === currentSessionId
		);
		return currentSession?.title || "Chat";
	};

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
						const response = await queryAPI.getChatSession(urlSessionId);
						const result = await handleAPIError(response);

						// Load messages from the session
						const sessionMessages = result.messages || [];

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
			if (
				(!messageText.trim() && attachedFiles.length === 0) ||
				isLoading ||
				uploading
			)
				return;

			try {
				// Handle file uploads first if any
				let uploadedDocuments = null;
				if (attachedFiles.length > 0) {
					uploadedDocuments = await uploadFiles();
				}

				const finalMessage =
					messageText.trim() ||
					(uploadedDocuments
						? `I've uploaded ${uploadedDocuments.length} file(s). Please help me understand them.`
						: "");

				if (!finalMessage) return;

				const userMessage = {
					role: "user",
					content: finalMessage,
					timestamp: new Date(),
					attachments: uploadedDocuments || undefined,
				};

				setMessages((prev) => [...prev, userMessage]);
				setInputValue("");
				setIsLoading(true);

				const response = await queryAPI.askQuestion(
					finalMessage,
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
					// Refresh chat sessions to include the new one
					fetchChatSessions();
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
		[
			inputValue,
			isLoading,
			currentSessionId,
			navigate,
			attachedFiles,
			uploading,
			fetchChatSessions,
			uploadFiles,
		]
	);

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

	// Show loading state while checking authentication
	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
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
			<ChatSidebar
				user={user}
				chatSessions={chatSessions}
				loadingChats={loadingChats}
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				currentSessionId={currentSessionId}
				navigate={navigate}
				clearChat={clearChat}
				logout={logout}
			/>

			{/* Main Chat Area */}
			<div className="flex-1 flex flex-col h-full overflow-hidden relative">
				{/* Chat Header */}
				<div className="bg-gray-900/40 backdrop-blur-xl border-b border-gray-600/50 p-5 flex-shrink-0 shadow-lg">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div>
								<h3 className="text-gray-100 font-bold text-xl">{getCurrentChatTitle()}</h3>
								<p className="text-gray-400 text-sm">AI Study Assistant</p>
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
						className="flex-1 overflow-y-auto px-4 py-6 pb-32 min-h-0"
						onScroll={handleScroll}
					>
						<div className="space-y-6 max-w-3xl mx-auto">
							{messages.map((message, index) => (
								<div key={index} className="mb-6">
									{message.role === "user" ? (
										// User message with bubble (like ChatGPT)
										<div className="flex justify-end mb-4">
											<div className="max-w-[80%] bg-[#ffd859]/10 text-gray-100 border border-[#ffd859]/20 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
												<div className="text-sm text-gray-100 leading-relaxed">
													{message.content}
												</div>
												{/* Show file attachments for user messages */}
												{message.attachments && message.attachments.length > 0 && (
													<div className="mt-3 flex flex-wrap gap-2">
														{message.attachments.map((attachment, idx) => (
															<div
																key={idx}
																className="bg-[#ffd859]/20 text-[#ffd859] px-3 py-1 rounded-lg text-xs flex items-center gap-2 border border-[#ffd859]/30"
															>
																{attachment.type === "image" ? (
																	<span>🖼️</span>
																) : (
																	<span>📄</span>
																)}
																{attachment.name}
															</div>
														))}
													</div>
												)}
											</div>
										</div>
									) : (
										// AI response without bubble (like ChatGPT)
										<div className="mb-6">
											{message.isError ? (
												<div className="bg-red-900/20 text-red-300 border border-red-800/30 rounded-xl p-4 shadow-sm backdrop-blur-sm">
													<div className="text-sm leading-relaxed">
														{message.content}
													</div>
												</div>
											) : (
												<div className="text-gray-200 leading-relaxed">
													<div className="prose prose-sm prose-invert max-w-none">
														<ReactMarkdown
															rehypePlugins={[rehypeHighlight]}
															components={{
																// Clean, consistent styling that matches your theme
																p: (props) => (
																	<p
																		className="mb-4 text-gray-200 leading-relaxed text-sm"
																		{...props}
																	/>
																),
																h1: (props) => (
																	<h1
																		className="text-lg font-bold mb-4 mt-6 text-white border-l-2 border-[#ffd859] pl-3"
																		{...props}
																	/>
																),
																h2: (props) => (
																	<h2
																		className="text-base font-semibold mb-3 mt-5 text-gray-100"
																		{...props}
																	/>
																),
																h3: (props) => (
																	<h3
																		className="text-sm font-semibold mb-2 mt-4 text-gray-200"
																		{...props}
																	/>
																),
																ul: (props) => (
																	<ul
																		className="mb-4 ml-4 space-y-2 text-sm"
																		{...props}
																	/>
																),
																ol: (props) => (
																	<ol
																		className="mb-4 ml-4 space-y-2 text-sm list-decimal"
																		{...props}
																	/>
																),
																li: (props) => (
																	<li className="text-gray-200 leading-relaxed" {...props} />
																),
																hr: (props) => (
																	<hr
																		className="my-6 border-gray-600/40 border-t"
																		{...props}
																	/>
																),
																code: ({ inline, ...props }) =>
																	inline ? (
																		<code
																			className="bg-gray-700/50 px-1.5 py-0.5 rounded text-[#ffd859] text-xs font-mono"
																			{...props}
																		/>
																	) : (
																		<code
																			className="block bg-gray-900/60 p-3 rounded-lg overflow-x-auto border border-gray-700/30 text-xs my-2"
																			{...props}
																		/>
																	),
																blockquote: (props) => (
																	<blockquote
																		className="border-l-3 border-[#ffd859]/40 pl-4 my-4 italic text-gray-300 text-sm bg-gray-800/20 py-3 rounded-r-lg"
																		{...props}
																	/>
																),
																strong: (props) => (
																	<strong
																		className="font-semibold text-gray-100"
																		{...props}
																	/>
																),
																em: (props) => (
																	<em
																		className="italic text-gray-300"
																		{...props}
																	/>
																),
															}}
														>
															{message.content}
														</ReactMarkdown>
													</div>
												</div>
											)}
										</div>
									)}

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

									{/* Show sources for AI messages */}
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

									{/* Timestamp */}
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
							))}

							{isLoading && (
								<div className="flex justify-start mb-4">
									<div className="bg-gray-800/40 text-white rounded-xl p-6 shadow-lg border border-gray-700/30 backdrop-blur-sm">
										<div className="flex items-center space-x-3">
											<div className="flex space-x-1">
												<div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
												<div
													className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
													style={{ animationDelay: "0.1s" }}
												></div>
												<div
													className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
													style={{ animationDelay: "0.2s" }}
												></div>
											</div>
											<span className="text-base text-gray-300">
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
				<ChatInput
					inputValue={inputValue}
					setInputValue={setInputValue}
					isLoading={isLoading}
					uploading={uploading}
					attachedFiles={attachedFiles}
					handleFileSelect={handleFileSelect}
					handleRemoveFile={handleRemoveFile}
					sendMessage={sendMessage}
					inputRef={inputRef}
				/>
			</div>
		</div>
	);
};

export default ChatPage;
