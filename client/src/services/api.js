// API service for StudyBuddy backend integration
const API_BASE_URL = "http://localhost:4000/api/v1";

// Helper function to get auth headers
const getAuthHeaders = () => {
	const token = localStorage.getItem("token");
	const headers = { "Content-Type": "application/json" };
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
};

// Helper function to get auth headers for file uploads
const getAuthHeadersForUpload = () => {
	const token = localStorage.getItem("token");
	const headers = {};
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers; // Let browser set multipart boundary
};

// Centralized 401 handling: redirect to /login and clear storage
const handleUnauthorized = () => {
	try {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	} catch {}
	// Avoid throwing if window not available (SSR safety)
	if (typeof window !== "undefined") {
		if (window.location.pathname !== "/login") {
			window.location.replace("/login");
		}
	}
};

// User Authentication APIs
export const authAPI = {
	verifyToken: async () => {
		const response = await fetch(`${API_BASE_URL}/user/verify-token`, {
			method: "GET",
			headers: getAuthHeaders(),
		});
		if (response.status === 401) handleUnauthorized();
		return response;
	},

	login: async (credentials) => {
		const response = await fetch(`${API_BASE_URL}/user/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(credentials),
		});
		if (response.status === 401) handleUnauthorized();
		return response;
	},

	register: async (userData) => {
		const response = await fetch(`${API_BASE_URL}/user/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userData),
		});
		if (response.status === 401) handleUnauthorized();
		return response;
	},

	googleLogin: async (tokenData) => {
		const response = await fetch(`${API_BASE_URL}/user/google-login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(tokenData),
		});
		if (response.status === 401) handleUnauthorized();
		return response;
	},

	githubLogin: async (tokenData) => {
		const response = await fetch(`${API_BASE_URL}/user/github-login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(tokenData),
		});
		if (response.status === 401) handleUnauthorized();
		return response;
	},
};

// Document Management APIs
export const documentAPI = {
	// Upload PDF files
	uploadFiles: async (files) => {
		const formData = new FormData();

		// Add each file to FormData
		for (let i = 0; i < files.length; i++) {
			formData.append("files", files[i]);
		}

		const response = await fetch(`${API_BASE_URL}/upload`, {
			method: "POST",
			headers: getAuthHeadersForUpload(),
			body: formData,
		});
		if (response.status === 401) handleUnauthorized();
		return response;
	},

	// Get user's uploaded documents
	getUserDocuments: async () => {
		const response = await fetch(`${API_BASE_URL}/user/documents`, {
			method: "GET",
			headers: getAuthHeaders(),
		});
		if (response.status === 401) handleUnauthorized();
		return response;
	},

	// Delete a user's document
	deleteDocument: async (documentId) => {
		const response = await fetch(
			`${API_BASE_URL}/user/documents/${documentId}`,
			{
				method: "DELETE",
				headers: getAuthHeaders(),
			}
		);
		if (response.status === 401) handleUnauthorized();
		return response;
	},
};

// Dashboard / aggregated user data APIs
export const dashboardAPI = {
	getDashboard: async () => {
		const response = await fetch(`${API_BASE_URL}/user/dashboard`, {
			method: "GET",
			headers: getAuthHeaders(),
		});
		if (response.status === 401) handleUnauthorized();
		return response;
	},
};

// AI Query APIs
export const queryAPI = {
	// Send a query to the AI system
	askQuestion: async (question, sessionId = null) => {
		const response = await fetch(`${API_BASE_URL}/query`, {
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify({
				query: question, // Changed from 'question' to 'query' to match backend
				sessionId,
			}),
		});
		if (response.status === 401) handleUnauthorized();
		return response;
	},

	// Get user's chat sessions
	getChatSessions: async () => {
		const response = await fetch(`${API_BASE_URL}/user/chat-sessions`, {
			method: "GET",
			headers: getAuthHeaders(),
		});
		if (response.status === 401) handleUnauthorized();
		return response;
	},

	// Get specific chat session with messages
	getChatSession: async (sessionId) => {
		const response = await fetch(
			`${API_BASE_URL}/user/chat-sessions/${sessionId}`,
			{
				method: "GET",
				headers: getAuthHeaders(),
			}
		);
		if (response.status === 401) handleUnauthorized();
		return response;
	},

	// Delete a chat session
	deleteChatSession: async (sessionId) => {
		const response = await fetch(
			`${API_BASE_URL}/user/chat-sessions/${sessionId}`,
			{
				method: "DELETE",
				headers: getAuthHeaders(),
			}
		);
		if (response.status === 401) handleUnauthorized();
		return response;
	},
};

// Error handling helper
export const handleAPIError = async (response) => {
	if (!response.ok) {
		const errorData = await response
			.json()
			.catch(() => ({ error: "Unknown error occurred" }));
		throw new Error(
			errorData.error || `HTTP ${response.status}: ${response.statusText}`
		);
	}
	return response.json();
};
