import React, { useState, useRef, useEffect } from "react";
import { queryAPI, handleAPIError } from "../services/api.js";

const AIChat = ({ className = "" }) => {
	const [messages, setMessages] = useState([
		{
			role: "assistant",
			content:
				"Hi! I'm your StudyBuddy AI. Upload some documents and I'll help you understand them better. Ask me anything about your uploaded materials!",
			timestamp: new Date(),
		},
	]);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [currentSessionId, setCurrentSessionId] = useState(null);
	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSendMessage = async (e) => {
		e.preventDefault();

		if (!inputValue.trim() || isLoading) return;

		const userMessage = {
			role: "user",
			content: inputValue.trim(),
			timestamp: new Date(),
		};

		// Add user message to chat
		setMessages((prev) => [...prev, userMessage]);
		setInputValue("");
		setIsLoading(true);

		try {
			const response = await queryAPI.askQuestion(
				userMessage.content,
				currentSessionId
			);
			const result = await handleAPIError(response);

			// Add AI response to chat
			const aiMessage = {
				role: "assistant",
				content: result.response,
				timestamp: new Date(),
				sources: result.sources || [],
			};

			setMessages((prev) => [...prev, aiMessage]);

			// Update session ID if it's a new conversation
			if (result.sessionId && !currentSessionId) {
				setCurrentSessionId(result.sessionId);
			}
		} catch (error) {
			console.error("Query error:", error);

			// Add error message
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
	};

	const clearChat = () => {
		setMessages([
			{
				role: "assistant",
				content: "Chat cleared! How can I help you with your documents?",
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

	return (
		<div
			className={`flex flex-col h-full bg-slate-900/50 rounded-lg border border-slate-700/50 ${className}`}
		>
			{/* Chat Header */}
			<div className="flex items-center justify-between p-4 border-b border-slate-700/50">
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
						<h3 className="text-white font-semibold">StudyBuddy AI</h3>
						<p className="text-slate-400 text-sm">
							Ask me about your documents
						</p>
					</div>
				</div>
				<button
					onClick={clearChat}
					className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
					title="Clear chat"
				>
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
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
			</div>

			{/* Messages Container */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
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
									? "bg-red-900/50 text-red-200"
									: "bg-slate-800 text-white"
							} rounded-lg p-3 shadow-lg`}
						>
							<div className="text-sm leading-relaxed whitespace-pre-wrap">
								{message.content}
							</div>

							{/* Sources */}
							{message.sources && message.sources.length > 0 && (
								<div className="mt-2 pt-2 border-t border-slate-600">
									<p className="text-xs text-slate-400 mb-1">Sources:</p>
									<div className="space-y-1">
										{message.sources.map((source, idx) => (
											<div key={idx} className="text-xs text-slate-300">
												📄 Page {source.page} (
												{source.score
													? `${Math.round(source.score * 100)}% match`
													: "relevant"}
												)
											</div>
										))}
									</div>
								</div>
							)}

							<div
								className={`text-xs mt-2 ${
									message.role === "user" ? "text-slate-700" : "text-slate-500"
								}`}
							>
								{formatTimestamp(message.timestamp)}
							</div>
						</div>
					</div>
				))}

				{/* Loading indicator */}
				{isLoading && (
					<div className="flex justify-start">
						<div className="bg-slate-800 text-white rounded-lg p-3 shadow-lg">
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
								<span className="text-sm text-slate-400">Thinking...</span>
							</div>
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input Form */}
			<form
				onSubmit={handleSendMessage}
				className="p-4 border-t border-slate-700/50"
			>
				<div className="flex space-x-3">
					<input
						ref={inputRef}
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder="Ask me anything about your documents..."
						className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ffd859] focus:border-transparent"
						disabled={isLoading}
					/>
					<button
						type="submit"
						disabled={!inputValue.trim() || isLoading}
						className="px-6 py-2 bg-gradient-to-r from-[#ffd859] to-[#ffed95] text-slate-900 font-medium rounded-lg hover:shadow-lg hover:shadow-[#ffd859]/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
			</form>
		</div>
	);
};

export default AIChat;
