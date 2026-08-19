import { MessageSquare, Send, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { CharacterCount } from "@/components/character-count";
import { FormFieldError } from "@/components/form-field-error";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/user-avatar";
import { createComment, deleteComment } from "@/lib/actions/comments";
import { COMMENT_FIELD_LIMITS } from "@/lib/constants/form-limits";
import type {
	CommentActionState,
	TaskCommentWithAuthor,
} from "@/types/comment";

type TaskCommentsModalProps = {
	taskId: string;
	taskTitle: string;
	comments: TaskCommentWithAuthor[];
	currentUserId: string;
	canComment: boolean;
	isProjectOwner: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const initialState: CommentActionState = {
	success: false,
};

function formatCommentDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

export function TaskCommentsModal({
	taskId,
	taskTitle,
	comments,
	currentUserId,
	canComment,
	isProjectOwner,
	open,
	onOpenChange,
}: TaskCommentsModalProps) {
	const createAction = createComment.bind(null, taskId);

	const [state, formAction, pending] = useActionState(
		createAction,
		initialState,
	);

	const [content, setContent] = useState("");

	useEffect(() => {
		if (state.success) {
			setContent("");
		}
	}, [state]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Comments</DialogTitle>

					<DialogDescription>
						Discuss {taskTitle} with your project collaborators.
					</DialogDescription>
				</DialogHeader>

				<div className="flex min-h-0 flex-1 flex-col gap-4">
					<div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
						{comments.length === 0 ? (
							<div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 text-center">
								<MessageSquare
									aria-hidden="true"
									className="mb-3 text-muted-foreground"
									size={24}
								/>

								<p className="text-sm font-medium">No comments yet</p>

								<p className="mt-1 text-xs text-muted-foreground">
									Be the first to start the discussion.
								</p>
							</div>
						) : (
							comments.map((comment) => {
								const canDelete =
									isProjectOwner || comment.authorId === currentUserId;

								const deleteAction = deleteComment.bind(null, comment.id);

								return (
									<div
										key={comment.id}
										className="flex gap-3 rounded-lg border border-border p-3"
									>
										<UserAvatar
											user={comment.author}
											className="size-8 shrink-0"
										/>

										<div className="min-w-0 flex-1">
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0">
													<p className="truncate text-sm font-medium text-foreground">
														{comment.author.name ?? comment.author.email}
													</p>

													<time
														dateTime={comment.createdAt.toISOString()}
														className="text-xs text-muted-foreground"
													>
														{formatCommentDate(comment.createdAt)}
													</time>
												</div>

												{canDelete && (
													<form action={deleteAction}>
														<Button
															type="submit"
															variant="ghost"
															size="icon-xs"
															aria-label="Delete comment"
															className="text-muted-foreground hover:text-destructive"
														>
															<Trash2 aria-hidden="true" size={13} />
														</Button>
													</form>
												)}
											</div>

											<p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
												{comment.content}
											</p>
										</div>
									</div>
								);
							})
						)}
					</div>

					{canComment ? (
						<form action={formAction} className="space-y-3" noValidate>
							<div>
								<textarea
									id={`comment-content-${taskId}`}
									name="content"
									value={content}
									maxLength={COMMENT_FIELD_LIMITS.content}
									disabled={pending}
									placeholder="Write a comment..."
									aria-invalid={Boolean(state.errors?.content?.length)}
									aria-describedby={
										state.errors?.content?.length
											? `comment-content-error-${taskId}`
											: undefined
									}
									onChange={(event) => setContent(event.target.value)}
									className="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
								/>

								<div className="mt-1 flex items-start justify-between gap-3">
									<FormFieldError
										id={`comment-content-error-${taskId}`}
										messages={state.errors?.content}
									/>

									<CharacterCount
										current={content.length}
										max={COMMENT_FIELD_LIMITS.content}
									/>
								</div>
							</div>

							{state.message && !state.success && !state.errors?.content && (
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
						</form>
					) : (
						<p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
							You have read-only access to comments on this project.
						</p>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
