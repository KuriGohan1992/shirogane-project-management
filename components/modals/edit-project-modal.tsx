import { useActionState, useEffect } from "react";

import { ProjectFormFields } from "@/components/project-form-fields";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { updateProject } from "@/lib/actions/projects";
import type { EditableProject, ProjectActionState } from "@/types/project";

type EditProjectModalProps = {
	project: EditableProject;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const initialState: ProjectActionState = {
	success: false,
};

export function EditProjectModal({
	project,
	open,
	onOpenChange,
}: EditProjectModalProps) {
	const updateAction = updateProject.bind(null, project.id);

	const [state, formAction, pending] = useActionState(
		updateAction,
		initialState,
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
					<DialogTitle>Edit project</DialogTitle>

					<DialogDescription className="sr-only">
						Update the project's details and schedule.
					</DialogDescription>
				</DialogHeader>

				<form action={formAction} className="space-y-6 px-6 py-5" noValidate>
					<ProjectFormFields
						state={state}
						pending={pending}
						defaultValues={{
							name: project.name,
							description: project.description,
							color: project.color,
							startDate: project.startDate,
							dueDate: project.dueDate,
						}}
					/>

					{state.message && !state.success && (
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
