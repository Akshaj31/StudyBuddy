import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Environment, RoundedBox } from "@react-three/drei";

function GlowMaterial({ color = "#4f8bff" }) {
	// Lightweight custom material glow using emissive
	const mat = useMemo(
		() => ({
			color,
			emissive: color,
			emissiveIntensity: 0.45,
			roughness: 0.55,
			metalness: 0.08,
		}),
		[color]
	);
	return (
		<meshStandardMaterial
			color={mat.color}
			emissive={mat.emissive}
			emissiveIntensity={mat.emissiveIntensity}
			roughness={mat.roughness}
			metalness={mat.metalness}
		/>
	);
}

function ChatBubble() {
	return (
		<group rotation={[0.05, 0.5, 0]}>
			{/* Bubble body */}
			<RoundedBox args={[2.4, 1.5, 0.22]} radius={0.22} smoothness={6}>
				<meshStandardMaterial
					color="#1d2a44"
					roughness={0.6}
					metalness={0.08}
				/>
			</RoundedBox>
			{/* Tail */}
			<mesh position={[0.95, -0.85, 0]} rotation={[0, 0, -0.8]}>
				<coneGeometry args={[0.18, 0.42, 8]} />
				<meshStandardMaterial
					color="#1d2a44"
					roughness={0.6}
					metalness={0.08}
				/>
			</mesh>
			{/* Typing dots */}
			<mesh position={[-0.5, -0.05, 0.12]}>
				<sphereGeometry args={[0.09, 24, 24]} />
				<meshStandardMaterial
					color="#ffd859"
					emissive="#ffd859"
					emissiveIntensity={0.3}
					roughness={0.4}
				/>
			</mesh>
			<mesh position={[0, -0.05, 0.12]}>
				<sphereGeometry args={[0.09, 24, 24]} />
				<meshStandardMaterial
					color="#ffd859"
					emissive="#ffd859"
					emissiveIntensity={0.3}
					roughness={0.4}
				/>
			</mesh>
			<mesh position={[0.5, -0.05, 0.12]}>
				<sphereGeometry args={[0.09, 24, 24]} />
				<meshStandardMaterial
					color="#ffd859"
					emissive="#ffd859"
					emissiveIntensity={0.3}
					roughness={0.4}
				/>
			</mesh>
		</group>
	);
}

export default function Hero3D() {
	return (
		<div
			className="absolute right-0 top-1/2 -translate-y-1/2 w-[42vw] max-w-[640px] h-[44vh] md:h-[52vh] pointer-events-none opacity-[0.26] md:opacity-[0.32]"
			style={{ filter: "blur(0.2px)" }}
		>
			<Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4.2], fov: 50 }}>
				<ambientLight intensity={0.35} />
				<directionalLight position={[3, 4, 5]} intensity={0.8} />
				<Suspense fallback={null}>
					<Float speed={0.8} rotationIntensity={0.25} floatIntensity={0.35}>
						<ChatBubble />
					</Float>
					<Environment preset="city" intensity={0.2} />
				</Suspense>
			</Canvas>
		</div>
	);
}
