"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { EditTaskModal } from "@/components/modals/edit-task-modal";
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
import { deleteTask } from "@/lib/actions/tasks";
import type { EditableTask } from "@/types/task";

type TaskActionsProps = {
	task: EditableTask;
};

export function TaskActions({ task }: TaskActionsProps) {
	const [isEditOpen, setIsEditOpen] = useState(false);

	const deleteAction = deleteTask.bind(null, task.id);

	return (
		<>
			<div className="flex items-center gap-1">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					aria-label={`Edit ${task.title}`}
					onClick={() => setIsEditOpen(true)}
				>
					<Pencil aria-hidden="true" size={15} />
				</Button>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label={`Delete ${task.title}`}
							className="text-muted-foreground hover:text-destructive"
						>
							<Trash2 aria-hidden="true" size={15} />
						</Button>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete {task.title}?</AlertDialogTitle>

							<AlertDialogDescription>
								This permanently deletes the task. This action cannot be undone.
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
									Delete task
								</Button>
							</AlertDialogFooter>
						</form>
					</AlertDialogContent>
				</AlertDialog>
			</div>

			{isEditOpen && (
				<EditTaskModal
					task={task}
					open={isEditOpen}
					onOpenChange={setIsEditOpen}
				/>
			)}
		</>
	);
}
