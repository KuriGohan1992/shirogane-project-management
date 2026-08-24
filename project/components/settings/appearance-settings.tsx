"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
	{
		value: "light",
		label: "Light",
		icon: Sun,
	},
	{
		value: "dark",
		label: "Dark",
		icon: Moon,
	},
	{
		value: "system",
		label: "System",
		icon: Monitor,
	},
] as const;

export function AppearanceSettings() {
	const { theme, setTheme } = useTheme();

	return (
		<div className="grid h-full grid-cols-3 gap-3">
			{THEME_OPTIONS.map((option) => {
				const Icon = option.icon;
				const selected = theme === option.value;

				return (
					<button
						key={option.value}
						type="button"
						disabled={selected}
						aria-pressed={selected}
						onClick={() => setTheme(option.value)}
						className={cn(
							"flex h-14 items-center gap-3 rounded-lg border px-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-100",
selected
	? "cursor-default border-2 border-foreground/30 bg-muted/50"
	: "border border-border hover:border-foreground/25 hover:bg-muted/40"
						)}
					>
<Icon
	aria-hidden="true"
	className="size-4 shrink-0 text-muted-foreground"
/>

						<span className="min-w-0 flex-1 text-sm font-medium text-foreground">
							{option.label}
						</span>


					</button>
				);
			})}
		</div>
	);
}