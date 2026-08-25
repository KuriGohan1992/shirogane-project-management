import { useActionState, useEffect } from "react";

import { TaskFormFields } from "@/components/task-form-fields";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { updateTask } from "@/lib/actions/tasks";
import type { ProjectLabel } from "@/lib/db/schema";
import type { AssignmentCandidate } from "@/types/member";
import type { EditableTask, TaskActionState } from "@/types/task";
import type { UserSummary } from "@/types/user";

type EditTaskModalProps = {
	task: EditableTask;
	labelCandidates: ProjectLabel[];
	assignedLabels: ProjectLabel[];
	assigneeCandidates: AssignmentCandidate[];
	assignedUsers: UserSummary[];
	canAssignTasks: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const initialState: TaskActionState = {
	success: false,
};

export function EditTaskModal({
	task,
	labelCandidates,
	assignedLabels,
	assigneeCandidates,
	assignedUsers,
	canAssignTasks,
	open,
	onOpenChange,
}: EditTaskModalProps) {
	const updateAction = updateTask.bind(null, task.id);

	const formId = `edit-task-${task.id}`;

	const [state, formAction, pending] = useActionState(
		updateAction,
		initialState,
	);

	const hasFieldErrors = Object.values(state.errors ?? {}).some((fieldErrors) =>
		Boolean(fieldErrors?.length),
	);

	useEffect(() => {
		if (state.success) {
			onOpenChange(false);
		}
	}, [state.success, onOpenChange]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				headerVariant="primary"
				className="gap-0 overflow-hidden bg-background p-0 sm:max-w-lg"
			>
				<DialogHeader variant="primary">
					<DialogTitle>Edit task</DialogTitle>

					<DialogDescription className="sr-only">
						Update the task details.
					</DialogDescription>
				</DialogHeader>

				<form id={formId} action={formAction} noValidate />

				<div className="space-y-4 px-6 py-5">
					<TaskFormFields
						formId={formId}
						state={state}
						pending={pending}
						defaultValues={{
							title: task.title,
							description: task.description,
							priority: task.priority,
							startDate: task.startDate,
							dueDate: task.dueDate,
						}}
						labels={{
							mode: "edit",
							taskId: task.id,
							candidates: labelCandidates,
							assignedLabels,
							canManage: true,
						}}
						assignees={{
							mode: "edit",
							taskId: task.id,
							candidates: assigneeCandidates,
							assignedUsers,
							canManage: canAssignTasks,
						}}
					/>

					{state.message && !state.success && !hasFieldErrors && (
						<p aria-live="polite" className="text-sm text-destructive">
							{state.message}
						</p>
					)}
				</div>

				<DialogFooter className="px-6 pb-6">
					<Button
						type="button"
						variant="outline"
						className="bg-card hover:bg-card/90"
						disabled={pending}
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>

					<Button type="submit" form={formId} disabled={pending}>
						{pending ? "Saving..." : "Save changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
