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
import type { EditableTask, TaskActionState } from "@/types/task";

type EditTaskModalProps = {
	task: EditableTask;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const initialState: TaskActionState = {
	success: false,
};

export function EditTaskModal({
	task,
	open,
	onOpenChange,
}: EditTaskModalProps) {
	const updateAction = updateTask.bind(null, task.id);

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
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Edit task</DialogTitle>

					<DialogDescription>Update the task details.</DialogDescription>
				</DialogHeader>

				<form action={formAction} className="space-y-6" noValidate>
					<TaskFormFields
						state={state}
						pending={pending}
						defaultValues={{
							title: task.title,
							description: task.description,
							priority: task.priority,
							dueDate: task.dueDate,
						}}
					/>

					{state.message && !state.success && !hasFieldErrors && (
						<p aria-live="polite" className="text-sm text-destructive">
							{state.message}
						</p>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							disabled={pending}
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>

						<Button type="submit" disabled={pending}>
							{pending ? "Saving..." : "Save changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
