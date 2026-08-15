"use client";

import { Pencil, Trash2 } from "lucide-react";
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
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/lib/actions/projects";
import type { EditableProject } from "@/types/project";

type ProjectActionsProps = {
	project: EditableProject;
	canEdit: boolean;
	canDelete: boolean;
	compact?: boolean;
};

export function ProjectActions({
	project,
	canEdit,
	canDelete,
	compact = false,
}: ProjectActionsProps) {
	const [isEditOpen, setIsEditOpen] = useState(false);

	const deleteAction = deleteProject.bind(null, project.id);
	if (!canEdit && !canDelete) {
		return null;
	}

	return (
		<>
			<div className="flex items-center gap-1">
				{canEdit && (
					<Button
						type="button"
						variant={compact ? "ghost" : "outline"}
						size={compact ? "icon" : "sm"}
						aria-label={compact ? `Edit ${project.name}` : undefined}
						onClick={() => setIsEditOpen(true)}
					>
						<Pencil aria-hidden="true" />
						{!compact && "Edit"}
					</Button>
				)}

				{canDelete && (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								type="button"
								variant={compact ? "ghost" : "outline"}
								size={compact ? "icon" : "sm"}
								aria-label={compact ? `Delete ${project.name}` : undefined}
								className="text-destructive hover:text-destructive"
							>
								<Trash2 aria-hidden="true" />
								{!compact && "Delete"}
							</Button>
						</AlertDialogTrigger>

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
				)}
			</div>

			{canEdit && isEditOpen && (
				<EditProjectModal
					project={project}
					open={isEditOpen}
					onOpenChange={setIsEditOpen}
				/>
			)}
		</>
	);
}
