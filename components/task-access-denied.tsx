import { ShieldX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TaskAccessDeniedProps = {
	compact?: boolean;
};

export function TaskAccessDenied({ compact = false }: TaskAccessDeniedProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center px-6 text-center",
				compact ? "min-h-80" : "min-h-[60vh]",
			)}
		>
			<div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
				<ShieldX aria-hidden="true" size={22} />
			</div>

			<h1 className="text-xl font-semibold">Access denied</h1>

			<p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
				This task exists, but you do not have permission to access its project.
			</p>

			<Button asChild className="mt-5">
				<Link href="/projects">Back to projects</Link>
			</Button>
		</div>
	);
}
