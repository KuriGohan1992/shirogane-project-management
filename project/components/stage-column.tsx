"use client";

import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical } from "lucide-react";

import { CreateTaskButton } from "@/components/create-task-button";
import { StageActions } from "@/components/stage-actions";
import { TaskCard } from "@/components/task-card";
import type { ProjectPermissions } from "@/lib/auth/project-permissions";
import {
	BOARD_DND_TYPES,
	getStageDndId,
	getStageTaskDropZoneDndId,
} from "@/lib/board/dnd";
import { cn } from "@/lib/utils";
import type { AssignmentCandidate } from "@/types/member";
import type { StageWithTasks } from "@/types/stage";

type StageColumnProps = {
	stage: StageWithTasks;
	index: number;
	canMoveLeft: boolean;
	canMoveRight: boolean;
	assigneeCandidates: AssignmentCandidate[];
	permissions: ProjectPermissions;
};

export function StageColumn({
	stage,
	index,
	canMoveLeft,
	canMoveRight,
	assigneeCandidates,
	permissions,
}: StageColumnProps) {
	const stageDragDisabled = !permissions.canManageStages;

	const taskDragDisabled = !permissions.canManageTasks;

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
			<div className="flex items-center gap-2 border-b border-border px-4 py-3">
				{permissions.canManageStages && (
					<button
						ref={stageSortable.handleRef}
						type="button"
						disabled={stageDragDisabled}
						aria-label={`Drag ${stage.name} stage`}
						className="flex size-6 shrink-0 touch-none cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50 active:cursor-grabbing"
					>
						<GripVertical aria-hidden="true" size={15} />
					</button>
				)}

				<h3 className="min-w-0 flex-1 truncate font-semibold text-foreground">
					{stage.name}
				</h3>

				<span className="shrink-0 rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
					{stage.tasks.length}
				</span>

				{permissions.canManageStages && (
					<StageActions
						stage={{
							id: stage.id,
							name: stage.name,
						}}
						canMoveLeft={canMoveLeft}
						canMoveRight={canMoveRight}
					/>
				)}
			</div>

			<div
				ref={taskDropZone.ref}
				className={cn(
					"space-y-3 p-3 transition-colors",
					taskDropZone.isDropTarget && "bg-primary/5",
				)}
			>
				{stage.tasks.length === 0 ? (
					<div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border px-4 text-center">
						<p className="text-xs text-muted-foreground">
							No tasks in this stage.
						</p>
					</div>
				) : (
					stage.tasks.map((task, taskIndex) => (
						<TaskCard
							key={task.id}
							task={task}
							index={taskIndex}
							stageId={stage.id}
							assigneeCandidates={assigneeCandidates}
							permissions={permissions}
						/>
					))
				)}

				{permissions.canManageTasks && (
					<CreateTaskButton stageId={stage.id} stageName={stage.name} />
				)}
			</div>
		</section>
	);
}
