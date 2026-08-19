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
import { createTask } from "@/lib/actions/tasks";
import type { ProjectLabel } from "@/lib/db/schema";
import type { TaskActionState } from "@/types/task";

type CreateTaskModalProps = {
	stageId: string;
	stageName: string;
	labelCandidates: ProjectLabel[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const initialState: TaskActionState = {
	success: false,
};

export function CreateTaskModal({
	stageId,
	stageName,
	labelCandidates,
	open,
	onOpenChange,
}: CreateTaskModalProps) {
	const createAction = createTask.bind(null, stageId);
	const formId = `create-task-${stageId}`;

	const [state, formAction, pending] = useActionState(
		createAction,
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
					<DialogTitle>Create task</DialogTitle>

					<DialogDescription>Add a task to {stageName}.</DialogDescription>
				</DialogHeader>

				<form id={formId} action={formAction} noValidate />

				<TaskFormFields
					formId={formId}
					state={state}
					pending={pending}
					defaultValues={{
						title: "",
						description: "",
						priority: "medium",
						startDate: "",
						dueDate: "",
					}}
					labels={{
						mode: "create",
						candidates: labelCandidates,
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

					<Button type="submit" form={formId} disabled={pending}>
						{pending ? "Creating..." : "Create task"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
