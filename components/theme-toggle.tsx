"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	const isLight = theme === "light";

	return (
		<button
			type="button"
			onClick={() => setTheme(isLight ? "dark" : "light")}
			className="group inline-flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
		>
			{isLight ? (
				<Moon
					aria-hidden="true"
					size={18}
					className="transition-transform duration-150 group-hover:scale-110"
				/>
			) : (
				<Sun
					aria-hidden="true"
					size={18}
					className="transition-transform duration-150 group-hover:scale-110"
				/>
			)}
		</button>
	);
}
