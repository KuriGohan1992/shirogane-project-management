"use client";

import {
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
import { TaskActivityList } from "@/components/task-activity-list";
import { TaskAssigneePicker } from "@/components/task-assignee-picker";
import { TaskCommentItem } from "@/components/task-comment-item";
import { TaskCompletionToggle } from "@/components/task-completion-toggle";
import { TaskLabelBadge } from "@/components/task-label-badge";
import { TaskPriorityBadge } from "@/components/task-priority-badge";
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

type SectionHeaderProps = {
	title: string;
	first?: boolean;
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

			<div className="mt-1.5 flex min-h-7 items-center text-sm font-medium text-foreground">
				{children}
			</div>
		</div>
	);
}

function SectionHeader({ title, first = false }: SectionHeaderProps) {
	return (
		<div
			className={cn(
				"pb-3",
				first ? "border-b border-border" : "border-y border-border py-3",
			)}
		>
			<h2 className="text-xl font-bold tracking-tight text-foreground">
				{title}
			</h2>
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
		<div className="flex h-[min(52rem,90vh)] min-h-0 flex-col bg-background">
			<header className="shrink-0 bg-primary px-6 py-5 text-primary-foreground lg:px-8">
				<div className="flex items-start justify-between gap-5 pr-8">
					<div className="min-w-0 flex-1">
						<div className="mb-2 flex flex-wrap items-center gap-1.5 text-sm text-primary-foreground/75">
							<span className="font-semibold text-primary-foreground">
								{projectName}
							</span>

							<span>/</span>

							<span>{stageName}</span>
						</div>

						<div className="flex items-start gap-2.5">
							<TaskCompletionToggle
								taskId={task.id}
								completed={task.completedAt !== null}
								canManage={permissions.canManageTasks}
								onPrimary
							/>

							<h1
								className={cn(
									"min-w-0 flex-1 break-words text-2xl font-bold tracking-tight text-primary-foreground",
									task.completedAt &&
										"text-primary-foreground/65 line-through decoration-primary-foreground/50",
								)}
							>
								{task.title}
							</h1>
						</div>
					</div>

					{permissions.canManageTasks ? (
						<TaskActions
							task={toEditableTask(task)}
							labelCandidates={labelCandidates}
							assignedLabels={assignedLabels}
							assigneeCandidates={assigneeCandidates}
							assignedUsers={assignedUsers}
							canAssignTasks={permissions.canAssignTasks}
							showCopyLink
							redirectAfterRemoval
							onPrimary
						/>
					) : (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label="Copy task link"
							onClick={copyTaskLink}
							className="text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground"
						>
							<Link2 aria-hidden="true" size={16} />
						</Button>
					)}
				</div>
			</header>

			<div className="min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_23rem] lg:overflow-hidden xl:grid-cols-[minmax(0,1fr)_25rem]">
				<main className="min-w-0 lg:min-h-0 lg:overflow-y-auto">
					<div className="px-6 py-5 lg:px-8">
						<section>
							<SectionHeader title="Task details" first />

							<div className="pt-5">
								<div className="grid gap-x-10 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
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
										{task.priority ? (
											<TaskPriorityBadge priority={task.priority} />
										) : (
											<span className="font-normal text-muted-foreground">
												No priority
											</span>
										)}
									</MetadataItem>

									<MetadataItem
										icon={<Users aria-hidden="true" size={14} />}
										label="Assignees"
									>
										{assignedUsers.length === 0 &&
										!permissions.canAssignTasks ? (
											<span className="font-normal text-muted-foreground">
												Unassigned
											</span>
										) : (
											<TaskAssigneePicker
												taskId={task.id}
												candidates={assigneeCandidates}
												assignedUsers={assignedUsers}
												canManage={permissions.canAssignTasks}
												fieldStyle
												modal
											/>
										)}
									</MetadataItem>

									<MetadataItem
										icon={<CalendarDays aria-hidden="true" size={14} />}
										label="Start date"
									>
										{task.startDate ? (
											formatDate(task.startDate)
										) : (
											<span className="font-normal text-muted-foreground">
												Not set
											</span>
										)}
									</MetadataItem>

									<MetadataItem
										icon={<CalendarDays aria-hidden="true" size={14} />}
										label="Due date"
									>
										{task.dueDate ? (
											formatDate(task.dueDate)
										) : (
											<span className="font-normal text-muted-foreground">
												Not set
											</span>
										)}
									</MetadataItem>
								</div>

								<div className="mt-6">
									<div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
										<Tag aria-hidden="true" size={14} />
										<span>Labels</span>
									</div>

									{assignedLabels.length > 0 ? (
										<div className="flex flex-wrap gap-2">
											{assignedLabels.map((label) => (
												<TaskLabelBadge key={label.id} label={label} />
											))}
										</div>
									) : (
										<span className="text-sm text-muted-foreground">
											No labels
										</span>
									)}
								</div>
							</div>
						</section>

						<section className="mt-7">
							<SectionHeader title="Description" />

							<div className="pt-5">
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

						<section className="mt-7">
							<SectionHeader title="Activity" />

							<div className="pt-5">
								<TaskActivityList
									activities={task.activities}
									showHeader={false}
								/>
							</div>
						</section>
					</div>
				</main>

				<aside className="min-h-[28rem] border-t border-border lg:min-h-0 lg:border-l lg:border-t-0">
					<div className="flex h-full min-h-0 flex-col">
						<div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
							<h2 className="text-xl font-bold tracking-tight text-foreground">
								Comments
							</h2>

							<span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
								{task.comments.length}
							</span>
						</div>

						<div className="min-h-0 flex-1 overflow-y-auto p-4">
							{task.comments.length === 0 ? (
								<div className="flex min-h-44 flex-col items-center justify-center text-center">
									<MessageSquare
										aria-hidden="true"
										size={22}
										className="text-muted-foreground"
									/>

									<p className="mt-3 text-sm font-semibold">No comments yet</p>

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

						<div className="shrink-0 border-t border-border p-4">
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
											<p
												aria-live="polite"
												className="text-sm text-destructive"
											>
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
					</div>
				</aside>
			</div>
		</div>
	);
}
