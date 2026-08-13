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
import { renameStage } from "@/lib/actions/stages";
import type { EditableStage, StageActionState } from "@/types/stage";

type EditStageModalProps = {
	stage: EditableStage;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const initialState: StageActionState = {
	success: false,
};

export function EditStageModal({
	stage,
	open,
	onOpenChange,
}: EditStageModalProps) {
	const renameAction = renameStage.bind(null, stage.id);

	const [state, formAction, pending] = useActionState(
		renameAction,
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
					<DialogTitle>Rename stage</DialogTitle>

					<DialogDescription>
						Change the name of this project stage.
					</DialogDescription>
				</DialogHeader>

				<form action={formAction} className="space-y-6" noValidate>
					<StageFormFields
						state={state}
						pending={pending}
						defaultValues={{
							name: stage.name,
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
