"use client";

import { History } from "lucide-react";

import { ProjectActivityList } from "@/components/project-activity-list";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import type { ActivityWithActor } from "@/types/activity";

type ProjectActivityButtonProps = {
	activities: ActivityWithActor[];
};

export function ProjectActivityButton({
	activities,
}: ProjectActivityButtonProps) {
	return (
		<>
			<Dialog>
				<DialogTrigger asChild>
					<Button
						type="button"
						variant="outline"
						size="sm"
						aria-label="View project activity"
						className="h-9 gap-2 bg-card px-2.5 sm:hidden"
					>
						<History aria-hidden="true" className="size-4" />
					</Button>
				</DialogTrigger>

				<DialogContent
					headerVariant="primary"
					className="max-h-[min(82dvh,44rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden bg-card p-0 sm:hidden"
				>
					<DialogHeader variant="primary" className="shrink-0">
						<DialogTitle>Project activity</DialogTitle>

						<DialogDescription className="sr-only">
							The latest changes across this project, newest first.
						</DialogDescription>
					</DialogHeader>

					<div className="scrollbar-thin min-h-0 overflow-y-auto bg-card px-5">
						<ProjectActivityList activities={activities} />
					</div>
				</DialogContent>
			</Dialog>

			<Sheet>
				<SheetTrigger asChild>
					<Button
						type="button"
						variant="outline"
						size="sm"
						aria-label="View project activity"
						className="hidden h-9 gap-2 bg-card px-3 sm:inline-flex"
					>
						<History aria-hidden="true" className="size-4" />
						<span>Activity</span>
					</Button>
				</SheetTrigger>

				<SheetContent className="hidden border-l-0 bg-card sm:flex sm:max-w-md [&_[data-slot=sheet-close]]:text-primary-foreground [&_[data-slot=sheet-close]]:hover:bg-primary-foreground/10 [&_[data-slot=sheet-close]]:hover:text-primary-foreground [&_[data-slot=sheet-close]]:focus-visible:ring-primary-foreground/70">
					<SheetHeader className="shrink-0 border-b-0 bg-primary px-12 py-5 text-center">
						<SheetTitle className="text-lg font-semibold text-primary-foreground">
							Project activity
						</SheetTitle>

						<SheetDescription className="sr-only">
							The latest changes across this project, newest first.
						</SheetDescription>
					</SheetHeader>

					<div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto bg-card px-6">
						<ProjectActivityList activities={activities} />
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
