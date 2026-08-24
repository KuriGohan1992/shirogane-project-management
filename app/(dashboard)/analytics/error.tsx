"use client";

import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AnalyticsError({
	reset,
}: {
	error: Error & {
		digest?: string;
	};

	reset: () => void;
}) {
	return (
		<div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-6 text-center">
			<TriangleAlert aria-hidden="true" className="size-8 text-destructive" />

			<h1 className="mt-4 text-xl font-bold text-foreground">
				Analytics could not be loaded
			</h1>

			<p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
				The analytics data could not be retrieved. Try loading it again.
			</p>

			<Button type="button" size="sm" className="mt-5" onClick={reset}>
				Try again
			</Button>
		</div>
	);
}
