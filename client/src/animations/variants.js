// Animation variants and presets for consistent animations across the app

// Page transition variants
export const pageVariants = {
	initial: {
		opacity: 0,
		x: -20,
	},
	animate: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.4,
			ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
		},
	},
	exit: {
		opacity: 0,
		x: 20,
		transition: {
			duration: 0.3,
			ease: [0.55, 0.055, 0.675, 0.19], // easeInQuart
		},
	},
};

// Chat message variants
export const messageVariants = {
	initial: {
		opacity: 0,
		y: 20,
		scale: 0.95,
	},
	animate: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.3,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
	exit: {
		opacity: 0,
		scale: 0.95,
		transition: {
			duration: 0.2,
		},
	},
};

// User message (slide from right)
export const userMessageVariants = {
	initial: {
		opacity: 0,
		x: 30,
		scale: 0.95,
	},
	animate: {
		opacity: 1,
		x: 0,
		scale: 1,
		transition: {
			duration: 0.3,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
};

// AI message (slide from left)
export const aiMessageVariants = {
	initial: {
		opacity: 0,
		x: -20,
		scale: 0.98,
	},
	animate: {
		opacity: 1,
		x: 0,
		scale: 1,
		transition: {
			duration: 0.4,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
};

// Dashboard stats cards
export const statsCardVariants = {
	initial: {
		opacity: 0,
		y: 30,
		scale: 0.9,
	},
	animate: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.4,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
	hover: {
		scale: 1.05,
		y: -5,
		transition: {
			duration: 0.2,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
	tap: {
		scale: 0.98,
		transition: {
			duration: 0.1,
		},
	},
};

// Sidebar navigation variants
export const sidebarVariants = {
	closed: {
		x: -280,
		transition: {
			duration: 0.3,
			ease: [0.55, 0.055, 0.675, 0.19],
		},
	},
	open: {
		x: 0,
		transition: {
			duration: 0.4,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
};

// Chat history item variants
export const chatItemVariants = {
	initial: {
		opacity: 0,
		x: -20,
	},
	animate: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.3,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
	hover: {
		scale: 1.02,
		x: 5,
		transition: {
			duration: 0.2,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
	tap: {
		scale: 0.98,
		transition: {
			duration: 0.1,
		},
	},
};

// Loading spinner variants
export const spinnerVariants = {
	animate: {
		rotate: 360,
		transition: {
			duration: 1,
			repeat: Infinity,
			ease: "linear",
		},
	},
};

// Typing indicator variants
export const typingIndicatorVariants = {
	initial: {
		opacity: 0,
		scale: 0.8,
	},
	animate: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.3,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
	exit: {
		opacity: 0,
		scale: 0.8,
		transition: {
			duration: 0.2,
		},
	},
};

// File attachment variants
export const fileAttachmentVariants = {
	initial: {
		opacity: 0,
		scale: 0.8,
		y: 10,
	},
	animate: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			duration: 0.3,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
	exit: {
		opacity: 0,
		scale: 0.8,
		transition: {
			duration: 0.2,
		},
	},
	hover: {
		scale: 1.05,
		transition: {
			duration: 0.2,
		},
	},
};

// Button variants
export const buttonVariants = {
	hover: {
		scale: 1.05,
		transition: {
			duration: 0.2,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
	tap: {
		scale: 0.95,
		transition: {
			duration: 0.1,
		},
	},
};

// Input focus variants
export const inputVariants = {
	focus: {
		scale: 1.02,
		transition: {
			duration: 0.2,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
	blur: {
		scale: 1,
		transition: {
			duration: 0.2,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
};

// Stagger container variants
export const staggerContainer = {
	initial: {},
	animate: {
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.1,
		},
	},
};

// Fast stagger for lists
export const fastStagger = {
	initial: {},
	animate: {
		transition: {
			staggerChildren: 0.05,
			delayChildren: 0.05,
		},
	},
};

// Modal variants
export const modalVariants = {
	initial: {
		opacity: 0,
		scale: 0.9,
	},
	animate: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.3,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
	exit: {
		opacity: 0,
		scale: 0.9,
		transition: {
			duration: 0.2,
			ease: [0.55, 0.055, 0.675, 0.19],
		},
	},
};

// Backdrop variants
export const backdropVariants = {
	initial: {
		opacity: 0,
	},
	animate: {
		opacity: 1,
		transition: {
			duration: 0.3,
		},
	},
	exit: {
		opacity: 0,
		transition: {
			duration: 0.2,
		},
	},
};
