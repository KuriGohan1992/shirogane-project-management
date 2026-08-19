"use client";

// TODO: Add labels and overdue state later.

import { useSortable } from "@dnd-kit/react/sortable";
import {
	CalendarDays,
	CircleAlert,
	GripVertical,
	MessageSquare,
} from "lucide-react";
import { useState } from "react";

import { TaskCommentsModal } from "@/components/modals/task-comments-modal";
import { TaskActions } from "@/components/task-actions";
import { TaskAssigneePicker } from "@/components/task-assignee-picker";
import { Button } from "@/components/ui/button";
import type { ProjectPermissions } from "@/lib/auth/project-permissions";
import { BOARD_DND_TYPES, getTaskDndId } from "@/lib/board/dnd";
import type { Task } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import type { AssignmentCandidate } from "@/types/member";
import type { EditableTask, TaskWithDetails } from "@/types/task";

type TaskCardProps = {
	task: TaskWithDetails;
	index: number;
	stageId: string;
	assigneeCandidates: AssignmentCandidate[];
	permissions: ProjectPermissions;
	currentUserId: string;
	isProjectOwner: boolean;
};

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
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
		dueDate: task.dueDate?.toISOString().slice(0, 10) ?? "",
	};
}

export function TaskCard({
	task,
	index,
	stageId,
	assigneeCandidates,
	permissions,
	currentUserId,
	isProjectOwner,
}: TaskCardProps) {
	const [isCommentsOpen, setIsCommentsOpen] = useState(false);

	const assignedUsers = task.assignees.map((assignee) => assignee.user);

	const taskDragDisabled = !permissions.canManageTasks;

	const sortable = useSortable({
		id: getTaskDndId(task.id),
		index,
		group: stageId,
		type: BOARD_DND_TYPES.task,
		accept: BOARD_DND_TYPES.task,
		disabled: taskDragDisabled,
	});

	return (
		<>
			<article
				ref={sortable.ref}
				className={cn(
					"rounded-lg border border-border bg-card p-4 shadow-sm",
					sortable.isDragging && "opacity-50",
				)}
			>
				<div className="flex items-start gap-2">
					{permissions.canManageTasks && (
						<button
							ref={sortable.handleRef}
							type="button"
							disabled={taskDragDisabled}
							aria-label={`Drag ${task.title}`}
							className="mt-0.5 flex size-6 shrink-0 touch-none cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50 active:cursor-grabbing"
						>
							<GripVertical aria-hidden="true" size={15} />
						</button>
					)}

					<div className="min-w-0 flex-1">
						<div className="flex items-start justify-between gap-3">
							<h4 className="min-w-0 flex-1 text-sm font-medium leading-5 text-foreground">
								{task.title}
							</h4>

							{permissions.canManageTasks && (
								<TaskActions task={toEditableTask(task)} />
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

							{task.dueDate && (
								<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
									<CalendarDays aria-hidden="true" size={13} />
									{formatDate(task.dueDate)}
								</span>
							)}

							<TaskAssigneePicker
								taskId={task.id}
								candidates={assigneeCandidates}
								assignedUsers={assignedUsers}
								canManage={permissions.canAssignTasks}
							/>

							<Button
								type="button"
								variant="ghost"
								size="xs"
								aria-label={`${task.comments.length} comments on ${task.title}`}
								onClick={() => setIsCommentsOpen(true)}
							>
								<MessageSquare aria-hidden="true" size={13} />
								{task.comments.length}
							</Button>
						</div>
					</div>
				</div>
			</article>

			{isCommentsOpen && (
				<TaskCommentsModal
					taskId={task.id}
					taskTitle={task.title}
					comments={task.comments}
					currentUserId={currentUserId}
					canComment={permissions.canManageTasks}
					isProjectOwner={isProjectOwner}
					open={isCommentsOpen}
					onOpenChange={setIsCommentsOpen}
				/>
			)}
		</>
	);
}
