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
			className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
			aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
			title={isLight ? "Switch to dark mode" : "Switch to light mode"}
		>
			{isLight ? (
				<Moon aria-hidden="true" size={18} />
			) : (
				<Sun aria-hidden="true" size={18} />
			)}
		</button>
	);
}
