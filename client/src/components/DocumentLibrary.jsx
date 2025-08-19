import React, { useState, useEffect } from "react";
import { documentAPI, handleAPIError } from "../services/api.js";

const DocumentLibrary = ({ onDocumentsChange }) => {
	const [documents, setDocuments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [deleting, setDeleting] = useState(null);

	// Fetch user documents on component mount
	useEffect(() => {
		fetchDocuments();
	}, []);

	const fetchDocuments = async () => {
		try {
			setLoading(true);
			const response = await documentAPI.getUserDocuments();
			const result = await handleAPIError(response);
			setDocuments(result.documents || []);

			// Notify parent component
			if (onDocumentsChange) {
				onDocumentsChange(result.documents || []);
			}
		} catch (error) {
			console.error("Error fetching documents:", error);
			setDocuments([]);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteDocument = async (documentId) => {
		if (
			!confirm(
				"Are you sure you want to delete this document? This action cannot be undone."
			)
		) {
			return;
		}

		try {
			setDeleting(documentId);
			await documentAPI.deleteDocument(documentId);

			// Remove from local state
			const updatedDocuments = documents.filter(
				(doc) => doc.documentId !== documentId
			);
			setDocuments(updatedDocuments);

			// Notify parent component
			if (onDocumentsChange) {
				onDocumentsChange(updatedDocuments);
			}
		} catch (error) {
			console.error("Error deleting document:", error);
			alert(`Failed to delete document: ${error.message}`);
		} finally {
			setDeleting(null);
		}
	};

	const formatFileSize = (bytes) => {
		if (!bytes) return "Unknown size";
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (loading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="bg-slate-800/50 rounded-lg p-4 animate-pulse">
						<div className="flex items-center space-x-4">
							<div className="w-10 h-10 bg-slate-700 rounded"></div>
							<div className="flex-1 space-y-2">
								<div className="h-4 bg-slate-700 rounded w-3/4"></div>
								<div className="h-3 bg-slate-700 rounded w-1/2"></div>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (documents.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
					<svg
						className="w-8 h-8 text-slate-500"
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
				<h3 className="text-lg font-semibold text-white mb-2">
					No Documents Yet
				</h3>
				<p className="text-slate-400">
					Upload your first PDF to get started with AI-powered studying!
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold text-white">
					Your Documents ({documents.length})
				</h3>
				<button
					onClick={fetchDocuments}
					className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
					title="Refresh documents"
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
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					</svg>
				</button>
			</div>

			{documents.map((document) => (
				<div
					key={document.documentId}
					className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4 flex-1 min-w-0">
							{/* File Icon */}
							<div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg
									className="w-5 h-5 text-red-400"
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

							{/* Document Info */}
							<div className="flex-1 min-w-0">
								<h4 className="text-white font-medium truncate">
									{document.originalName || document.filename}
								</h4>
								<div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
									<span>{document.pageCount} pages</span>
									<span>•</span>
									<span>Uploaded {formatDate(document.uploadedAt)}</span>
									<span>•</span>
									<span
										className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
											document.status === "completed"
												? "bg-green-900/50 text-green-300"
												: document.status === "processing"
												? "bg-yellow-900/50 text-yellow-300"
												: "bg-red-900/50 text-red-300"
										}`}
									>
										{document.status}
									</span>
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center space-x-2 flex-shrink-0">
							<button
								onClick={() => handleDeleteDocument(document.documentId)}
								disabled={deleting === document.documentId}
								className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								title="Delete document"
							>
								{deleting === document.documentId ? (
									<div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
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
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/>
									</svg>
								)}
							</button>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default DocumentLibrary;
