"use client";

import { History } from "lucide-react";

import { ProjectActivityList } from "@/components/project-activity-list";
import { Button } from "@/components/ui/button";
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
		<Sheet>
			<SheetTrigger asChild>
				<Button type="button" variant="outline" size="sm" className="h-9 gap-2">
					<History aria-hidden="true" className="size-4" />
					Activity
				</Button>
			</SheetTrigger>

			<SheetContent>
				<SheetHeader>
					<SheetTitle>Project activity</SheetTitle>

					<SheetDescription>
						The latest changes across this project, newest first.
					</SheetDescription>
				</SheetHeader>

				<div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
					<ProjectActivityList activities={activities} />
				</div>
			</SheetContent>
		</Sheet>
	);
}
