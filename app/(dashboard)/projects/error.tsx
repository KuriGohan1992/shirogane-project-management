"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

type ProjectsErrorProps = {
	error: Error & {
		digest?: string;
	};
	reset: () => void;
};

export default function ProjectsError({ error, reset }: ProjectsErrorProps) {
	useEffect(() => {
		console.error("Projects route error:", error);
	}, [error]);

	return (
		<ErrorState
			illustrationSrc="/illustrations/500-internal-server-error-cuate.svg"
			title="Projects couldn't be loaded"
			description="An unexpected error occurred while loading your projects. Try again in a moment."
			action={
				<Button type="button" onClick={reset}>
					Try again
				</Button>
			}
		/>
	);
}
