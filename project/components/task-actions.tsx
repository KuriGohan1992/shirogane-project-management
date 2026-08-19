"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { deleteTask } from "@/lib/actions/tasks";
import type { EditableTask } from "@/types/task";

type TaskActionsProps = {
	task: EditableTask;
};

export function TaskActions({ task }: TaskActionsProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const deleteAction = deleteTask.bind(null, task.id);

	return (
		<>
			<Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label={`Actions for ${task.title}`}
					>
						<MoreHorizontal aria-hidden="true" size={16} />
					</Button>
				</PopoverTrigger>

				<PopoverContent align="end" className="w-40 p-1">
					<Button
						type="button"
						variant="ghost"
						className="w-full justify-start"
						onClick={() => {
							setIsMenuOpen(false);
							setIsEditOpen(true);
						}}
					>
						<Pencil aria-hidden="true" size={14} />
						Edit task
					</Button>

					<Button
						type="button"
						variant="ghost"
						className="w-full justify-start text-destructive hover:text-destructive"
						onClick={() => {
							setIsMenuOpen(false);
							setIsDeleteOpen(true);
						}}
					>
						<Trash2 aria-hidden="true" size={14} />
						Delete task
					</Button>
				</PopoverContent>
			</Popover>

			{isEditOpen && (
				<EditTaskModal
					task={task}
					open={isEditOpen}
					onOpenChange={setIsEditOpen}
				/>
			)}

			<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete {task.title}?</AlertDialogTitle>

						<AlertDialogDescription>
							This permanently deletes the task and its comments. This action
							cannot be undone.
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
		</>
	);
}
