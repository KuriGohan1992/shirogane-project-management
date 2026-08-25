"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

type DashboardErrorProps = {
	error: Error & {
		digest?: string;
	};
	reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
	const pathname = usePathname();

	const isDashboard = pathname === "/dashboard";

	useEffect(() => {
		console.error("Dashboard route error:", error);
	}, [error]);

	return (
		<ErrorState
			illustrationSrc="/illustrations/500-internal-server-error-cuate.svg"
			title="Something went wrong"
			description="Shiro couldn't load this part of your workspace. Try again in a moment."
			action={
				<Button type="button" onClick={reset}>
					Try again
				</Button>
			}
			secondaryAction={
				isDashboard ? undefined : (
					<Button asChild variant="outline">
						<Link href="/dashboard">Go to dashboard</Link>
					</Button>
				)
			}
		/>
	);
}
