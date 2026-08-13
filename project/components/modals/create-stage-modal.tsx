import { useActionState, useEffect } from "react";

import { StageFormFields } from "@/components/stage-form-fields";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { createStage } from "@/lib/actions/stages";
import type { StageActionState } from "@/types/stage";

type CreateStageModalProps = {
	projectId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const initialState: StageActionState = {
	success: false,
};

export function CreateStageModal({
	projectId,
	open,
	onOpenChange,
}: CreateStageModalProps) {
	const createAction = createStage.bind(null, projectId);

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
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create stage</DialogTitle>

					<DialogDescription>
						Add another stage to this project.
					</DialogDescription>
				</DialogHeader>

				<form action={formAction} className="space-y-6" noValidate>
					<StageFormFields
						state={state}
						pending={pending}
						defaultValues={{
							name: "",
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
							{pending ? "Creating..." : "Create stage"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
