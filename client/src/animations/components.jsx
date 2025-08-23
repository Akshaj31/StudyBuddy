// Reusable animated components
/* eslint-disable react/prop-types */
import React from "react";
import { motion } from "framer-motion";
import { buttonVariants, inputVariants } from "./variants.js";

// Animated page wrapper
export const AnimatedPage = ({ children, className = "" }) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{
				duration: 0.4,
				ease: [0.25, 0.46, 0.45, 0.94],
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
};

// Animated button with hover and tap effects
export const AnimatedButton = ({
	children,
	className = "",
	onClick,
	disabled = false,
	...props
}) => {
	return (
		<motion.button
			variants={buttonVariants}
			whileHover={!disabled ? "hover" : {}}
			whileTap={!disabled ? "tap" : {}}
			className={className}
			onClick={onClick}
			disabled={disabled}
			{...props}
		>
			{children}
		</motion.button>
	);
};

// Animated input with focus effects
export const AnimatedInput = ({
	className = "",
	onFocus,
	onBlur,
	...props
}) => {
	return (
		<motion.input
			variants={inputVariants}
			whileFocus="focus"
			className={className}
			onFocus={onFocus}
			onBlur={onBlur}
			{...props}
		/>
	);
};

// Animated card with hover effects
export const AnimatedCard = ({
	children,
	className = "",
	onClick,
	...props
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{
				scale: 1.02,
				y: -2,
				transition: { duration: 0.2 },
			}}
			whileTap={onClick ? { scale: 0.98 } : {}}
			className={className}
			onClick={onClick}
			style={{ cursor: onClick ? "pointer" : "default" }}
			{...props}
		>
			{children}
		</motion.div>
	);
};

// Animated loading spinner
export const AnimatedSpinner = ({ className = "", size = "medium" }) => {
	const sizeClasses = {
		small: "w-4 h-4",
		medium: "w-8 h-8",
		large: "w-12 h-12",
	};

	return (
		<motion.div
			animate={{ rotate: 360 }}
			transition={{
				duration: 1,
				repeat: Infinity,
				ease: "linear",
			}}
			className={`border-2 border-current border-t-transparent rounded-full ${sizeClasses[size]} ${className}`}
		/>
	);
};

// Staggered list container
export const StaggeredList = ({ children, className = "", delay = 0.1 }) => {
	return (
		<motion.div
			initial="initial"
			animate="animate"
			variants={{
				initial: {},
				animate: {
					transition: {
						staggerChildren: delay,
						delayChildren: 0.1,
					},
				},
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
};

// Staggered list item
export const StaggeredItem = ({ children, className = "" }) => {
	return (
		<motion.div
			variants={{
				initial: { opacity: 0, y: 20 },
				animate: {
					opacity: 1,
					y: 0,
					transition: {
						duration: 0.4,
						ease: [0.25, 0.46, 0.45, 0.94],
					},
				},
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
};

// Fade in when in view
export const FadeInWhenVisible = ({ children, className = "" }) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 50 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-100px" }}
			transition={{
				duration: 0.6,
				ease: [0.25, 0.46, 0.45, 0.94],
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
};

// Scale on hover
export const ScaleOnHover = ({ children, className = "", scale = 1.05 }) => {
	return (
		<motion.div
			whileHover={{ scale }}
			whileTap={{ scale: scale * 0.95 }}
			transition={{ duration: 0.2 }}
			className={className}
		>
			{children}
		</motion.div>
	);
};
