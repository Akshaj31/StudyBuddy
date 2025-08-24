import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import gsap from "gsap";

const Hero = () => {
	const navigate = useNavigate();
	const { authenticated, loading } = useAuth();
	const heroRef = useRef(null);
	const featuresRef = useRef(null);
	// (3D illustration removed)

	// Social proof state
	const quotes = [
		{
			text: "Helped me compress a 30-page chapter into 2 pages of gold.",
			author: "Anaya, Grade 11",
		},
		{
			text: "Doubt-solving is instant. I stopped hopping between videos.",
			author: "Rohit, B.Tech",
		},
		{
			text: "Quizzes adapt to me—revision finally sticks.",
			author: "Meera, CAT Aspirant",
		},
	];
	const [quoteIndex, setQuoteIndex] = useState(0);

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

			// Initial subtle reveal for social proof if present
			gsap.from(".social-proof", {
				opacity: 0,
				y: 12,
				delay: 1.0,
				duration: 0.8,
				ease: "power2.out",
			});
		}, heroRef);

		return () => ctx.revert();
	}, []);

	// (3D illustration removed)

	// Rotate quotes every 4.5s with a soft fade
	useEffect(() => {
		const el = heroRef.current;
		if (!el) return;
		const interval = setInterval(() => {
			const q = el.querySelector(".social-proof");
			if (q) {
				gsap.to(q, { opacity: 0, duration: 0.35, ease: "power2.out" });
			}
			setTimeout(() => {
				setQuoteIndex((i) => (i + 1) % quotes.length);
				const q2 = el.querySelector(".social-proof");
				if (q2) {
					gsap.fromTo(q2, { opacity: 0 }, { opacity: 1, duration: 0.5 });
				}
			}, 360);
		}, 4500);
		return () => clearInterval(interval);
	}, []);

	// Mouse-follow spotlight (desktop only)
	useEffect(() => {
		const root = heroRef.current;
		if (!root) return;
		const isDesktop =
			window.matchMedia("(min-width: 1024px)").matches &&
			window.matchMedia("(pointer:fine)").matches;
		if (!isDesktop) {
			root.style.setProperty("--spot-opa", "0");
			return;
		}
		let raf = 0;
		let mx = 0,
			my = 0;
		const onMove = (e) => {
			const rect = root.getBoundingClientRect();
			mx = ((e.clientX - rect.left) / rect.width) * 100;
			my = ((e.clientY - rect.top) / rect.height) * 100;
			if (!raf) {
				raf = requestAnimationFrame(() => {
					root.style.setProperty("--mx", mx + "%");
					root.style.setProperty("--my", my + "%");
					raf = 0;
				});
			}
		};
		const onEnter = () => root.style.setProperty("--spot-opa", "1");
		const onLeave = () => root.style.setProperty("--spot-opa", "0");
		root.addEventListener("mousemove", onMove);
		root.addEventListener("mouseenter", onEnter);
		root.addEventListener("mouseleave", onLeave);
		return () => {
			root.removeEventListener("mousemove", onMove);
			root.removeEventListener("mouseenter", onEnter);
			root.removeEventListener("mouseleave", onLeave);
			if (raf) cancelAnimationFrame(raf);
		};
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
				{/* Mouse spotlight overlay (desktop-only, non-interactive) */}
				<div className="mouse-spotlight" aria-hidden="true" />
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
				<div className="relative z-10 w-full max-w-screen-xl mx-auto">
					<div className="flex flex-col w-full max-w-[56rem] gap-7 text-center md:text-left mx-auto">
						<h1
							className="hero-heading text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white max-w-none mx-auto md:mx-0"
							style={{ textWrap: "balance" }}
						>
							<span className="block">
								<span className="gradient-sweep">Ace Every Subject</span> with
								Your
							</span>
							<span className="block">
								AI-Powered <span className="text-[#ffd859]">Study Partner</span>
							</span>
						</h1>
						<p className="hero-subtext text-lg md:text-xl text-gray-300 max-w-[42rem] mx-auto md:mx-0">
							Smarter notes. Faster revision. Real-time doubt-solving. Learn
							effortlessly, anytime.
						</p>

						{/* Trust badges */}
						<div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 text-sm text-gray-300/90">
							<span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
								🔒 Privacy-first
							</span>
							<span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
								⚡ Powered by Gemini
							</span>
							<span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
								🧠 Pinecone RAG
							</span>
							<span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
								🔥 Firebase Auth
							</span>
						</div>
						<div className="hero-buttons flex justify-center md:justify-start gap-5 mt-6 md:mt-5">
							<button
								className="text-black bg-[#ffd859] px-8 py-4 rounded-xl text-base font-semibold hover:bg-yellow-400 transition-colors shadow-lg hover:shadow-yellow-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
								className="text-white border border-gray-500 px-8 py-4 rounded-xl text-base font-medium hover:bg-white/10 transition-colors cursor-pointer"
								onClick={scrollToFeatures}
							>
								Learn More
							</button>
						</div>

						{/* Social proof */}
						<div className="mt-4 text-gray-300/90 text-sm text-center md:text-left">
							<div className="social-proof inline-block bg-white/5 border border-white/10 rounded-xl px-4 py-3 shadow-sm">
								<span className="opacity-90">“{quotes[quoteIndex].text}”</span>
								<span className="ml-2 text-gray-400">
									— {quotes[quoteIndex].author}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* 3D illustration removed */}
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
