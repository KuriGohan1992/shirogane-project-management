import Link from "next/link";

import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

export default function TaskNotFound() {
	return (
		<ErrorState
			illustrationSrc="/illustrations/404-not-found-rafiki.svg"
			title="Task not found"
			description="This task doesn't exist, may have been deleted, or doesn't belong to the project in this link."
			action={
				<Button asChild>
					<Link href="/projects">Back to projects</Link>
				</Button>
			}
		/>
	);
}
