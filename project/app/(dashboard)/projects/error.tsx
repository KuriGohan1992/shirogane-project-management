"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

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
		<div className="flex min-h-[60vh] items-center justify-center">
			<div className="max-w-md text-center">
				<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
					<AlertTriangle aria-hidden="true" size={28} />
				</div>

				<h1 className="mt-5 text-2xl font-bold text-foreground">
					Projects couldn't be loaded
				</h1>

				<p className="mt-2 text-sm leading-6 text-muted-foreground">
					An unexpected error occurred while loading this part of Shiro.
				</p>

				<Button type="button" className="mt-6" onClick={reset}>
					Try again
				</Button>
			</div>
		</div>
	);
}
