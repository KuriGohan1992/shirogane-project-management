import Link from "next/link";

import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

type TaskAccessDeniedProps = {
	compact?: boolean;
};

export function TaskAccessDenied({ compact = false }: TaskAccessDeniedProps) {
	return (
		<ErrorState
			compact={compact}
			illustrationSrc="/illustrations/403-forbidden-rafiki.svg"
			title="Access denied"
			description="This task exists, but you don't have permission to access its project."
			action={
				<Button asChild>
					<Link href="/projects">Back to projects</Link>
				</Button>
			}
		/>
	);
}
