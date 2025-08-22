import React from "react";

const ChatInput = ({
	inputValue,
	setInputValue,
	isLoading,
	uploading,
	attachedFiles,
	handleFileSelect,
	handleRemoveFile,
	sendMessage,
	inputRef,
}) => {
	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	return (
		<div className="absolute bottom-0 left-0 right-0 z-10">
			<div className="max-w-3xl mx-auto px-4 pb-6">
				{/* Attached Files Display */}
				{attachedFiles.length > 0 && (
					<div className="mb-4 space-y-2">
						<div className="text-sm text-gray-400 mb-2 font-medium flex items-center gap-2">
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
									d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
								/>
							</svg>
							Attached files
						</div>
						{attachedFiles.map((file, index) => (
							<div
								key={index}
								className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3"
							>
								<div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
									{file.type.startsWith("image/") ? (
										<span className="text-blue-400 text-sm">🖼️</span>
									) : (
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
									)}
								</div>
								<div className="flex-1 min-w-0">
									<div className="text-white text-sm font-medium truncate">
										{file.name}
									</div>
									<div className="text-gray-400 text-xs">
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

				{/* Input Container with colored background */}
				<div className="bg-gray-800/70 border border-gray-600/60 rounded-3xl p-5 shadow-xl backdrop-blur-md ring-1 ring-gray-500/20">
					<div className="flex items-center gap-3">
						{/* File Upload Button */}
						<label className="flex-shrink-0 p-3 text-gray-500 hover:text-[#ffd859] transition-all duration-200 cursor-pointer hover:bg-gray-700/50 rounded-full hover:scale-105">
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
								accept=".pdf,image/*"
								multiple
								className="hidden"
								onChange={handleFileSelect}
								disabled={isLoading || uploading}
							/>
						</label>

						<div className="flex-1 relative">
							<input
								ref={inputRef}
								type="text"
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder={
									attachedFiles.length > 0
										? "Ask about your files..."
										: "Message StudyBuddy..."
								}
								className="w-full bg-gray-900/60 border border-gray-600/50 rounded-full px-6 py-4 pr-16 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ffd859]/70 focus:border-[#ffd859]/70 text-sm font-medium transition-all duration-200 hover:bg-gray-900/70 hover:border-gray-500/60 shadow-sm"
								disabled={isLoading || uploading}
							/>

							<button
								onClick={() => sendMessage()}
								disabled={
									(!inputValue.trim() && attachedFiles.length === 0) ||
									isLoading ||
									uploading
								}
								className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2.5 bg-gradient-to-r from-[#ffd859] to-[#ffeb82] hover:from-[#ffeb82] hover:to-[#ffd859] text-black font-bold rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
							>
								{isLoading || uploading ? (
									<div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
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
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatInput;
