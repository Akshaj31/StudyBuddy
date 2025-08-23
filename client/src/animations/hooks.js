// Custom animation hooks for reusable animation logic
import { useInView } from "framer-motion";
import { useRef, useEffect } from "react";

// Hook for scroll-triggered animations
export const useScrollAnimation = (threshold = 0.1, triggerOnce = true) => {
	const ref = useRef(null);
	const isInView = useInView(ref, {
		threshold,
		triggerOnce,
		margin: "-100px",
	});

	return { ref, isInView };
};

// Hook for staggered animations
export const useStaggeredAnimation = (delay = 0.1) => {
	const ref = useRef(null);
	const isInView = useInView(ref, {
		threshold: 0.1,
		triggerOnce: true,
	});

	return {
		ref,
		variants: {
			initial: {},
			animate: isInView
				? {
						transition: {
							staggerChildren: delay,
							delayChildren: 0.1,
						},
				  }
				: {},
		},
	};
};

// Hook for smooth scroll to bottom
export const useSmoothScroll = () => {
	const scrollToBottom = (element, behavior = "smooth") => {
		if (element) {
			element.scrollTo({
				top: element.scrollHeight,
				behavior,
			});
		}
	};

	const scrollToElement = (element, target, offset = 0) => {
		if (element && target) {
			const targetPosition = target.offsetTop - offset;
			element.scrollTo({
				top: targetPosition,
				behavior: "smooth",
			});
		}
	};

	return { scrollToBottom, scrollToElement };
};

// Hook for reduced motion preference
export const useReducedMotion = () => {
	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)"
	).matches;

	return prefersReducedMotion;
};

// Hook for performance-optimized animations
export const useOptimizedAnimation = () => {
	useEffect(() => {
		// Add will-change property for better performance
		const addWillChange = (element) => {
			element.style.willChange = "transform, opacity";
		};

		const removeWillChange = (element) => {
			element.style.willChange = "auto";
		};

		return { addWillChange, removeWillChange };
	}, []);
};

// Hook for auto-scroll in chat
export const useChatAutoScroll = (messages, isLoading) => {
	const messagesEndRef = useRef(null);
	const shouldAutoScrollRef = useRef(true);

	const scrollToBottom = () => {
		if (shouldAutoScrollRef.current && messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({
				behavior: "smooth",
				block: "end",
			});
		}
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, isLoading]);

	const handleScroll = (e) => {
		const { scrollTop, scrollHeight, clientHeight } = e.target;
		const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
		shouldAutoScrollRef.current = isNearBottom;
	};

	return {
		messagesEndRef,
		scrollToBottom,
		handleScroll,
		shouldAutoScroll: shouldAutoScrollRef.current,
	};
};
