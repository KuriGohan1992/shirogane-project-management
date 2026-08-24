import { PointerActivationConstraints, PointerSensor } from "@dnd-kit/dom";
import { useSortable } from "@dnd-kit/react/sortable";
import { Check, MessageSquare } from "lucide-react";
import Link from "next/link";
import { TaskActions } from "@/components/task-actions";
import { TaskAssigneePicker } from "@/components/task-assignee-picker";
import { TaskLabelBadge } from "@/components/task-label-badge";
import { TaskPriorityBadge } from "@/components/task-priority-badge";
import type { ProjectPermissions } from "@/lib/auth/project-permissions";
import { BOARD_DND_TYPES, getTaskDndId } from "@/lib/board/dnd";
import type { ProjectLabel, Task } from "@/lib/db/schema";
import { getTaskHref } from "@/lib/task-route";
import { cn } from "@/lib/utils";
import type { AssignmentCandidate } from "@/types/member";
import type { EditableTask, TaskWithBoardDetails } from "@/types/task";
import { TaskCompletionToggle } from "./task-completion-toggle";

type TaskCardProps = {
	task: TaskWithBoardDetails;
	index: number;
	stageId: string;
	projectId: string;
	labelCandidates: ProjectLabel[];
	assigneeCandidates: AssignmentCandidate[];
	permissions: ProjectPermissions;
	currentUserId: string;
	isProjectOwner: boolean;
	dragDisabled?: boolean;
	selectionMode?: boolean;
	selected?: boolean;
	onToggleSelection?: (taskId: string) => void;
	keyboardFocused?: boolean;
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
	labelCandidates,
	assigneeCandidates,
	permissions,
	dragDisabled = false,
	selectionMode = false,
	selected = false,
	onToggleSelection,
	keyboardFocused = false,
}: TaskCardProps) {
	const assignedUsers = task.assignees.map((assignee) => assignee.user);

	const assignedLabels = task.labels
		.map((taskLabel) => taskLabel.label)
		.toSorted((left, right) => left.name.localeCompare(right.name));

	const visibleLabels = assignedLabels.slice(0, 2);

	const commentCount = task.comments.length;

	const taskDragDisabled =
		!permissions.canManageTasks || dragDisabled || selectionMode;

	const taskHref = getTaskHref(projectId, task.id, task.title);

	const schedule = formatTaskSchedule(task);

	const showFooter =
		permissions.canAssignTasks || assignedUsers.length > 0 || commentCount > 0;

	const sortable = useSortable({
		id: getTaskDndId(task.id),
		index,
		group: stageId,
		type: BOARD_DND_TYPES.task,
		accept: BOARD_DND_TYPES.task,
		disabled: taskDragDisabled,

		sensors: [
			PointerSensor.configure({
				activationConstraints(event) {
					if (event.pointerType === "touch") {
						return [
							new PointerActivationConstraints.Delay({
								value: 250,
								tolerance: 5,
							}),
						];
					}

					return [
						new PointerActivationConstraints.Distance({
							value: 6,
						}),
					];
				},
			}),
		],
	});

	return (
		<article
			id={`board-task-${task.id}`}
			data-board-task-id={task.id}
			ref={sortable.ref}
			className={cn(
				"relative overflow-hidden rounded-xl border border-border bg-card pt-4 px-4 pb-2 shadow-sm transition-[border-color,box-shadow,transform] hover:border-foreground/30 hover:shadow-md",
				task.completedAt && "bg-muted/20",
				sortable.isDragging && "opacity-50",
				selected && "border-primary ring-2 ring-primary/15",
				keyboardFocused &&
					"outline outline-2 outline-offset-2 outline-foreground/35",
			)}
		>
			{!selectionMode && (permissions.canManageTasks || task.completedAt) && (
				<div className="absolute left-2.5 top-3.5 z-20">
					<TaskCompletionToggle
						taskId={task.id}
						completed={task.completedAt !== null}
						canManage={permissions.canManageTasks}
						compact
					/>
				</div>
			)}
			<div
				ref={sortable.handleRef}
				className={cn(
					"relative",
					!taskDragDisabled &&
						"touch-none select-none cursor-grab active:cursor-grabbing",
				)}
			>
				<Link
					href={taskHref}
					aria-label={
						selectionMode
							? `${selected ? "Deselect" : "Select"} ${task.title}`
							: `Open ${task.title}`
					}
					onClick={(event) => {
						if (!selectionMode) {
							return;
						}

						event.preventDefault();

						onToggleSelection?.(task.id);
					}}
					className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<h4
						title={task.title}
						className={cn(
							"line-clamp-2 break-words pr-8 text-sm font-semibold leading-5 text-foreground",
							!selectionMode &&
								(permissions.canManageTasks || task.completedAt) &&
								"pl-5",
							task.completedAt &&
								"text-muted-foreground line-through decoration-muted-foreground/60",
						)}
					>
						{task.title}
					</h4>

					{task.description && (
						<p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
							{task.description}
						</p>
					)}

					{visibleLabels.length > 0 && (
						<div className="mt-3 flex flex-wrap items-center gap-1.5">
							{visibleLabels.map((label) => (
								<TaskLabelBadge
									key={label.id}
									label={label}
									className="max-w-28 py-0.5"
								/>
							))}

							{assignedLabels.length > visibleLabels.length && (
								<span className="inline-flex items-center rounded-md border border-border bg-background px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
									+{assignedLabels.length - visibleLabels.length}
								</span>
							)}
						</div>
					)}

					{(task.priority || schedule) && (
						<div className="mt-3 flex min-h-6 items-center gap-2">
							{task.priority && (
								<TaskPriorityBadge
									priority={task.priority}
									className="shrink-0"
								/>
							)}

							{schedule && (
								<span
									className={cn(
										"min-w-0 truncate text-xs font-medium text-muted-foreground",
										task.priority && "ml-auto",
									)}
								>
									{schedule}
								</span>
							)}
						</div>
					)}
				</Link>
			</div>

			{selectionMode ? (
				<button
					type="button"
					aria-pressed={selected}
					aria-label={`${selected ? "Deselect" : "Select"} ${task.title}`}
					onClick={() => onToggleSelection?.(task.id)}
					className="absolute right-2.5 top-2.5 z-20 flex size-7 items-center justify-center rounded-md transition-colors hover:bg-muted"
				>
					<span
						aria-hidden="true"
						className={cn(
							"flex size-4 items-center justify-center rounded border border-input bg-background",
							selected && "border-primary bg-primary text-primary-foreground",
						)}
					>
						{selected && <Check aria-hidden="true" className="size-3" />}
					</span>
				</button>
			) : (
				permissions.canManageTasks && (
					<div className="absolute right-2.5 top-2.5 z-20">
						<TaskActions
							task={toEditableTask(task)}
							labelCandidates={labelCandidates}
							assignedLabels={assignedLabels}
							assigneeCandidates={assigneeCandidates}
							assignedUsers={assignedUsers}
							canAssignTasks={permissions.canAssignTasks}
						/>
					</div>
				)
			)}

			{showFooter && (
				<div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
					<div className="min-w-0">
						<TaskAssigneePicker
							taskId={task.id}
							candidates={assigneeCandidates}
							assignedUsers={assignedUsers}
							canManage={permissions.canAssignTasks}
						/>
					</div>

					<Link
						href={taskHref}
						aria-label={`${commentCount} ${
							commentCount === 1 ? "comment" : "comments"
						} on ${task.title}`}
						className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
					>
						<MessageSquare aria-hidden="true" className="size-4" />

						{commentCount}
					</Link>
				</div>
			)}
		</article>
	);
}
