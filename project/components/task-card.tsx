// TODO: Add labels, overdue state, comments,
// and drag-and-drop support in later feature phases.

import { CalendarDays, CircleAlert } from "lucide-react";

import { TaskActions } from "@/components/task-actions";
import { TaskAssigneePicker } from "@/components/task-assignee-picker";
import type { Task } from "@/lib/db/schema";
import type { AssignmentCandidate } from "@/types/member";
import type { EditableTask, TaskWithAssignees } from "@/types/task";

type TaskCardProps = {
	task: TaskWithAssignees;
	assigneeCandidates: AssignmentCandidate[];
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

export function TaskCard({ task, assigneeCandidates }: TaskCardProps) {
	const assignedUsers = task.assignees.map((assignee) => assignee.user);
	return (
		<article className="rounded-lg border border-border bg-card p-4 shadow-sm">
			<div className="flex items-start justify-between gap-3">
				<h4 className="min-w-0 flex-1 text-sm font-medium leading-5 text-foreground">
					{task.title}
				</h4>

				<TaskActions task={toEditableTask(task)} />
			</div>

			{task.description && (
				<p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
					{task.description}
				</p>
			)}

			<div className="mt-4 flex flex-wrap items-center gap-2">
				<span
					className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium capitalize ${getPriorityClasses(task.priority)}`}
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
				/>
			</div>
		</article>
	);
}
