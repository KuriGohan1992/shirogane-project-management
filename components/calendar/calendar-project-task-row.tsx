import { CircleCheckBig } from "lucide-react";
import Link from "next/link";
import { TaskPriorityBadge } from "@/components/task-priority-badge";
import { formatDateKey } from "@/lib/calendar-dates";
import { getTaskHref } from "@/lib/task-route";
import { cn } from "@/lib/utils";
import type {
	CalendarProjectSummary,
	CalendarProjectTask,
} from "@/types/calendar";

type CalendarProjectTaskRowProps = {
	project: CalendarProjectSummary;
	task: CalendarProjectTask;
};

export function CalendarProjectTaskRow({
	project,
	task,
}: CalendarProjectTaskRowProps) {
	return (
		<Link
			href={getTaskHref(project.id, task.id, task.title)}
			className={cn(
				"block rounded-lg border border-border bg-background px-3 py-3 transition-colors hover:bg-muted",
				task.completedAt && "bg-muted/25",
			)}
		>
			<div className="flex min-w-0 items-center gap-2">
				{task.completedAt && (
					<CircleCheckBig
						aria-hidden="true"
						className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
					/>
				)}

				<p
					className={cn(
						"min-w-0 flex-1 truncate text-sm font-semibold text-foreground",
						task.completedAt &&
							"text-muted-foreground line-through decoration-muted-foreground/60",
					)}
				>
					{task.title}
				</p>

				{task.priority && (
					<TaskPriorityBadge priority={task.priority} className="shrink-0" />
				)}
			</div>

			<div className="mt-1.5 flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
				<span className="truncate">{task.stageName}</span>

				<span aria-hidden="true" className="h-3 w-px shrink-0 bg-border" />

				<span className="shrink-0">
					{task.dueDate
						? `Due ${formatDateKey(task.dueDate, {
								includeYear: false,
							})}`
						: "No due date"}
				</span>
			</div>
		</Link>
	);
}
