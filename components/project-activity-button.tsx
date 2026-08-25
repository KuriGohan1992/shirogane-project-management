"use client";

import { History } from "lucide-react";
import { useCallback, useRef, useState, useTransition } from "react";

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
import { loadProjectActivityAction } from "@/lib/actions/project-panel-data";
import type { ActivityWithActor } from "@/types/activity";

type ProjectActivityButtonProps = {
	projectId: string;
};

export function ProjectActivityButton({
	projectId,
}: ProjectActivityButtonProps) {
	const [activities, setActivities] = useState<ActivityWithActor[] | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const loadingRef = useRef(false);

	const ensureActivities = useCallback(() => {
		if (activities !== null || loadingRef.current) {
			return;
		}

		loadingRef.current = true;

		startTransition(async () => {
			try {
				const nextActivities = await loadProjectActivityAction(projectId);

				setActivities(nextActivities);
				setError(null);
			} catch (loadError) {
				console.error("Failed to load project activity:", loadError);
				setError("Project activity could not be loaded.");
			} finally {
				loadingRef.current = false;
			}
		});
	}, [activities, projectId]);

	const activityContent = error ? (
		<div className="px-6 py-10 text-center text-sm text-destructive">
			{error}
		</div>
	) : activities === null || isPending ? (
		<div className="px-6 py-10 text-center text-sm text-muted-foreground">
			Loading activity...
		</div>
	) : (
		<ProjectActivityList activities={activities} />
	);

	return (
		<>
			<Dialog
				onOpenChange={(open) => {
					if (open) {
						ensureActivities();
					}
				}}
			>
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
						{activityContent}
					</div>
				</DialogContent>
			</Dialog>

			<Sheet
				onOpenChange={(open) => {
					if (open) {
						ensureActivities();
					}
				}}
			>
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
						{activityContent}
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
