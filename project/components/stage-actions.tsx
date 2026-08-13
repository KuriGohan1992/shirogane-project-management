"use client";

import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { EditStageModal } from "@/components/modals/edit-stage-modal";
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
import { deleteStage, moveStage } from "@/lib/actions/stages";
import type { EditableStage } from "@/types/stage";

type StageActionsProps = {
	stage: EditableStage;
	canMoveLeft: boolean;
	canMoveRight: boolean;
};

export function StageActions({
	stage,
	canMoveLeft,
	canMoveRight,
}: StageActionsProps) {
	const [isEditOpen, setIsEditOpen] = useState(false);

	const moveLeftAction = moveStage.bind(null, stage.id, "left");

	const moveRightAction = moveStage.bind(null, stage.id, "right");

	const deleteAction = deleteStage.bind(null, stage.id);

	return (
		<>
			<div className="flex items-center gap-0.5">
				<form action={moveLeftAction}>
					<Button
						type="submit"
						variant="ghost"
						size="icon-xs"
						disabled={!canMoveLeft}
						aria-label={`Move ${stage.name} left`}
						className="text-muted-foreground"
					>
						<ChevronLeft aria-hidden="true" />
					</Button>
				</form>

				<form action={moveRightAction}>
					<Button
						type="submit"
						variant="ghost"
						size="icon-xs"
						disabled={!canMoveRight}
						aria-label={`Move ${stage.name} right`}
						className="text-muted-foreground"
					>
						<ChevronRight aria-hidden="true" />
					</Button>
				</form>

				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					aria-label={`Rename ${stage.name}`}
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

								<Button type="submit" variant="destructive">
									Delete stage
								</Button>
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
