"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

type AnalyticsErrorProps = {
	error: Error & {
		digest?: string;
	};
	reset: () => void;
};

export default function AnalyticsError({ error, reset }: AnalyticsErrorProps) {
	useEffect(() => {
		console.error("Analytics route error:", error);
	}, [error]);

	return (
		<ErrorState
			illustrationSrc="/illustrations/500-internal-server-error-cuate.svg"
			title="Analytics could not be loaded"
			description="Shiro couldn't retrieve your analytics data. Try loading it again."
			action={
				<Button type="button" onClick={reset}>
					Try again
				</Button>
			}
		/>
	);
}
