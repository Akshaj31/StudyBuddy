import React from "react";
import {
	StaggeredList,
	StaggeredItem,
	AnimatedCard,
} from "../animations/components.jsx";

/*
Props:
- stats: Array<{
    icon: React.ReactNode,
    value: string,
    suffix?: string,
    label: string,
    color: string, // tailwind text color class, used to infer gradient as well
    trend: 'up' | 'down' | 'neutral',
    trendValue?: string,
    bgGradient: string, // tailwind gradient classes
  }>
*/
const StatsGrid = ({ stats = [] }) => {
	if (!Array.isArray(stats) || stats.length === 0) return null;

	return (
		<StaggeredList
			className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
			delay={0.1}
		>
			{stats.map((stat, index) => (
				<StaggeredItem key={index}>
					<AnimatedCard
						className={`bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 group`}
					>
						<div className="flex items-start justify-between mb-2">
							<div className="flex items-center gap-2">
								<span className="text-xl group-hover:scale-110 transition-transform duration-300">
									{stat.icon}
								</span>
								<div>
									<div className="flex items-center gap-2">
										<span className={`text-lg font-bold ${stat.color}`}>
											{stat.value}
											<span className="text-gray-500 text-xs ml-1">
												{stat.suffix}
											</span>
										</span>
										{stat.trend !== "neutral" && (
											<div
												className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
													stat.trend === "up"
														? "bg-green-500/20 text-green-400"
														: "bg-red-500/20 text-red-400"
												}`}
											>
												<span>{stat.trend === "up" ? "\u2197" : "\u2198"}</span>
												<span>{stat.trendValue}</span>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
						<div className="text-gray-400 text-xs font-medium">
							{stat.label}
						</div>
						<div className="mt-2 w-full bg-white/5 rounded-full h-1 overflow-hidden">
							<div
								className={`h-full bg-gradient-to-r ${
									stat.color.includes("yellow")
										? "from-yellow-400 to-orange-400"
										: stat.color.includes("emerald")
										? "from-emerald-400 to-green-400"
										: stat.color.includes("blue")
										? "from-blue-400 to-cyan-400"
										: "from-orange-400 to-red-400"
								} transition-all duration-500`}
								style={{
									width: `${Math.min((parseInt(stat.value) || 0) * 10, 100)}%`,
								}}
							></div>
						</div>
					</AnimatedCard>
				</StaggeredItem>
			))}
		</StaggeredList>
	);
};

export default StatsGrid;
