import Link from "next/link";

import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

export default function ProjectNotFound() {
	return (
		<ErrorState
			illustrationSrc="/illustrations/404-not-found-rafiki.svg"
			title="Project not found"
			description="This project doesn't exist, may have been deleted, or isn't available to your account."
			action={
				<Button asChild>
					<Link href="/projects">Back to projects</Link>
				</Button>
			}
		/>
	);
}
