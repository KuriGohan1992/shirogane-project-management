"use client";

import { Archive, CircleCheckBig, RotateCcw, Trash2 } from "lucide-react";

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
	deleteAllArchivedTasks,
	deleteArchivedTask,
	restoreAllArchivedTasks,
	restoreArchivedTask,
} from "@/lib/actions/task-archive";
import { cn } from "@/lib/utils";
import type { ArchivedTaskSummary } from "@/types/task";

type ArchivedTasksButtonProps = {
	projectId: string;
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
	projectId,
	tasks,
	canManage,
}: ArchivedTasksButtonProps) {
	const restoreAllAction = restoreAllArchivedTasks.bind(null, projectId);
	const deleteAllAction = deleteAllArchivedTasks.bind(null, projectId);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					aria-label={`Archived tasks (${tasks.length})`}
					className="h-9 gap-2 bg-card px-2.5 sm:px-3"
				>
					<Archive aria-hidden="true" className="size-4" />
					<span className="hidden sm:inline">Archived</span>
					<span className="inline-flex min-w-5 items-center justify-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
						{tasks.length}
					</span>
				</Button>
			</DialogTrigger>

			<DialogContent
				headerVariant="primary"
				className="max-h-[min(90dvh,46rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden bg-background p-0 sm:max-w-xl"
			>
				<DialogHeader variant="primary" className="shrink-0">
					<DialogTitle>Archived tasks</DialogTitle>

					<DialogDescription className="sr-only">
						Archived tasks are hidden from the board. Restoring a task returns
						it to its previous stage.
					</DialogDescription>
				</DialogHeader>

				{tasks.length === 0 ? (
					<div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
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
					<div className="flex min-h-0 flex-1 flex-col">
						<div className="scrollbar-thin min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4 sm:px-6">
							{tasks.map((task) => {
								const restoreAction = restoreArchivedTask.bind(null, task.id);
								const deleteAction = deleteArchivedTask.bind(null, task.id);

								return (
									<div
										key={task.id}
										className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-card p-3"
									>
										<div className="flex min-w-0 items-start gap-2">
											<span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
												{task.completedAt && (
													<CircleCheckBig
														aria-hidden="true"
														className="size-4 text-emerald-600 dark:text-emerald-400"
													/>
												)}
											</span>

											<div className="min-w-0">
												<p
													className={cn(
														"truncate text-sm font-medium text-foreground",
														task.completedAt &&
															"text-muted-foreground line-through decoration-muted-foreground/60",
													)}
												>
													{task.title}
												</p>

												<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
													<span>{task.stageName}</span>
													<span aria-hidden="true">•</span>
													<span className="capitalize">
														{task.priority ?? "No priority"}
													</span>
													<span aria-hidden="true" className="hidden sm:inline">
														•
													</span>
													<span className="w-full sm:w-auto">
														Archived {formatArchivedDate(task.archivedAt)}
													</span>
												</div>
											</div>
										</div>

										{canManage && (
											<div className="flex shrink-0 items-center gap-1">
												<form action={restoreAction}>
													<Button
														type="submit"
														variant="ghost"
														size="icon-sm"
														className="sm:hidden"
														aria-label={`Restore ${task.title}`}
													>
														<RotateCcw aria-hidden="true" size={14} />
													</Button>

													<Button
														type="submit"
														variant="outline"
														size="sm"
														className="hidden sm:inline-flex"
													>
														<RotateCcw aria-hidden="true" className="size-4" />
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
																This permanently deletes the archived task and
																its comments. This action cannot be undone.
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

						{canManage && (
							<div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-4 sm:px-6">
								<form action={restoreAllAction}>
									<Button type="submit" variant="outline" size="sm">
										<RotateCcw aria-hidden="true" className="size-4" />
										Restore all
									</Button>
								</form>

								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="text-destructive hover:bg-destructive/10 hover:text-destructive"
										>
											<Trash2 aria-hidden="true" className="size-4" />
											Delete all
										</Button>
									</AlertDialogTrigger>

									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												Permanently delete all archived tasks?
											</AlertDialogTitle>

											<AlertDialogDescription>
												This permanently deletes all {tasks.length} archived{" "}
												{tasks.length === 1 ? "task" : "tasks"} and their
												comments. This action cannot be undone.
											</AlertDialogDescription>
										</AlertDialogHeader>

										<form action={deleteAllAction}>
											<AlertDialogFooter>
												<AlertDialogCancel asChild>
													<Button type="button" variant="outline">
														Cancel
													</Button>
												</AlertDialogCancel>

												<Button type="submit" variant="destructive">
													Delete all permanently
												</Button>
											</AlertDialogFooter>
										</form>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
