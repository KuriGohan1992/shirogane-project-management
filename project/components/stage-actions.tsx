"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { EditStageModal } from "@/components/modals/edit-stage-modal";
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
	const [isEditOpen, setIsEditOpen] = useState(false);

	const deleteAction = deleteStage.bind(null, projectId, stage.id);

	return (
		<>
			<div className="flex items-center gap-0.5">
				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					aria-label={`Rename ${stage.name}`}
					disabled={isBoardSavePending}
					onClick={() => setIsEditOpen(true)}
				>
					<Pencil aria-hidden="true" />
				</Button>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							disabled={isBoardSavePending}
							aria-label={`Delete ${stage.name}`}
							className="text-muted-foreground hover:text-destructive"
						>
							<Trash2 aria-hidden="true" />
						</Button>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete {stage.name}?</AlertDialogTitle>

							<AlertDialogDescription>
								This permanently deletes the stage and every task inside it.
								This action cannot be undone.
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

			{isEditOpen && (
				<EditStageModal
					stage={stage}
					open={isEditOpen}
					onOpenChange={setIsEditOpen}
				/>
			)}
		</>
	);
}
