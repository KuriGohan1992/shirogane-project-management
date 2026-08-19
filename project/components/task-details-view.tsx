"use client";

import {
	AlignLeft,
	CalendarDays,
	Check,
	CircleAlert,
	Columns3,
	Copy,
	MessageSquare,
	Send,
	Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useActionState, useEffect, useState } from "react";

import { CharacterCount } from "@/components/character-count";
import { FormFieldError } from "@/components/form-field-error";
import { TaskActions } from "@/components/task-actions";
import { TaskAssigneePicker } from "@/components/task-assignee-picker";
import { TaskCommentItem } from "@/components/task-comment-item";
import { Button } from "@/components/ui/button";
import { createComment } from "@/lib/actions/comments";
import type { ProjectPermissions } from "@/lib/auth/project-permissions";
import { COMMENT_FIELD_LIMITS } from "@/lib/constants/form-limits";
import type { Task } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import type { CommentActionState } from "@/types/comment";
import type { AssignmentCandidate } from "@/types/member";
import type { EditableTask, TaskWithDetails } from "@/types/task";

type TaskDetailsViewProps = {
	task: TaskWithDetails;
	projectName: string;
	stageName: string;
	assigneeCandidates: AssignmentCandidate[];
	permissions: ProjectPermissions;
	currentUserId: string;
	isProjectOwner: boolean;
};

