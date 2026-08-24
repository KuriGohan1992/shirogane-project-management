import {
	Archive,
	Check,
	CircleCheckBig,
	Flag,
	MoveRight,
	RotateCcw,
	Tag,
	Trash2,
	UserPlus,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
	AlertDialog,
	AlertDialogAction,
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import {
	bulkAddTaskLabel,
	bulkArchiveTasks,
	bulkAssignTasks,
	bulkDeleteTasks,
	bulkMoveTasks,
	bulkRemoveTaskLabel,
	bulkSetTaskPriority,
	bulkSetTasksCompletedState,
	bulkUnassignTasks,
} from "@/lib/actions/task-bulk";
import { getColorHex } from "@/lib/constants/colors";
import type { ProjectLabel, Stage, Task } from "@/lib/db/schema";
import type { BoardMutationResult } from "@/types/board";
import type { AssignmentCandidate } from "@/types/member";
import {
	AssigneeCandidateIdentity,
	AssigneeCandidateList,
} from "./assignee-candidate-list";

type TaskBulkToolbarProps = {
	projectId: string;
	stages: Pick<Stage, "id" | "name">[];
	labelCandidates: ProjectLabel[];
	assigneeCandidates: AssignmentCandidate[];
	selectedTaskIds: string[];
	visibleTaskIds: string[];
	onSelectVisible: () => void;
	onClearSelection: () => void;
	archiveDialogOpen: boolean;
	onArchiveDialogOpenChange: (open: boolean) => void;
	deleteDialogOpen: boolean;
	onDeleteDialogOpenChange: (open: boolean) => void;
};

type PriorityValue = NonNullable<Task["priority"]> | null;

const PRIORITY_OPTIONS: Array<{
	value: PriorityValue;
	label: string;
}> = [
	{
		value: null,
		label: "No priority",
	},
	{
		value: "low",
		label: "Low",
	},
	{
		value: "medium",
		label: "Medium",
	},
	{
		value: "high",
		label: "High",
	},
	{
		value: "urgent",
		label: "Urgent",
	},
];

export function TaskBulkToolbar({
	projectId,
	stages,
	labelCandidates,
	assigneeCandidates,
	selectedTaskIds,
	visibleTaskIds,
	onSelectVisible,
	onClearSelection,
	archiveDialogOpen,
	onArchiveDialogOpenChange,
	deleteDialogOpen,
	onDeleteDialogOpenChange,
}: TaskBulkToolbarProps) {
	const router = useRouter();

	const [isPending, startTransition] = useTransition();

	const selectedTaskIdSet = new Set(selectedTaskIds);

	const allVisibleSelected =
		visibleTaskIds.length > 0 &&
		visibleTaskIds.every((taskId) => selectedTaskIdSet.has(taskId));

	const hasSelection = selectedTaskIds.length > 0;

	function runMutation(action: () => Promise<BoardMutationResult>) {
		if (!hasSelection || isPending) {
			return;
		}

		startTransition(async () => {
			const result = await action();

			if (!result.success) {
				console.error(
					result.message ?? "The selected tasks could not be updated.",
				);

				return;
			}

			router.refresh();
		});
	}

	return (
		<div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2">
			<div className="flex flex-wrap items-center gap-2">
				<span className="text-sm font-semibold text-foreground">
					{isPending ? "Updating..." : `${selectedTaskIds.length} selected`}
				</span>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={
						visibleTaskIds.length === 0 || allVisibleSelected || isPending
					}
					onClick={onSelectVisible}
				>
					<Check aria-hidden="true" className="size-4" />
					Select visible
				</Button>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={!hasSelection || isPending}
					onClick={onClearSelection}
				>
					<X aria-hidden="true" className="size-4" />
					Clear selection
				</Button>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<Popover>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!hasSelection || isPending}
						>
							<CircleCheckBig aria-hidden="true" className="size-4" />
							Completion
						</Button>
					</PopoverTrigger>

					<PopoverContent align="end" className="w-48 p-2">
						<p className="px-2 pb-1 pt-1 text-xs font-semibold text-muted-foreground">
							Set completion
						</p>

						<button
							type="button"
							disabled={isPending}
							onClick={() =>
								runMutation(() =>
									bulkSetTasksCompletedState(projectId, selectedTaskIds, true),
								)
							}
							className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50"
						>
							<CircleCheckBig aria-hidden="true" className="size-4" />
							Mark complete
						</button>

						<button
							type="button"
							disabled={isPending}
							onClick={() =>
								runMutation(() =>
									bulkSetTasksCompletedState(projectId, selectedTaskIds, false),
								)
							}
							className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50"
						>
							<RotateCcw aria-hidden="true" className="size-4" />
							Reopen
						</button>
					</PopoverContent>
				</Popover>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!hasSelection || isPending}
						>
							<MoveRight aria-hidden="true" className="size-4" />
							Move
						</Button>
					</PopoverTrigger>

					<PopoverContent align="end" className="w-56 p-2">
						<p className="px-2 pb-1 pt-1 text-xs font-semibold text-muted-foreground">
							Move to stage
						</p>

						{stages.map((stage) => (
							<button
								key={stage.id}
								type="button"
								disabled={isPending}
								onClick={() =>
									runMutation(() =>
										bulkMoveTasks(projectId, selectedTaskIds, stage.id),
									)
								}
								className="flex w-full items-center rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50"
							>
								{stage.name}
							</button>
						))}
					</PopoverContent>
				</Popover>

				<Popover>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!hasSelection || isPending}
						>
							<Flag aria-hidden="true" className="size-4" />
							Priority
						</Button>
					</PopoverTrigger>

					<PopoverContent align="end" className="w-48 p-2">
						<p className="px-2 pb-1 pt-1 text-xs font-semibold text-muted-foreground">
							Set priority
						</p>

						{PRIORITY_OPTIONS.map((option) => (
							<button
								key={option.label}
								type="button"
								disabled={isPending}
								onClick={() =>
									runMutation(() =>
										bulkSetTaskPriority(
											projectId,
											selectedTaskIds,
											option.value,
										),
									)
								}
								className="flex w-full items-center rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50"
							>
								{option.label}
							</button>
						))}
					</PopoverContent>
				</Popover>

				<Popover>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!hasSelection || isPending}
						>
							<UserPlus aria-hidden="true" className="size-4" />
							Assignee
						</Button>
					</PopoverTrigger>

					<PopoverContent align="end" className="w-80 p-2">
						<AssigneeCandidateList
							candidates={assigneeCandidates}
							renderCandidate={(assignee) => (
								<div className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
									<AssigneeCandidateIdentity
										candidate={assignee}
										compact
										showEmail={false}
									/>

									<Button
										type="button"
										variant="ghost"
										size="xs"
										disabled={isPending}
										onClick={() =>
											runMutation(() =>
												bulkAssignTasks(
													projectId,
													selectedTaskIds,
													assignee.id,
												),
											)
										}
									>
										Add
									</Button>

									{assignee.source === "project" && (
										<Button
											type="button"
											variant="ghost"
											size="xs"
											disabled={isPending}
											onClick={() =>
												runMutation(() =>
													bulkUnassignTasks(
														projectId,
														selectedTaskIds,
														assignee.id,
													),
												)
											}
										>
											Remove
										</Button>
									)}
								</div>
							)}
						/>
					</PopoverContent>
				</Popover>

				<Popover>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!hasSelection || isPending}
						>
							<Tag aria-hidden="true" className="size-4" />
							Label
						</Button>
					</PopoverTrigger>

					<PopoverContent align="end" className="w-72 p-2">
						<div className="px-2 pb-2 pt-1">
							<p className="text-xs font-semibold text-muted-foreground">
								Labels
							</p>
						</div>

						{labelCandidates.length === 0 ? (
							<p className="px-2 py-3 text-sm text-muted-foreground">
								No project labels yet.
							</p>
						) : (
							<div className="max-h-72 space-y-1 overflow-y-auto">
								{labelCandidates.map((label) => (
									<div
										key={label.id}
										className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted"
									>
										<span
											aria-hidden="true"
											className="size-2.5 shrink-0 rounded-full"
											style={{
												backgroundColor: getColorHex(label.color),
											}}
										/>

										<span className="min-w-0 flex-1 truncate text-sm font-medium">
											{label.name}
										</span>

										<Button
											type="button"
											variant="ghost"
											size="xs"
											disabled={isPending}
											onClick={() =>
												runMutation(() =>
													bulkAddTaskLabel(
														projectId,
														selectedTaskIds,
														label.id,
													),
												)
											}
										>
											Add
										</Button>

										<Button
											type="button"
											variant="ghost"
											size="xs"
											disabled={isPending}
											onClick={() =>
												runMutation(() =>
													bulkRemoveTaskLabel(
														projectId,
														selectedTaskIds,
														label.id,
													),
												)
											}
										>
											Remove
										</Button>
									</div>
								))}
							</div>
						)}
					</PopoverContent>
				</Popover>

				<AlertDialog
					open={archiveDialogOpen}
					onOpenChange={onArchiveDialogOpenChange}
				>
					<AlertDialogTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!hasSelection || isPending}
						>
							<Archive aria-hidden="true" className="size-4" />
							Archive
						</Button>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Archive {selectedTaskIds.length} selected{" "}
								{selectedTaskIds.length === 1 ? "task" : "tasks"}?
							</AlertDialogTitle>

							<AlertDialogDescription>
								The selected tasks will leave the active board and can be
								restored later from Archived tasks.
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

							<AlertDialogAction
								variant="destructive"
								disabled={isPending}
								onClick={() =>
									runMutation(() =>
										bulkArchiveTasks(projectId, selectedTaskIds),
									)
								}
							>
								Archive tasks
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<AlertDialog
					open={deleteDialogOpen}
					onOpenChange={onDeleteDialogOpenChange}
				>
					<AlertDialogTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!hasSelection || isPending}
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
						>
							<Trash2 aria-hidden="true" className="size-4" />
							Delete
						</Button>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Permanently delete {selectedTaskIds.length} selected{" "}
								{selectedTaskIds.length === 1 ? "task" : "tasks"}?
							</AlertDialogTitle>

							<AlertDialogDescription>
								This permanently deletes the selected tasks. This action cannot
								be undone. Archive them instead if you may need to restore them
								later.
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

							<AlertDialogAction
								variant="destructive"
								disabled={isPending}
								onClick={() =>
									runMutation(() => bulkDeleteTasks(projectId, selectedTaskIds))
								}
							>
								Delete permanently
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
