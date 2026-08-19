import { useActionState } from "react";

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
import { createProject } from "@/lib/actions/projects";
import { DEFAULT_COLOR } from "@/lib/constants/colors";
import type { ProjectActionState } from "@/types/project";

type CreateProjectModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const initialState: ProjectActionState = {
	success: false,
};

export function CreateProjectModal({
	open,
	onOpenChange,
}: CreateProjectModalProps) {
	const [state, formAction, pending] = useActionState(
		createProject,
		initialState,
	);

	const hasFieldErrors = Object.values(state.errors ?? {}).some((fieldErrors) =>
		Boolean(fieldErrors?.length),
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Create project</DialogTitle>

					<DialogDescription>
						Create a workspace for your tasks, stages, and collaborators.
					</DialogDescription>
				</DialogHeader>

				<form action={formAction} className="space-y-6" noValidate>
					<ProjectFormFields
						state={state}
						pending={pending}
						defaultValues={{
							name: "",
							description: "",
							color: DEFAULT_COLOR,
							startDate: "",
							dueDate: "",
						}}
					/>

					{state.message && !hasFieldErrors && (
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
							{pending ? "Creating..." : "Create project"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}