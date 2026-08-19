"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import {
	CalendarDays,
	CircleAlert,
	GripVertical,
	MessageSquare,
} from "lucide-react";
import Link from "next/link";

import { TaskActions } from "@/components/task-actions";
import { TaskAssigneePicker } from "@/components/task-assignee-picker";
import { Button } from "@/components/ui/button";
import type { ProjectPermissions } from "@/lib/auth/project-permissions";
import { BOARD_DND_TYPES, getTaskDndId } from "@/lib/board/dnd";
import type { Task } from "@/lib/db/schema";
import { getTaskHref } from "@/lib/task-route";
import { cn } from "@/lib/utils";
import type { AssignmentCandidate } from "@/types/member";
import type { EditableTask, TaskWithDetails } from "@/types/task";

type TaskCardProps = {
	task: TaskWithDetails;
	index: number;
	stageId: string;
	projectId: string;
	assigneeCandidates: AssignmentCandidate[];
	permissions: ProjectPermissions;
	currentUserId: string;
	isProjectOwner: boolean;
};

function formatMonthDay(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	}).format(date);
}

function formatMonthDayYear(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

function formatTaskSchedule(task: Task) {
	const currentYear = new Date().getFullYear();

	if (task.startDate && task.dueDate) {
		const startYear = task.startDate.getUTCFullYear();
		const dueYear = task.dueDate.getUTCFullYear();

		const formattedStart =
			startYear === currentYear
				? formatMonthDay(task.startDate)
				: formatMonthDayYear(task.startDate);

		const formattedDue =
			dueYear === currentYear
				? formatMonthDay(task.dueDate)
				: formatMonthDayYear(task.dueDate);

		return `${formattedStart} – ${formattedDue}`;
	}

	if (task.startDate) {
		const startDate =
			task.startDate.getUTCFullYear() === currentYear
				? formatMonthDay(task.startDate)
				: formatMonthDayYear(task.startDate);

		return `Starts ${startDate}`;
	}

	if (task.dueDate) {
		const dueDate =
			task.dueDate.getUTCFullYear() === currentYear
				? formatMonthDay(task.dueDate)
				: formatMonthDayYear(task.dueDate);

		return `Due ${dueDate}`;
	}

	return null;
}
function getPriorityClasses(priority: Task["priority"]) {
	switch (priority) {
		case "low":
			return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";

		case "medium":
			return "bg-amber-500/10 text-amber-700 dark:text-amber-400";

		case "high":
			return "bg-orange-500/10 text-orange-700 dark:text-orange-400";

		case "urgent":
			return "bg-destructive/10 text-destructive";
	}
}

function toEditableTask(task: Task): EditableTask {
	return {
		id: task.id,
		title: task.title,
		description: task.description ?? "",
		priority: task.priority,
		startDate: task.startDate?.toISOString().slice(0, 10) ?? "",
		dueDate: task.dueDate?.toISOString().slice(0, 10) ?? "",
	};
}

export function TaskCard({
	task,
	index,
	stageId,
	projectId,
	assigneeCandidates,
	permissions,
}: TaskCardProps) {
	const assignedUsers = task.assignees.map((assignee) => assignee.user);

	const taskDragDisabled = !permissions.canManageTasks;

	const taskHref = getTaskHref(projectId, task.id, task.title);

	const schedule = formatTaskSchedule(task);

	const sortable = useSortable({
		id: getTaskDndId(task.id),
		index,
		group: stageId,
		type: BOARD_DND_TYPES.task,
		accept: BOARD_DND_TYPES.task,
		disabled: taskDragDisabled,
	});

	return (
		<article
			ref={sortable.ref}
			className={cn(
				"relative rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
				sortable.isDragging && "opacity-50",
			)}
		>
			<Link
				href={taskHref}
				aria-label={`Open ${task.title}`}
				className="absolute inset-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			/>

			<div className="pointer-events-none relative z-10 flex items-start gap-2">
				{permissions.canManageTasks && (
					<button
						ref={sortable.handleRef}
						type="button"
						disabled={taskDragDisabled}
						aria-label={`Drag ${task.title}`}
						className="pointer-events-auto mt-0.5 flex size-6 shrink-0 touch-none cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50 active:cursor-grabbing"
					>
						<GripVertical aria-hidden="true" size={15} />
					</button>
				)}

				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0 flex-1">
							<h4 className="text-sm font-medium leading-5 text-foreground">
								{task.title}
							</h4>
						</div>

						{permissions.canManageTasks && (
							<div className="pointer-events-auto">
								<TaskActions task={toEditableTask(task)} />
							</div>
						)}
					</div>

					{task.description && (
						<p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
							{task.description}
						</p>
					)}

					<div className="mt-4 flex flex-wrap items-center gap-2">
						<span
							className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium capitalize ${getPriorityClasses(
								task.priority,
							)}`}
						>
							<CircleAlert aria-hidden="true" size={12} />
							{task.priority}
						</span>

						{schedule && (
							<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
								<CalendarDays aria-hidden="true" size={13} />
								{schedule}
							</span>
						)}

						<div className="pointer-events-auto">
							<TaskAssigneePicker
								taskId={task.id}
								candidates={assigneeCandidates}
								assignedUsers={assignedUsers}
								canManage={permissions.canAssignTasks}
							/>
						</div>

						<div className="pointer-events-auto">
							<Button asChild variant="ghost" size="xs">
								<Link
									href={taskHref}
									aria-label={`${task.comments.length} comments on ${task.title}`}
								>
									<MessageSquare aria-hidden="true" size={13} />
									{task.comments.length}
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</article>
	);
}