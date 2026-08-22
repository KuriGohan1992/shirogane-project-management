import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import type React from "react";

import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const manrope = Manrope({
	subsets: ["latin"],
	variable: "--font-manrope",
	display: "swap",
});

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
			<body className={`${manrope.variable} font-sans antialiased`}>
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
