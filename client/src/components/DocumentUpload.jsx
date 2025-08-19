import React, { useState } from "react";
import { documentAPI, handleAPIError } from "../services/api.js";

const DocumentUpload = ({ onUploadSuccess }) => {
	const [uploading, setUploading] = useState(false);
	const [dragOver, setDragOver] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(null);

	const handleFileUpload = async (files) => {
		if (!files || files.length === 0) return;

		// Validate file types (only PDF)
		const validFiles = Array.from(files).filter(
			(file) => file.type === "application/pdf"
		);

		if (validFiles.length === 0) {
			alert("Please select only PDF files.");
			return;
		}

		if (validFiles.length !== files.length) {
			alert(`${files.length - validFiles.length} non-PDF files were skipped.`);
		}

		setUploading(true);
		setUploadProgress("Uploading files...");

		try {
			const response = await documentAPI.uploadFiles(validFiles);
			const result = await handleAPIError(response);

			setUploadProgress("Processing documents...");

			// Show success message
			setUploadProgress(
				`Successfully uploaded ${result.documents.length} document(s)!`
			);

			// Call callback to refresh document list
			if (onUploadSuccess) {
				onUploadSuccess(result.documents);
			}

			// Clear progress after delay
			setTimeout(() => {
				setUploadProgress(null);
			}, 3000);
		} catch (error) {
			console.error("Upload error:", error);
			alert(`Upload failed: ${error.message}`);
			setUploadProgress(null);
		} finally {
			setUploading(false);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setDragOver(false);
		const files = e.dataTransfer.files;
		handleFileUpload(files);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		setDragOver(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		setDragOver(false);
	};

	const handleFileInput = (e) => {
		const files = e.target.files;
		handleFileUpload(files);
	};

	return (
		<div className="space-y-4">
			{/* Upload Area */}
			<div
				className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
					dragOver
						? "border-[#ffd859] bg-[#ffd859]/10"
						: "border-slate-600 hover:border-slate-500"
				} ${uploading ? "pointer-events-none opacity-50" : ""}`}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
			>
				<div className="space-y-4">
					<div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#ffd859]/20 to-[#ffd859]/10 rounded-full flex items-center justify-center">
						<svg
							className="w-8 h-8 text-[#ffd859]"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
							/>
						</svg>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-white mb-2">
							Upload PDF Documents
						</h3>
						<p className="text-slate-400 mb-4">
							Drag and drop your PDF files here, or click to browse
						</p>
						<label className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-[#ffd859] to-[#ffed95] text-slate-900 font-medium rounded-lg hover:shadow-lg hover:shadow-[#ffd859]/25 transition-all duration-200 cursor-pointer">
							<svg
								className="w-5 h-5 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
							</svg>
							Choose Files
							<input
								type="file"
								accept=".pdf"
								multiple
								className="hidden"
								onChange={handleFileInput}
								disabled={uploading}
							/>
						</label>
					</div>
				</div>

				{/* Upload Progress */}
				{uploadProgress && (
					<div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
						<div className="text-center">
							<div className="w-8 h-8 border-2 border-[#ffd859] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
							<p className="text-white font-medium">{uploadProgress}</p>
						</div>
					</div>
				)}
			</div>

			{/* Upload Instructions */}
			<div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
				<h4 className="text-sm font-medium text-slate-300 mb-2">
					Upload Tips:
				</h4>
				<ul className="text-sm text-slate-400 space-y-1">
					<li>• Only PDF files are supported</li>
					<li>• Multiple files can be uploaded at once</li>
					<li>• Documents will be processed automatically for AI chat</li>
					<li>• Text-based PDFs work best (avoid scanned images)</li>
				</ul>
			</div>
		</div>
	);
};

export default DocumentUpload;
