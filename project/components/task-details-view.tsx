"use client";

import {
	AlignLeft,
	CalendarDays,
	CircleAlert,
	Columns3,
	Link2,
	MessageSquare,
	Send,
	Tag,
	Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useActionState, useEffect, useState } from "react";

import { CharacterCount } from "@/components/character-count";
import { FormFieldError } from "@/components/form-field-error";
import { TaskActions } from "@/components/task-actions";
import { TaskAssigneePicker } from "@/components/task-assignee-picker";
import { TaskCommentItem } from "@/components/task-comment-item";
import { TaskLabelBadge } from "@/components/task-label-badge";
import { Button } from "@/components/ui/button";
import { createComment } from "@/lib/actions/comments";
import type { ProjectPermissions } from "@/lib/auth/project-permissions";
import { COMMENT_FIELD_LIMITS } from "@/lib/constants/form-limits";
import type { ProjectLabel, Task } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import type { CommentActionState } from "@/types/comment";
import type { AssignmentCandidate } from "@/types/member";
import type { EditableTask, TaskWithDetails } from "@/types/task";

type TaskDetailsViewProps = {
	task: TaskWithDetails;
	projectName: string;
	stageName: string;
	labelCandidates: ProjectLabel[];
	assigneeCandidates: AssignmentCandidate[];
	permissions: ProjectPermissions;
	currentUserId: string;
	isProjectOwner: boolean;
};

type MetadataItemProps = {
	icon: ReactNode;
	label: string;
	children: ReactNode;
};

