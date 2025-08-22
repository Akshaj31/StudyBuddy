import { useState } from "react";
import { documentAPI, handleAPIError } from "../services/api.js";

export const useFileUpload = () => {
	const [attachedFiles, setAttachedFiles] = useState([]);
	const [uploading, setUploading] = useState(false);

	const handleFileSelect = (e) => {
		const files = Array.from(e.target.files);
		const validFiles = files.filter(
			(file) =>
				file.type === "application/pdf" || file.type.startsWith("image/")
		);

		if (validFiles.length !== files.length) {
			alert(
				"Only PDF files and images are supported. Other files were skipped."
			);
		}

		setAttachedFiles((prev) => [...prev, ...validFiles]);
		e.target.value = "";
	};

	const handleRemoveFile = (index) => {
		setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const uploadFiles = async () => {
		if (attachedFiles.length === 0) return null;

		setUploading(true);
		try {
			const response = await documentAPI.uploadFiles(attachedFiles);
			const result = await handleAPIError(response);
			setAttachedFiles([]);
			return result.documents;
		} catch (error) {
			console.error("File upload error:", error);
			alert(`File upload failed: ${error.message}`);
			throw error;
		} finally {
			setUploading(false);
		}
	};

	return {
		attachedFiles,
		uploading,
		handleFileSelect,
		handleRemoveFile,
		uploadFiles,
	};
};
