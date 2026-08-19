import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { CharacterCount } from "@/components/character-count";
import { FormFieldError } from "@/components/form-field-error";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { UserAvatar } from "@/components/user-avatar";
import { deleteComment, updateComment } from "@/lib/actions/comments";
import { COMMENT_FIELD_LIMITS } from "@/lib/constants/form-limits";
import type {
	CommentActionState,
	TaskCommentWithAuthor,
} from "@/types/comment";

type TaskCommentItemProps = {
	comment: TaskCommentWithAuthor;
	currentUserId: string;
	canManageComments: boolean;
	isProjectOwner: boolean;
};

type TaskCommentEditorProps = {
	comment: TaskCommentWithAuthor;
	onCancel: () => void;
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

function TaskCommentEditor({ comment, onCancel }: TaskCommentEditorProps) {
	const updateAction = updateComment.bind(null, comment.id);

	const [state, formAction, pending] = useActionState(
		updateAction,
		initialState,
	);

	const [content, setContent] = useState(comment.content);

	useEffect(() => {
		if (state.success) {
			onCancel();
		}
	}, [state.success, onCancel]);

	return (
		<form action={formAction} className="mt-3 space-y-3" noValidate>
			<div>
				<textarea
					id={`edit-comment-${comment.id}`}
					name="content"
					value={content}
					maxLength={COMMENT_FIELD_LIMITS.content}
					disabled={pending}
					aria-invalid={Boolean(state.errors?.content?.length)}
					aria-describedby={
						state.errors?.content?.length
							? `edit-comment-error-${comment.id}`
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
					className="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
				/>

				<div className="mt-1 flex items-start justify-between gap-3">
					<FormFieldError
						id={`edit-comment-error-${comment.id}`}
						messages={state.errors?.content}
					/>

					<CharacterCount
						current={content.length}
						max={COMMENT_FIELD_LIMITS.content}
					/>
				</div>
			</div>

			{state.message && !state.success && !state.errors?.content?.length && (
				<p aria-live="polite" className="text-sm text-destructive">
					{state.message}
				</p>
			)}

			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={pending}
					onClick={onCancel}
				>
					Cancel
				</Button>

				<Button
					type="submit"
					size="sm"
					disabled={pending || content.trim().length === 0}
				>
					{pending ? "Saving..." : "Save"}
				</Button>
			</div>
		</form>
	);
}

export function TaskCommentItem({
	comment,
	currentUserId,
	canManageComments,
	isProjectOwner,
}: TaskCommentItemProps) {
	const router = useRouter();

	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const isAuthor = comment.authorId === currentUserId;

	const canEdit = canManageComments && isAuthor;

	const canDelete = isProjectOwner || (canManageComments && isAuthor);

	const wasEdited = comment.updatedAt.getTime() > comment.createdAt.getTime();

	const deleteAction = deleteComment.bind(null, comment.id);

	const [deleteState, deleteFormAction, deletePending] = useActionState(
		deleteAction,
		initialState,
	);

	useEffect(() => {
		if (!deleteState.success) {
			return;
		}

		setIsDeleteOpen(false);
		router.refresh();
	}, [deleteState.success, router]);

	return (
		<div className="flex gap-3 rounded-lg border border-border p-3">
			<UserAvatar user={comment.author} className="size-8 shrink-0" />

			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<p className="truncate text-sm font-medium text-foreground">
							{comment.author.name ?? comment.author.email}
						</p>

						<div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
							<time dateTime={comment.createdAt.toISOString()}>
								{formatCommentDate(comment.createdAt)}
							</time>

							{wasEdited && <span>· edited</span>}
						</div>
					</div>

					{(canEdit || canDelete) && (
						<Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
							<PopoverTrigger asChild>
								<Button
									type="button"
									variant="ghost"
									size="icon-xs"
									aria-label="Comment actions"
								>
									<MoreHorizontal aria-hidden="true" size={14} />
								</Button>
							</PopoverTrigger>

							<PopoverContent align="end" className="w-36 p-1">
								{canEdit && (
									<Button
										type="button"
										variant="ghost"
										className="w-full justify-start"
										onClick={() => {
											setIsMenuOpen(false);
											setIsEditing(true);
										}}
									>
										<Pencil aria-hidden="true" size={14} />
										Edit
									</Button>
								)}

								{canDelete && (
									<Button
										type="button"
										variant="ghost"
										className="w-full justify-start text-destructive hover:text-destructive"
										onClick={() => {
											setIsMenuOpen(false);
											setIsDeleteOpen(true);
										}}
									>
										<Trash2 aria-hidden="true" size={14} />
										Delete
									</Button>
								)}
							</PopoverContent>
						</Popover>
					)}
				</div>

				{isEditing ? (
					<TaskCommentEditor
						comment={comment}
						onCancel={() => setIsEditing(false)}
					/>
				) : (
					<p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
						{comment.content}
					</p>
				)}
			</div>

			<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this comment?</AlertDialogTitle>

						<AlertDialogDescription>
							This permanently deletes the comment. This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<form action={deleteFormAction}>
						<AlertDialogFooter>
							<AlertDialogCancel type="button" disabled={deletePending}>
								Cancel
							</AlertDialogCancel>

							<Button
								type="submit"
								variant="destructive"
								disabled={deletePending}
							>
								{deletePending ? "Deleting..." : "Delete comment"}
							</Button>
						</AlertDialogFooter>
					</form>

					{deleteState.message && !deleteState.success && (
						<p aria-live="polite" className="text-sm text-destructive">
							{deleteState.message}
						</p>
					)}
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