const initialCommentState: CommentActionState = {
	success: false,
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
			return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";

		case "medium":
			return "bg-amber-500/10 text-amber-700 dark:text-amber-300";

		case "high":
			return "bg-orange-500/10 text-orange-700 dark:text-orange-300";

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

function MetadataItem({ icon, label, children }: MetadataItemProps) {
	return (
		<div className="min-w-0">
			<div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
				{icon}
				<span>{label}</span>
			</div>

			<div className="mt-1.5 flex min-h-8 items-center text-sm font-medium">
				{children}
			</div>
		</div>
	);
}

export function TaskDetailsView({
	task,
	projectName,
	stageName,
	labelCandidates,
	assigneeCandidates,
	permissions,
	currentUserId,
	isProjectOwner,
}: TaskDetailsViewProps) {
	const createAction = createComment.bind(null, task.id);

	const [state, formAction, pending] = useActionState(
		createAction,
		initialCommentState,
	);

	const [content, setContent] = useState("");

	const assignedUsers = task.assignees.map((assignee) => assignee.user);

	const assignedLabels = task.labels
		.map((taskLabel) => taskLabel.label)
		.toSorted((a, b) => a.name.localeCompare(b.name));

	useEffect(() => {
		if (state.success) {
			setContent("");
		}
	}, [state.success]);

	function copyTaskLink() {
		void navigator.clipboard.writeText(window.location.href);
	}

	return (
		<div className="bg-background">
			<header className="border-b border-border px-6 py-5 lg:px-8">
				<div className="flex items-start justify-between gap-5 pr-8">
					<div className="min-w-0 flex-1">
						<div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
							<span className="font-medium text-foreground">{projectName}</span>

							<span>/</span>

							<span>{stageName}</span>
						</div>

						<h1 className="break-words text-2xl font-semibold tracking-tight text-foreground">
							{task.title}
						</h1>
					</div>

					{permissions.canManageTasks ? (
						<TaskActions
							task={toEditableTask(task)}
							labelCandidates={labelCandidates}
							assignedLabels={assignedLabels}
							showCopyLink
							redirectAfterRemoval
						/>
					) : (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label="Copy task link"
							onClick={copyTaskLink}
						>
							<Link2 aria-hidden="true" size={16} />
						</Button>
					)}
				</div>
			</header>

			<div className="grid lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
				<main className="min-w-0 px-6 py-7 lg:px-8">
					<div className="mx-auto max-w-4xl space-y-10">
						<section
							aria-label="Task details"
							className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4"
						>
							<MetadataItem
								icon={<Columns3 aria-hidden="true" size={14} />}
								label="Stage"
							>
								<span className="truncate">{stageName}</span>
							</MetadataItem>

							<MetadataItem
								icon={<CircleAlert aria-hidden="true" size={14} />}
								label="Priority"
							>
								<span
									className={cn(
										"inline-flex rounded-md px-2 py-1 text-xs font-medium capitalize",
										getPriorityClasses(task.priority),
									)}
								>
									{task.priority}
								</span>
							</MetadataItem>

							<MetadataItem
								icon={<CalendarDays aria-hidden="true" size={14} />}
								label="Schedule"
							>
								{task.startDate && task.dueDate ? (
									<span>
										{formatDate(task.startDate)} – {formatDate(task.dueDate)}
									</span>
								) : task.startDate ? (
									<span>Starts {formatDate(task.startDate)}</span>
								) : task.dueDate ? (
									<span>Due {formatDate(task.dueDate)}</span>
								) : (
									<span className="font-normal text-muted-foreground">
										No dates
									</span>
								)}
							</MetadataItem>

							<MetadataItem
								icon={<Users aria-hidden="true" size={14} />}
								label="Assignees"
							>
								{assignedUsers.length === 0 && !permissions.canAssignTasks ? (
									<span className="font-normal text-muted-foreground">
										Unassigned
									</span>
								) : (
									<TaskAssigneePicker
										taskId={task.id}
										candidates={assigneeCandidates}
										assignedUsers={assignedUsers}
										canManage={permissions.canAssignTasks}
									/>
								)}
							</MetadataItem>
						</section>

						<section>
							<div className="mb-3 flex items-center gap-2">
								<Tag
									aria-hidden="true"
									size={16}
									className="text-muted-foreground"
								/>

								<h2 className="text-sm font-semibold">Labels</h2>
							</div>

							{assignedLabels.length > 0 ? (
								<div className="flex flex-wrap gap-2">
									{assignedLabels.map((label) => (
										<TaskLabelBadge key={label.id} label={label} />
									))}
								</div>
							) : (
								<span className="text-sm text-muted-foreground">No labels</span>
							)}
						</section>

						<section>
							<div className="mb-4 flex items-center gap-2">
								<AlignLeft
									aria-hidden="true"
									size={17}
									className="text-muted-foreground"
								/>

								<h2 className="text-sm font-semibold">Description</h2>
							</div>

							{task.description ? (
								<p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground/90">
									{task.description}
								</p>
							) : (
								<p className="text-sm text-muted-foreground">
									No description has been added yet.
								</p>
							)}
						</section>
					</div>
				</main>

				<aside className="border-t border-border lg:border-t-0 lg:border-l">
					<div className="flex items-center justify-between border-b border-border px-5 py-4">
						<div className="flex items-center gap-2">
							<MessageSquare
								aria-hidden="true"
								size={16}
								className="text-muted-foreground"
							/>

							<h2 className="text-sm font-semibold">Comments</h2>
						</div>

						<span className="text-xs font-medium text-muted-foreground">
							{task.comments.length}
						</span>
					</div>

					<div className="max-h-[50vh] overflow-y-auto px-4 py-5">
						{task.comments.length === 0 ? (
							<div className="flex min-h-36 flex-col items-center justify-center text-center">
								<MessageSquare
									aria-hidden="true"
									size={20}
									className="text-muted-foreground"
								/>

								<p className="mt-3 text-sm font-medium">No comments yet</p>

								<p className="mt-1 max-w-56 text-xs leading-5 text-muted-foreground">
									Start a conversation about this task.
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{task.comments.map((comment) => (
									<TaskCommentItem
										key={comment.id}
										comment={comment}
										currentUserId={currentUserId}
										canManageComments={permissions.canManageTasks}
										isProjectOwner={isProjectOwner}
									/>
								))}
							</div>
						)}
					</div>

					<div className="border-t border-border p-4">
						{permissions.canManageTasks ? (
							<form action={formAction} className="space-y-3" noValidate>
								<div>
									<textarea
										id={`comment-content-${task.id}`}
										name="content"
										value={content}
										maxLength={COMMENT_FIELD_LIMITS.content}
										disabled={pending}
										placeholder="Write a comment..."
										aria-invalid={Boolean(state.errors?.content?.length)}
										aria-describedby={
											state.errors?.content?.length
												? `comment-content-error-${task.id}`
												: undefined
										}
										onChange={(event) => setContent(event.target.value)}
										onKeyDown={(event) => {
											if (
												event.key !== "Enter" ||
												event.shiftKey ||
												event.nativeEvent.isComposing
											) {
												return;
											}

											event.preventDefault();

											if (pending || content.trim().length === 0) {
												return;
											}

											event.currentTarget.form?.requestSubmit();
										}}
										className="min-h-20 w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
									/>

									<div className="mt-1.5 flex items-start justify-between gap-3">
										<FormFieldError
											id={`comment-content-error-${task.id}`}
											messages={state.errors?.content}
										/>

										<CharacterCount
											current={content.length}
											max={COMMENT_FIELD_LIMITS.content}
										/>
									</div>
								</div>

								{state.message &&
									!state.success &&
									!state.errors?.content?.length && (
										<p aria-live="polite" className="text-sm text-destructive">
											{state.message}
										</p>
									)}

								<div className="flex items-center justify-between gap-3">
									<p className="text-[11px] leading-4 text-muted-foreground">
										Enter to post
										<span className="hidden sm:inline">
											{" "}
											· Shift + Enter for a new line
										</span>
									</p>

									<Button
										type="submit"
										size="sm"
										disabled={pending || content.trim().length === 0}
									>
										<Send aria-hidden="true" size={14} />
										{pending ? "Posting..." : "Comment"}
									</Button>
								</div>
							</form>
						) : (
							<p className="text-xs leading-5 text-muted-foreground">
								You have read-only access to this discussion.
							</p>
						)}
					</div>
				</aside>
			</div>
		</div>
	);
}
