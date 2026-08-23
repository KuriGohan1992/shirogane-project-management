import { CalendarRange, Clock3 } from "lucide-react";

import {
	formatActivityDate,
	formatCalendarProjectSchedule,
} from "@/lib/calendar-dates";
import { getColorHex } from "@/lib/constants/colors";
import type { CalendarProjectSummary } from "@/types/calendar";

type ProjectCalendarPreviewProps = {
	project: CalendarProjectSummary;
};

export function ProjectCalendarPreview({
	project,
}: ProjectCalendarPreviewProps) {
	const ownerName = project.owner.name ?? project.owner.email;

	const showOwner = project.accessRole !== "owner";

	return (
		<div className="relative overflow-hidden rounded-md bg-popover">
			<div
				aria-hidden="true"
				className="absolute inset-x-0 top-0 h-2"
				style={{
					backgroundColor: getColorHex(project.color),
				}}
			/>

			<div className="px-4 pb-4 pt-5">
				<div className="flex items-center gap-2">
					<span className="text-xs font-semibold capitalize text-muted-foreground">
						{project.accessRole}
					</span>

					{project.completedAt && (
						<span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
							Completed
						</span>
					)}
				</div>

				<h3 className="mt-2 line-clamp-2 text-base font-bold text-foreground">
					{project.name}
				</h3>

				<p className="mt-1.5 line-clamp-3 text-sm leading-5 text-muted-foreground">
					{project.description || "No description yet."}
				</p>

				{showOwner && (
					<p className="mt-3 truncate text-right text-xs text-muted-foreground">
						Owned by{" "}
						<span className="font-medium text-foreground/80">{ownerName}</span>
					</p>
				)}

				<div className="mt-3 space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
					<div className="flex items-center gap-2">
						<CalendarRange aria-hidden="true" className="size-3.5 shrink-0" />

						<span className="truncate">
							{formatCalendarProjectSchedule(project)}
						</span>
					</div>

					<div className="flex items-center gap-2">
						<Clock3 aria-hidden="true" className="size-3.5 shrink-0" />

						<span className="truncate">
							Last activity {formatActivityDate(project.lastActivityAt)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
