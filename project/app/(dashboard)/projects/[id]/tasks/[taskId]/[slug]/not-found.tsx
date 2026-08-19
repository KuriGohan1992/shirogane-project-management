import { FileQuestion } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function TaskNotFound() {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
			<div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
				<FileQuestion aria-hidden="true" size={22} />
			</div>

			<h1 className="text-xl font-semibold">Task not found</h1>

			<p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
				This task does not exist, was deleted, or does not belong to the project
				in this link.
			</p>

			<Button asChild className="mt-5">
				<Link href="/projects">Back to projects</Link>
			</Button>
		</div>
	);
}
