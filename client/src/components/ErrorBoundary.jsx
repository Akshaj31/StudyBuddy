import React from "react";

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(_error) {
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		this.setState({
			error: error,
			errorInfo: errorInfo,
		});
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
					<div className="max-w-md mx-auto text-center p-8">
						<div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
							<div className="text-red-400 text-6xl mb-4">⚠️</div>
							<h2 className="text-white text-xl font-bold mb-4">
								Something went wrong
							</h2>
							<p className="text-gray-400 mb-6">
								An error occurred in the chat component. Please try refreshing
								the page.
							</p>
							<div className="space-y-3">
								<button
									onClick={() => window.location.reload()}
									className="w-full bg-gradient-to-r from-[#ffd859] to-[#ffeb82] hover:from-[#ffeb82] hover:to-[#ffd859] px-6 py-3 rounded-xl text-black font-bold transition-all duration-300"
								>
									Refresh Page
								</button>
								<button
									onClick={() => (window.location.href = "/dashboard")}
									className="w-full bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300"
								>
									Back to Dashboard
								</button>
							</div>
							{import.meta.env.DEV && this.state.error && (
								<details className="mt-6 text-left">
									<summary className="text-red-400 cursor-pointer mb-2">
										Error Details (Dev)
									</summary>
									<pre className="text-xs text-gray-500 bg-slate-800 p-3 rounded overflow-auto">
										{this.state.error && this.state.error.toString()}
										<br />
										{this.state.errorInfo.componentStack}
									</pre>
								</details>
							)}
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
