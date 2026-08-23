import { Flag, Play } from "lucide-react";
import { useState } from "react";

import { ProjectCalendarPreview } from "@/components/calendar/project-calendar-preview";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/components/ui/popover";
import { getColorHex } from "@/lib/constants/colors";
import { cn } from "@/lib/utils";
import type { CalendarProjectSummary } from "@/types/calendar";

type ProjectTimelineBarProps = {
	project: CalendarProjectSummary;
	continuesBefore: boolean;
	continuesAfter: boolean;
	pointKind: "start" | "due" | null;
	onSelect: (projectId: string) => void;
};

function getTextColor(color: CalendarProjectSummary["color"]) {
	switch (color) {
		case "cyan":
		case "orange":
		case "emerald":
		case "yellow":
			return "#0f172a";

		case "blue":
		case "violet":
		case "rose":
		case "slate":
			return "#ffffff";

		default:
			return "#ffffff";
	}
}

export function ProjectTimelineBar({
	project,
	continuesBefore,
	continuesAfter,
	pointKind,
	onSelect,
}: ProjectTimelineBarProps) {
	const [previewOpen, setPreviewOpen] = useState(false);

	const PointIcon = pointKind === "start" ? Play : Flag;

	return (
		<Popover open={previewOpen}>
			<PopoverAnchor asChild>
				<button
					type="button"
					onMouseEnter={() => setPreviewOpen(true)}
					onMouseLeave={() => setPreviewOpen(false)}
					onFocus={() => setPreviewOpen(true)}
					onBlur={() => setPreviewOpen(false)}
					onClick={() => {
						setPreviewOpen(false);
						onSelect(project.id);
					}}
					className={cn(
						"flex h-7 w-full min-w-0 items-center gap-1.5 px-2 text-left text-xs font-semibold shadow-sm transition-[filter,transform] hover:brightness-105 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
						continuesBefore ? "rounded-l-none" : "rounded-l-md",
						continuesAfter ? "rounded-r-none" : "rounded-r-md",
						project.completedAt && "opacity-70",
					)}
					style={{
						backgroundColor: getColorHex(project.color),
						color: getTextColor(project.color),
					}}
				>
					{pointKind && (
						<PointIcon aria-hidden="true" className="size-3 shrink-0" />
					)}

					<span className="truncate">{project.name}</span>
				</button>
			</PopoverAnchor>

			<PopoverContent
				side="top"
				align="start"
				sideOffset={8}
				className="pointer-events-none w-80 overflow-hidden p-0"
				onOpenAutoFocus={(event) => event.preventDefault()}
				onCloseAutoFocus={(event) => event.preventDefault()}
			>
				<ProjectCalendarPreview project={project} />
			</PopoverContent>
		</Popover>
	);
}
