import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

const Navbar = () => {
	const { authenticated, user } = useAuth();

	return (
		<nav className="sticky top-0 h-[60px] flex justify-center z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
			<div className="w-[85%] text-white flex justify-between items-center">
				{/* Logo */}
				<Link
					to="/"
					className="text-2xl font-bold px-4 hover:text-[#ffd859] transition-colors duration-200"
				>
					StudyBuddy
				</Link>

				{/* Navigation Links */}
				<div className="flex items-center">
					<ul className="flex">
						<li className="text-lg px-6 text-zinc-400 hover:text-white transition-colors duration-200">
							<Link to="/">Home</Link>
						</li>
						{authenticated ? (
							<>
								<li className="text-lg px-6 text-zinc-400 hover:text-white transition-colors duration-200">
									<Link to="/dashboard">Dashboard</Link>
								</li>
								<li className="text-lg px-6 text-zinc-400 hover:text-white transition-colors duration-200">
									<span>Hi, {user?.username || "User"}!</span>
								</li>
							</>
						) : (
							<>
								<li className="text-lg px-6 text-zinc-400 hover:text-white transition-colors duration-200">
									<Link to="/login">Login</Link>
								</li>
								<li className="text-lg px-6 text-zinc-400 hover:text-white transition-colors duration-200">
									<Link to="/about">About</Link>
								</li>
							</>
						)}
					</ul>

					{/* The profile/user icon circle */}
					{authenticated ? (
						<div className="w-8 h-8 ml-6 rounded-full bg-gradient-to-br from-[#ffd859] to-[#ffeb82] border border-white/20 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center">
							<span className="text-black font-bold text-sm">
								{user?.username?.charAt(0)?.toUpperCase() || "U"}
							</span>
						</div>
					) : (
						<div className="w-8 h-8 ml-6 rounded-full bg-gray-400 border border-white/20 cursor-pointer hover:scale-105 transition-transform"></div>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
