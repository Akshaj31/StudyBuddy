import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import gsap from "gsap";

const Hero = () => {
	const navigate = useNavigate();
	const { authenticated, loading } = useAuth();
	const heroRef = useRef(null);
	const featuresRef = useRef(null);

	// Handle Get Started button click
	const handleGetStarted = () => {
		if (authenticated) {
			// User is already logged in, go directly to dashboard
			navigate("/dashboard");
		} else {
			// User needs to login
			navigate("/login");
		}
	};

	useEffect(() => {
		const ctx = gsap.context(() => {
			gsap.from(".hero-heading", {
				y: 80,
				opacity: 0,
				duration: 1.4,
				ease: "power4.out",
			});

			gsap.from(".hero-subtext", {
				y: 50,
				opacity: 0,
				delay: 0.3,
				duration: 1.2,
				ease: "power4.out",
			});

			gsap.from(".hero-buttons button", {
				y: 40,
				opacity: 0,
				stagger: 0.2,
				delay: 0.6,
				duration: 1,
				ease: "power4.out",
			});
		}, heroRef);

		return () => ctx.revert();
	}, []);

	const scrollToFeatures = () => {
		featuresRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<>
			<div
				ref={heroRef}
				style={{ minHeight: "calc(100vh - 60px)" }}
				className="relative flex justify-center items-center px-6 md:px-12"
			>
				{authenticated && (
					<div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-green-500/20 border border-green-500/40 rounded-xl p-4 z-10">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
							<span className="text-green-300 font-medium">
								Welcome back! You're already signed in ✨
							</span>
						</div>
					</div>
				)}
				<div className="flex flex-col md:w-[60%] gap-10 text-center md:text-left">
					<h1 className="hero-heading text-5xl md:text-7xl font-extrabold tracking-tight leading-snug text-white">
						<span className="text-[#4f8bff]">Ace Every Subject</span> with Your
						AI-Powered <span className="text-[#ffd859]">Study Partner</span>
					</h1>
					<p className="hero-subtext text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto md:mx-0">
						Smarter notes. Faster revision. Real-time doubt-solving. Learn
						effortlessly, anytime.
					</p>
					<div className="hero-buttons flex justify-center md:justify-start gap-5 mt-8">
						<button
							className="text-black bg-[#ffd859] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-yellow-400 transition-colors shadow-lg hover:shadow-yellow-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={handleGetStarted}
							disabled={loading}
						>
							{loading
								? "⏳ Checking..."
								: authenticated
								? "🚀 Go to Dashboard"
								: "🚀 Try Now for Free"}
						</button>
						<button
							className="text-white border border-gray-500 px-8 py-4 rounded-xl text-lg font-medium hover:bg-white/10 transition-colors cursor-pointer"
							onClick={scrollToFeatures}
						>
							Learn More
						</button>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<section
				ref={featuresRef}
				className="features flex justify-center px-6 md:px-12 py-20 bg-black/20"
			>
				<div className="grid md:grid-cols-3 gap-12 max-w-6xl text-center">
					{[
						{
							title: "📚 Smarter Notes",
							color: "text-[#ffd859]",
							desc: "AI-generated summaries tailored to your learning style, helping you focus on key concepts and save study time.",
						},
						{
							title: "⚡ Instant Doubt Solving",
							color: "text-[#4f8bff]",
							desc: "Get instant, clear answers to your questions anytime, so you never get stuck during your study sessions.",
						},
						{
							title: "🧠 AI-Powered Revision",
							color: "text-[#ff8b8b]",
							desc: "Engage with smart flashcards and personalized quizzes that adapt to your progress and reinforce your knowledge.",
						},
					].map(({ title, color, desc }, i) => (
						<div
							key={i}
							className="feature-item bg-white/10 border border-gray-700 p-8 rounded-2xl shadow-lg hover:shadow-yellow-400/60 transition-shadow cursor-pointer"
						>
							<h3 className={`text-2xl font-bold mb-4 ${color}`}>{title}</h3>
							<p className="text-gray-300 text-base leading-relaxed">{desc}</p>
						</div>
					))}
				</div>
			</section>
		</>
	);
};

export default Hero;
