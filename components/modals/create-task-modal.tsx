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
import type { AssignmentCandidate } from "@/types/member";
import type { TaskActionState } from "@/types/task";

type CreateTaskModalProps = {
	projectId: string;
	stageId: string;
	stageName: string;
	labelCandidates: ProjectLabel[];
	assigneeCandidates: AssignmentCandidate[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const initialState: TaskActionState = {
	success: false,
};

export function CreateTaskModal({
	projectId,
	stageId,
	stageName,
	labelCandidates,
	assigneeCandidates,
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
			<DialogContent
				headerVariant="primary"
				className="gap-0 overflow-hidden bg-background p-0 sm:max-w-lg"
			>
				<DialogHeader variant="primary">
					<DialogTitle>Create task</DialogTitle>

					<DialogDescription className="sr-only">
						Add a task to {stageName}.
					</DialogDescription>
				</DialogHeader>

				<form id={formId} action={formAction} noValidate />

				<div className="space-y-4 px-6 py-5">
					<TaskFormFields
						formId={formId}
						state={state}
						pending={pending}
						defaultValues={{
							title: "",
							description: "",
							priority: null,
							startDate: "",
							dueDate: "",
						}}
						labels={{
							mode: "create",
							projectId,
							candidates: labelCandidates,
						}}
						assignees={{
							mode: "create",
							candidates: assigneeCandidates,
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
						{pending ? "Creating..." : "Create task"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
