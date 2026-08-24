"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
	children: ReactNode;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
	undefined,
);

let transitionTimeout: ReturnType<typeof setTimeout> | undefined;

function isTheme(value: string | null): value is Theme {
	return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme() {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function applyTheme(theme: Theme, animate = false) {
	const root = document.documentElement;
	const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

	if (animate) {
		root.classList.add("theme-transition");

		if (transitionTimeout) {
			clearTimeout(transitionTimeout);
		}
	}

	root.classList.remove("light", "dark");
	root.classList.add(resolvedTheme);

	if (animate) {
		transitionTimeout = setTimeout(() => {
			root.classList.remove("theme-transition");
		}, 200);
	}
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>("light");
	const shouldAnimateRef = useRef(false);

	function setTheme(theme: Theme) {
		shouldAnimateRef.current = true;
		setThemeState(theme);
	}

	useEffect(() => {
		const savedTheme = localStorage.getItem("theme");

		if (isTheme(savedTheme)) {
			setThemeState(savedTheme);
			return;
		}

		setThemeState("system");
	}, []);

	useEffect(() => {
		applyTheme(theme, shouldAnimateRef.current);
		shouldAnimateRef.current = false;

		localStorage.setItem("theme", theme);

		if (theme !== "system") {
			return;
		}

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		function handleSystemThemeChange() {
			applyTheme("system", true);
		}

		mediaQuery.addEventListener("change", handleSystemThemeChange);

		return () => {
			mediaQuery.removeEventListener("change", handleSystemThemeChange);
		};
	}, [theme]);

	return (
		<ThemeProviderContext.Provider
			value={{
				theme,
				setTheme,
			}}
		>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeProviderContext);

	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
}