type PropertyItemProps = {
	icon: ReactNode;
	label: string;
	children: ReactNode;
	className?: string;
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
			return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";

		case "medium":
			return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";

		case "high":
			return "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300";

		case "urgent":
			return "border-destructive/30 bg-destructive/10 text-destructive";
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

function PropertyItem({ icon, label, children, className }: PropertyItemProps) {
	return (
		<div
			className={cn(
				"flex min-h-14 items-center gap-3 rounded-xl border border-border/70 bg-card px-3.5 py-2.5 shadow-xs",
				className,
			)}
		>
			<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
				{icon}
			</div>

			<div className="min-w-0 flex-1">
				<p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
					{label}
				</p>

				<div className="mt-0.5 text-sm font-medium">{children}</div>
			</div>
		</div>
	);
}

export function TaskDetailsView({
	task,
	projectName,
	stageName,
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

	const [copied, setCopied] = useState(false);

	const assignedUsers = task.assignees.map((assignee) => assignee.user);

	useEffect(() => {
		if (state.success) {
			setContent("");
		}
	}, [state.success]);

	async function copyTaskLink() {
		try {
			await navigator.clipboard.writeText(window.location.href);

			setCopied(true);

			window.setTimeout(() => {
				setCopied(false);
			}, 1500);
		} catch {
			setCopied(false);
		}
	}

	return (
		<div className="overflow-hidden bg-background">
			<header className="border-b border-border/70 bg-gradient-to-br from-primary/15 via-primary/5 to-background px-6 py-5 lg:px-8 lg:py-6">
				<div className="flex items-start gap-4 pr-8">
					<div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
						<CircleAlert aria-hidden="true" size={19} />
					</div>

					<div className="min-w-0 flex-1">
						<p className="mb-1 text-xs font-medium text-primary">
							{projectName}
							<span className="px-1.5 text-muted-foreground">/</span>
							{stageName}
						</p>

						<h1 className="break-words text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
							{task.title}
						</h1>

						<div className="mt-3 flex flex-wrap items-center gap-2">
							<span
								className={cn(
									"inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
									getPriorityClasses(task.priority),
								)}
							>
								{task.priority} priority
							</span>

							{task.dueDate && (
								<span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
									<CalendarDays aria-hidden="true" size={12} />
									{formatDate(task.dueDate)}
								</span>
							)}
						</div>
					</div>

					<div className="flex shrink-0 items-center gap-1">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label="Copy task link"
							onClick={copyTaskLink}
						>
							{copied ? (
								<Check aria-hidden="true" size={16} />
							) : (
								<Copy aria-hidden="true" size={16} />
							)}
						</Button>

						{permissions.canManageTasks && (
							<TaskActions task={toEditableTask(task)} />
						)}
					</div>
				</div>
			</header>

			<div className="grid lg:grid-cols-[minmax(0,1.55fr)_minmax(21rem,0.85fr)]">
				<main className="bg-background px-6 py-6 lg:px-8 lg:py-7">
					<div className="mx-auto max-w-3xl space-y-7">
						<section>
							<div className="mb-3 flex items-center gap-2">
								<AlignLeft
									aria-hidden="true"
									size={17}
									className="text-primary"
								/>

								<h2 className="font-semibold">Description</h2>
							</div>

							<div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
								{task.description ? (
									<p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground/90">
										{task.description}
									</p>
								) : (
									<p className="text-sm text-muted-foreground">
										No description has been added yet.
									</p>
								)}
							</div>
						</section>

						<section>
							<h2 className="mb-3 font-semibold">Task details</h2>

							<div className="grid gap-3 sm:grid-cols-2">
								<PropertyItem
									icon={<Columns3 aria-hidden="true" size={16} />}
									label="Stage"
								>
									{stageName}
								</PropertyItem>

								<PropertyItem
									icon={<CircleAlert aria-hidden="true" size={16} />}
									label="Priority"
									className={getPriorityClasses(task.priority)}
								>
									<span className="capitalize">{task.priority}</span>
								</PropertyItem>

								<PropertyItem
									icon={<CalendarDays aria-hidden="true" size={16} />}
									label="Due date"
								>
									{task.dueDate ? formatDate(task.dueDate) : "No due date"}
								</PropertyItem>

								<PropertyItem
									icon={<Users aria-hidden="true" size={16} />}
									label="Assignees"
								>
									{assignedUsers.length === 0 && !permissions.canAssignTasks ? (
										<span className="text-muted-foreground">Unassigned</span>
									) : (
										<TaskAssigneePicker
											taskId={task.id}
											candidates={assigneeCandidates}
											assignedUsers={assignedUsers}
											canManage={permissions.canAssignTasks}
										/>
									)}
								</PropertyItem>
							</div>
						</section>
					</div>
				</main>

				<aside className="border-t border-border/70 bg-muted/35 lg:border-t-0 lg:border-l">
					<div className="flex items-center justify-between border-b border-border/70 bg-card/70 px-5 py-4">
						<div className="flex items-center gap-2">
							<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<MessageSquare aria-hidden="true" size={15} />
							</div>

							<div>
								<h2 className="text-sm font-semibold">Comments</h2>

								<p className="text-xs text-muted-foreground">
									Discussion and updates
								</p>
							</div>
						</div>

						<span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
							{task.comments.length}
						</span>
					</div>

					<div className="max-h-[42vh] overflow-y-auto p-4">
						{task.comments.length === 0 ? (
							<div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/60 px-6 text-center">
								<div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
									<MessageSquare aria-hidden="true" size={17} />
								</div>

								<p className="text-sm font-medium">No comments yet</p>

								<p className="mt-1 max-w-56 text-xs leading-5 text-muted-foreground">
									Start a discussion with your project collaborators.
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

					<div className="border-t border-border/70 bg-background/90 p-4">
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
										className="min-h-20 w-full resize-none rounded-xl border border-input bg-card px-3.5 py-3 text-sm shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
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

								<div className="flex justify-end">
									<Button
										type="submit"
										disabled={pending || content.trim().length === 0}
									>
										<Send aria-hidden="true" size={14} />

										{pending ? "Posting..." : "Post comment"}
									</Button>
								</div>

								<p className="text-right text-[11px] text-muted-foreground">
									Enter to post · Shift + Enter for a new line
								</p>
							</form>
						) : (
							<div className="rounded-xl border border-border bg-muted px-3.5 py-3 text-xs leading-5 text-muted-foreground">
								You have read-only access to this discussion.
							</div>
						)}
					</div>
				</aside>
			</div>
		</div>
	);
}
