"use client";

import {
	CircleCheckBig,
	MoreVertical,
	Pencil,
	RotateCcw,
	Trash2,
} from "lucide-react";
import { useState } from "react";

import { EditProjectModal } from "@/components/modals/edit-project-modal";
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
import {
	deleteProject,
	setProjectCompletedState,
} from "@/lib/actions/projects";
import type { EditableProject } from "@/types/project";

type ProjectActionsProps = {
	project: EditableProject;
	canEdit: boolean;
	canDelete: boolean;
	canComplete: boolean;
	isCompleted: boolean;
	compact?: boolean;
	menuSize?: "default" | "small";
};

export function ProjectActions({
	project,
	canEdit,
	canDelete,
	canComplete,
	isCompleted,
	compact = false,
	menuSize = "default",
}: ProjectActionsProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const deleteAction = deleteProject.bind(null, project.id);

	const changeCompletedStateAction = setProjectCompletedState.bind(
		null,
		project.id,
		!isCompleted,
	);

	if (!canEdit && !canDelete && !canComplete) {
		return null;
	}

	if (compact) {
		return (
			<>
				<Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
					<PopoverTrigger asChild>
						<button
							type="button"
							aria-label={`Actions for ${project.name}`}
							className="group/project-actions inline-flex h-5 w-4 shrink-0 items-center justify-center p-0 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<MoreVertical
								aria-hidden="true"
								className={`${
									menuSize === "small" ? "size-4" : "size-7"
								} transition-[stroke-width] group-hover/project-actions:[stroke-width:3]`}
								strokeWidth={2}
							/>
						</button>
					</PopoverTrigger>

					<PopoverContent align="end" className="w-44 p-1">
						{canComplete && (
							<form
								action={changeCompletedStateAction}
								onSubmit={() => setIsMenuOpen(false)}
							>
								<Button
									type="submit"
									variant="ghost"
									className="w-full justify-start hover:bg-muted hover:text-foreground"
								>
									{isCompleted ? (
										<RotateCcw aria-hidden="true" size={14} />
									) : (
										<CircleCheckBig aria-hidden="true" size={14} />
									)}

									{isCompleted ? "Mark active" : "Mark complete"}
								</Button>
							</form>
						)}

						{canEdit && (
							<Button
								type="button"
								variant="ghost"
								className="w-full justify-start hover:bg-muted hover:text-foreground"
								onClick={() => {
									setIsMenuOpen(false);
									setIsEditOpen(true);
								}}
							>
								<Pencil aria-hidden="true" size={14} />
								Edit project
							</Button>
						)}

						{canDelete && (
							<>
								{(canComplete || canEdit) && (
									<div className="my-1 h-px bg-border" />
								)}

								<Button
									type="button"
									variant="ghost"
									className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
									onClick={() => {
										setIsMenuOpen(false);
										setIsDeleteOpen(true);
									}}
								>
									<Trash2 aria-hidden="true" size={14} />
									Delete project
								</Button>
							</>
						)}
					</PopoverContent>
				</Popover>

				{canEdit && isEditOpen && (
					<EditProjectModal
						project={project}
						open={isEditOpen}
						onOpenChange={setIsEditOpen}
					/>
				)}

				<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete {project.name}?</AlertDialogTitle>

							<AlertDialogDescription>
								This permanently deletes the project and all of its stages and
								tasks. This action cannot be undone.
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
									Delete project
								</Button>
							</AlertDialogFooter>
						</form>
					</AlertDialogContent>
				</AlertDialog>
			</>
		);
	}

	return (
		<>
			<div className="flex items-center gap-1">
				{canComplete && (
					<form action={changeCompletedStateAction}>
						<Button type="submit" variant="outline" size="sm">
							{isCompleted ? (
								<RotateCcw aria-hidden="true" />
							) : (
								<CircleCheckBig aria-hidden="true" />
							)}

							{isCompleted ? "Reopen" : "Complete"}
						</Button>
					</form>
				)}

				{canEdit && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setIsEditOpen(true)}
					>
						<Pencil aria-hidden="true" />
						Edit
					</Button>
				)}

				{canDelete && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="text-destructive hover:bg-destructive/10 hover:text-destructive"
						onClick={() => setIsDeleteOpen(true)}
					>
						<Trash2 aria-hidden="true" />
						Delete
					</Button>
				)}
			</div>

			{canEdit && isEditOpen && (
				<EditProjectModal
					project={project}
					open={isEditOpen}
					onOpenChange={setIsEditOpen}
				/>
			)}

			<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete {project.name}?</AlertDialogTitle>

						<AlertDialogDescription>
							This permanently deletes the project and all of its stages and
							tasks. This action cannot be undone.
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
								Delete project
							</Button>
						</AlertDialogFooter>
					</form>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
