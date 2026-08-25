import Link from "next/link";

import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<ErrorState
			className="min-h-screen"
			illustrationSrc="/illustrations/404-not-found-rafiki.svg"
			title="Page not found"
			description="The page you're looking for doesn't exist or may have been moved."
			action={
				<Button asChild>
					<Link href="/dashboard">Go to dashboard</Link>
				</Button>
			}
			secondaryAction={
				<Button asChild variant="outline">
					<Link href="/">Go home</Link>
				</Button>
			}
		/>
	);
}
