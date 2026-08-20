"use client";

import { Trash2 } from "lucide-react";

import { StageDeleteSubmitButton } from "@/components/stage-delete-submit-button";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteStage } from "@/lib/actions/stages";

type StageActionsProps = {
	projectId: string;
	stage: {
		id: string;
		name: string;
	};
	isBoardSavePending: boolean;
};

export function StageActions({
	projectId,
	stage,
	isBoardSavePending,
}: StageActionsProps) {
	const deleteAction = deleteStage.bind(null, projectId, stage.id);

	return (
		<div
			className="flex items-center"
			onPointerDown={(event) => event.stopPropagation()}
		>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						disabled={isBoardSavePending}
						aria-label={`Delete ${stage.name}`}
						className="text-muted-foreground hover:text-destructive"
					>
						<Trash2 aria-hidden="true" className="size-5" />
					</Button>
				</AlertDialogTrigger>

				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete {stage.name}?</AlertDialogTitle>

						<AlertDialogDescription>
							This permanently deletes the stage and every task inside it. This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<form action={deleteAction}>
						<AlertDialogFooter>
							<AlertDialogCancel asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</AlertDialogCancel>

							<StageDeleteSubmitButton disabled={isBoardSavePending} />
						</AlertDialogFooter>
					</form>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
