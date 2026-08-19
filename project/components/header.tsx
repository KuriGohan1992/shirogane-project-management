"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "./theme-provider";

export function Header() {
	const { theme, setTheme } = useTheme();

	return (
		<header className="border-b border-border bg-background/80 backdrop-blur-xs">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center">
						<Link href="/" className="text-2xl font-bold text-primary">
							Shiro
						</Link>
					</div>

					<nav className="hidden md:flex space-x-8">
						<Link
							href="#features"
							className="text-foreground hover:text-primary transition-colors"
						>
							Features
						</Link>
						<Link
							href="#pricing"
							className="text-foreground hover:text-primary transition-colors"
						>
							Pricing
						</Link>
						<Link
							href="#about"
							className="text-foreground hover:text-primary transition-colors"
						>
							About
						</Link>
					</nav>

					<div className="flex items-center space-x-4">
<button
	type="button"
	onClick={() => setTheme(theme === "light" ? "dark" : "light")}
	className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted transition-colors"
>
	{theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
</button>

						<Link
							href="/dashboard"
							className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-brand-hover transition-colors"
						>
							Get Started
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
