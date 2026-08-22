"use client";

import { Archive, RotateCcw, Trash2 } from "lucide-react";

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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	deleteArchivedTask,
	restoreArchivedTask,
} from "@/lib/actions/task-archive";
import type { ArchivedTaskSummary } from "@/types/task";

type ArchivedTasksButtonProps = {
	tasks: ArchivedTaskSummary[];
	canManage: boolean;
};

function formatArchivedDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

export function ArchivedTasksButton({
	tasks,
	canManage,
}: ArchivedTasksButtonProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="h-9 gap-2 bg-card"
				>
					<Archive aria-hidden="true" className="size-4" />

					<span>Archived</span>

					<span className="inline-flex min-w-5 items-center justify-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
						{tasks.length}
					</span>
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Archived tasks</DialogTitle>

					<DialogDescription>
						Archived tasks are hidden from the board. Restoring a task returns
						it to its previous stage.
					</DialogDescription>
				</DialogHeader>

				{tasks.length === 0 ? (
					<div className="flex min-h-48 flex-col items-center justify-center text-center">
						<Archive
							aria-hidden="true"
							size={24}
							className="text-muted-foreground"
						/>

						<p className="mt-3 text-sm font-medium">No archived tasks</p>

						<p className="mt-1 text-xs text-muted-foreground">
							Tasks you archive will appear here.
						</p>
					</div>
				) : (
					<div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
						{tasks.map((task) => {
							const restoreAction = restoreArchivedTask.bind(null, task.id);

							const deleteAction = deleteArchivedTask.bind(null, task.id);

							return (
								<div
									key={task.id}
									className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
								>
									<div className="min-w-0">
										<p className="truncate text-sm font-medium">{task.title}</p>

										<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
											<span>{task.stageName}</span>

											<span aria-hidden="true">•</span>

											<span className="capitalize">
												{task.priority ?? "No priority"}
											</span>

											<span aria-hidden="true">•</span>

											<span>
												Archived {formatArchivedDate(task.archivedAt)}
											</span>
										</div>
									</div>

									{canManage && (
										<div className="flex shrink-0 items-center gap-1">
											<form action={restoreAction}>
												<Button type="submit" variant="outline" size="sm">
													<RotateCcw aria-hidden="true" size={14} />
													Restore
												</Button>
											</form>

											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														type="button"
														variant="ghost"
														size="icon-sm"
														className="text-destructive hover:text-destructive"
														aria-label={`Permanently delete ${task.title}`}
													>
														<Trash2 aria-hidden="true" size={14} />
													</Button>
												</AlertDialogTrigger>

												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Permanently delete {task.title}?
														</AlertDialogTitle>

														<AlertDialogDescription>
															This permanently deletes the archived task and its
															comments. This action cannot be undone.
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
																Delete permanently
															</Button>
														</AlertDialogFooter>
													</form>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
