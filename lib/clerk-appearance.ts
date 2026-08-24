export const shiroAuthAppearance = {
	variables: {
		colorPrimary: "var(--primary)",
		colorBackground: "var(--card)",
		colorForeground: "var(--foreground)",
		colorMutedForeground: "var(--muted-foreground)",
		colorInput: "var(--background)",
		colorInputForeground: "var(--foreground)",
		borderRadius: "0.5rem",
		fontFamily: "var(--font-manrope)",
	},
	elements: {
		rootBox: "w-full",
		cardBox: "w-full shadow-none",
		card: "w-full border border-border bg-card shadow-xl",
		headerTitle: "text-foreground font-bold",
		headerSubtitle: "text-muted-foreground",
		socialButtonsBlockButton:
			"border-border bg-background text-foreground hover:bg-muted",
		socialButtonsBlockButtonText: "font-medium text-foreground",
		dividerLine: "bg-border",
		dividerText: "text-muted-foreground",
		formFieldLabel: "font-medium text-foreground",
		formFieldInput:
			"border-input bg-background text-foreground shadow-none focus:border-primary",
		formButtonPrimary:
			"bg-primary text-primary-foreground shadow-none hover:bg-brand-hover [&_svg]:hidden",
		footer: "border-t border-border bg-muted/30",
		footerActionText: "text-muted-foreground",
		footerActionLink: "font-semibold text-primary hover:text-primary",
	},
} as const;
