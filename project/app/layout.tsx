import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: {
		default: "Shiro",
		template: "%s | Shiro",
	},
	description: "A modern project management platform.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<ClerkProvider>
					<ThemeProvider>
						{children}
						<Analytics />
					</ThemeProvider>
				</ClerkProvider>
			</body>
		</html>
	);
}
