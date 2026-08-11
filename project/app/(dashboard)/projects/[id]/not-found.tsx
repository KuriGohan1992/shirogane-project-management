import { FolderX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<div className="max-w-md text-center">
				<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
					<FolderX aria-hidden="true" size={28} />
				</div>

				<h1 className="mt-5 text-2xl font-bold text-foreground">
					Project not found
				</h1>

				<p className="mt-2 text-sm leading-6 text-muted-foreground">
					This project does not exist or you do not have access to it.
				</p>

				<Link
					href="/projects"
					className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-brand-hover"
				>
					Back to projects
				</Link>
			</div>
		</div>
	);
}
