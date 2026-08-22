import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";

import { CreateTaskButton } from "@/components/create-task-button";
import { StageActions } from "@/components/stage-actions";
import { StageInlineName } from "@/components/stage-inline-name";
import { TaskCard } from "@/components/task-card";
import type { ProjectPermissions } from "@/lib/auth/project-permissions";
import {
	BOARD_DND_TYPES,
	getStageDndId,
	getStageTaskDropZoneDndId,
} from "@/lib/board/dnd";
import type { ProjectLabel } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import type { AssignmentCandidate } from "@/types/member";
import type { StageWithTasks } from "@/types/stage";

type StageColumnProps = {
	stage: StageWithTasks;
	index: number;
	labelCandidates: ProjectLabel[];
	assigneeCandidates: AssignmentCandidate[];
	permissions: ProjectPermissions;
	currentUserId: string;
	isProjectOwner: boolean;
	isBoardSavePending: boolean;
	isTaskFilteringActive: boolean;
	totalTaskCount: number;
	selectionMode: boolean;
	selectedTaskIds: ReadonlySet<string>;
	onToggleTaskSelection: (taskId: string) => void;
	keyboardFocusedTaskId: string | null;
};

export function StageColumn({
	stage,
	index,
	labelCandidates,
	assigneeCandidates,
	permissions,
	currentUserId,
	isProjectOwner,
	isBoardSavePending,
	isTaskFilteringActive,
	totalTaskCount,
	selectionMode,
	selectedTaskIds,
	onToggleTaskSelection,
	keyboardFocusedTaskId,
}: StageColumnProps) {
	const stageDragDisabled = !permissions.canManageStages;

	const taskDragDisabled =
		!permissions.canManageTasks || isTaskFilteringActive || selectionMode;

	const stageSortable = useSortable({
		id: getStageDndId(stage.id),
		index,
		type: BOARD_DND_TYPES.stage,
		accept: BOARD_DND_TYPES.stage,
		group: "stages",
		disabled: stageDragDisabled,
	});

	const taskDropZone = useDroppable({
		id: getStageTaskDropZoneDndId(stage.id),
		accept: BOARD_DND_TYPES.task,
		collisionPriority: CollisionPriority.Low,
		disabled: taskDragDisabled,
	});

	return (
		<section
			ref={stageSortable.ref}
			className={cn(
				"w-[min(20rem,85vw)] shrink-0 rounded-xl border border-border bg-muted/40",
				stageSortable.isDragging && "opacity-60",
			)}
		>
			<div className="relative flex min-h-14 items-center border-b border-border px-4 py-3">
				{permissions.canManageStages && (
					<div
						ref={stageSortable.handleRef}
						aria-hidden="true"
						className="absolute inset-0 z-0 touch-none select-none cursor-grab rounded-t-xl active:cursor-grabbing"
					/>
				)}

				<div className="relative z-10 flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
					<StageInlineName
						stage={{
							id: stage.id,
							name: stage.name,
						}}
						canManage={permissions.canManageStages}
						disabled={isBoardSavePending}
					/>

					<span className="pointer-events-none shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
						{isTaskFilteringActive
							? `${stage.tasks.length}/${totalTaskCount}`
							: stage.tasks.length}
					</span>
				</div>

				{permissions.canManageStages && (
					<div className="relative z-10 ml-3 shrink-0">
						<StageActions
							projectId={stage.projectId}
							stage={{
								id: stage.id,
								name: stage.name,
							}}
							isBoardSavePending={isBoardSavePending}
						/>
					</div>
				)}
			</div>

			<div
				ref={taskDropZone.ref}
				className={cn(
					"space-y-3 p-3 transition-colors",
					taskDropZone.isDropTarget && "bg-primary/10",
				)}
			>
				{stage.tasks.length === 0 ? (
					<div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border px-4 text-center">
						<p className="text-xs text-muted-foreground">
							{isTaskFilteringActive && totalTaskCount > 0
								? "No tasks match the current filters."
								: "No tasks in this stage."}
						</p>
					</div>
				) : (
					stage.tasks.map((task, taskIndex) => (
						<TaskCard
							key={task.id}
							task={task}
							index={taskIndex}
							stageId={stage.id}
							projectId={stage.projectId}
							labelCandidates={labelCandidates}
							assigneeCandidates={assigneeCandidates}
							permissions={permissions}
							currentUserId={currentUserId}
							isProjectOwner={isProjectOwner}
							dragDisabled={taskDragDisabled}
							selectionMode={selectionMode}
							selected={selectedTaskIds.has(task.id)}
							onToggleSelection={onToggleTaskSelection}
							keyboardFocused={keyboardFocusedTaskId === task.id}
						/>
					))
				)}

				{permissions.canManageTasks && (
					<CreateTaskButton
						projectId={stage.projectId}
						stageId={stage.id}
						stageName={stage.name}
						labelCandidates={labelCandidates}
						assigneeCandidates={assigneeCandidates}
					/>
				)}
			</div>
		</section>
	);
}
