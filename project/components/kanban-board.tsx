"use client";

import { Feedback } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useRouter } from "next/navigation";
import { useOptimistic, useRef, useState, useTransition } from "react";
import {
	BoardStoreProvider,
	useBoardStore,
} from "@/components/board-store-provider";
import { CreateStageButton } from "@/components/create-stage-button";
import { StageColumn } from "@/components/stage-column";
import { reorderStage } from "@/lib/actions/stages";
import { moveTaskOnBoard } from "@/lib/actions/tasks";
import type { ProjectPermissions } from "@/lib/auth/project-permissions";
import { moveTaskInBoard, reorderStageInBoard } from "@/lib/board/board-order";
import {
	BOARD_DND_TYPES,
	getStageIdFromDndId,
	getStageIdFromTaskDropZoneDndId,
	getTaskIdFromDndId,
} from "@/lib/board/dnd";
import type { BoardMutationResult } from "@/types/board";
import type { AssignmentCandidate } from "@/types/member";
import type { StageWithTasks } from "@/types/stage";

type KanbanBoardProps = {
	projectId: string;
	stages: StageWithTasks[];
	assigneeCandidates: AssignmentCandidate[];
	permissions: ProjectPermissions;
};

type KanbanBoardContentProps = {
	projectId: string;
	assigneeCandidates: AssignmentCandidate[];
	permissions: ProjectPermissions;
};

type TaskLocation = {
	stageId: string;
	index: number;
};

type QueuedBoardResult =
	| {
			status: "success";
			result: BoardMutationResult;
	  }
	| {
			status: "failed";
			result: BoardMutationResult;
	  }
	| {
			status: "skipped";
	  };

function findTaskLocation(
	stages: StageWithTasks[],
	taskId: string,
): TaskLocation | undefined {
	for (const stage of stages) {
		const index = stage.tasks.findIndex((task) => task.id === taskId);

		if (index !== -1) {
			return {
				stageId: stage.id,
				index,
			};
		}
	}

	return undefined;
}

function KanbanBoardContent({
	projectId,
	assigneeCandidates,
	permissions,
}: KanbanBoardContentProps) {
	const router = useRouter();

	const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

	const queueGenerationRef = useRef(0);
	const stages = useBoardStore((state) => state.stages);

	const syncStages = useBoardStore((state) => state.syncStages);

	const [optimisticStages, setOptimisticStages] = useOptimistic(
		stages,
		(_currentStages, nextStages: StageWithTasks[]) => nextStages,
	);

	const [dragPreviewStages, setDragPreviewStages] = useState<
		StageWithTasks[] | null
	>(null);

	const [, startBoardTransition] = useTransition();

	const [boardError, setBoardError] = useState<string>();

	/*
	 * The Board as it looked when the current
	 * Task drag began.
	 *
	 * We keep this so Escape/cancel can return
	 * to exactly the pre-drag arrangement.
	 */
	const dragSnapshotRef = useRef<StageWithTasks[] | null>(null);

	/*
	 * Unlike React state, a ref is immediately
	 * readable after we update it.
	 *
	 * This lets onDragEnd reliably get the
	 * latest drag preview even if React has not
	 * completed its newest render yet.
	 */
	const dragPreviewRef = useRef<StageWithTasks[] | null>(null);

	/*
	 * onDragOver fires many times while the
	 * pointer remains above the same element.
	 *
	 * Remembering the last target prevents the
	 * same movement from being applied over and
	 * over again.
	 */
	const lastOverIdRef = useRef<string | null>(null);

	const renderedStages = dragPreviewStages ?? optimisticStages;

	function clearTaskDragPreview() {
		dragPreviewRef.current = null;
		dragSnapshotRef.current = null;
		lastOverIdRef.current = null;

		setDragPreviewStages(null);
	}
	function enqueueBoardAction(
		action: () => Promise<BoardMutationResult>,
	): Promise<QueuedBoardResult> {
		const generation = queueGenerationRef.current;

		const queuedAction = saveQueueRef.current.then(async () => {
			/*
			 * A previous save failed.
			 *
			 * Any movements queued after that
			 * failed save were calculated from
			 * a Board state the database never
			 * reached, so don't send them.
			 */
			if (generation !== queueGenerationRef.current) {
				return {
					status: "skipped",
				} as const;
			}

			try {
				const result = await action();

				if (!result.success) {
					queueGenerationRef.current += 1;

					return {
						status: "failed",
						result,
					} as const;
				}

				return {
					status: "success",
					result,
				} as const;
			} catch (error) {
				/*
				 * Invalidate every operation that
				 * was queued based on this now-
				 * invalid client Board.
				 */
				queueGenerationRef.current += 1;

				throw error;
			}
		});

		saveQueueRef.current = queuedAction.then(
			() => undefined,
			() => undefined,
		);

		return queuedAction;
	}
	function runOptimisticBoardAction(
		nextStages: StageWithTasks[],
		action: () => Promise<BoardMutationResult>,
	) {
		startBoardTransition(async () => {
			setBoardError(undefined);

			/*
			 * Show the movement immediately.
			 *
			 * We do NOT wait for the queued
			 * database operation.
			 */
			setOptimisticStages(nextStages);

			try {
				const queuedResult = await enqueueBoardAction(action);

				if (queuedResult.status === "skipped") {
					return;
				}

				if (queuedResult.status === "failed") {
					setBoardError(
						queuedResult.result.message ?? "Could not save the board changes.",
					);

					/*
					 * A failed movement means later
					 * local movements may have been
					 * calculated from an invalid Board.
					 *
					 * Re-fetch Neon and make the
					 * database authoritative again.
					 */
					router.refresh();

					return;
				}

				/*
				 * This particular operation has now
				 * successfully reached Neon.
				 *
				 * Promote its Board snapshot into
				 * Zustand's confirmed/base state.
				 */
				syncStages(nextStages);
			} catch (error) {
				console.error("Failed to save board movement:", error);

				setBoardError(
					"Could not save the board changes. The board was refreshed.",
				);

				router.refresh();
			}
		});
	}

	return (
		<div className="space-y-2">
			<div className="flex min-h-5 items-center px-1">
				{boardError && (
					<p aria-live="polite" className="text-xs text-destructive">
						{boardError}
					</p>
				)}
			</div>

			<DragDropProvider
				plugins={(defaults) => [
					...defaults,
					Feedback.configure({
						dropAnimation: null,
					}),
				]}
				onDragStart={(event) => {
					const { source } = event.operation;

					if (source?.type !== BOARD_DND_TYPES.task) {
						return;
					}

					/*
					 * Zustand is still our confirmed
					 * Board. This separate preview is
					 * just for the current drag.
					 */
					dragSnapshotRef.current = optimisticStages;

					dragPreviewRef.current = optimisticStages;

					setDragPreviewStages(optimisticStages);

					lastOverIdRef.current = null;
				}}
				onDragOver={(event) => {
					const { source, target } = event.operation;

					if (source?.type !== BOARD_DND_TYPES.task || !target) {
						return;
					}

					/*
					 * IMPORTANT:
					 *
					 * Stop dnd-kit's
					 * OptimisticSortingPlugin from
					 * physically moving Task DOM
					 * nodes between Stage columns.
					 *
					 * React will control the Task
					 * preview instead.
					 */
					event.preventDefault();

					const taskId = getTaskIdFromDndId(source.id);

					if (!taskId) {
						return;
					}

					const targetId = String(target.id);

					if (lastOverIdRef.current === targetId) {
						return;
					}

					lastOverIdRef.current = targetId;

					setDragPreviewStages((currentPreview) => {
						const currentStages =
							currentPreview ?? dragSnapshotRef.current ?? optimisticStages;

						let targetStageId: string | undefined;

						let targetIndex: number | undefined;

						/*
						 * Case 1:
						 * Pointer is over the
						 * Stage's general Task
						 * drop area.
						 *
						 * This is also what lets
						 * us drop into an empty
						 * Stage.
						 */
						const dropZoneStageId = getStageIdFromTaskDropZoneDndId(target.id);

						if (dropZoneStageId) {
							const targetStage = currentStages.find(
								(stage) => stage.id === dropZoneStageId,
							);

							if (!targetStage) {
								return currentStages;
							}

							targetStageId = targetStage.id;

							targetIndex = targetStage.tasks.length;
						} else {
							/*
							 * Case 2:
							 * Pointer is over
							 * another Task.
							 */
							const targetTaskId = getTaskIdFromDndId(target.id);

							if (!targetTaskId) {
								return currentStages;
							}

							const targetStage = currentStages.find((stage) =>
								stage.tasks.some((task) => task.id === targetTaskId),
							);

							if (!targetStage) {
								return currentStages;
							}

							const foundTargetIndex = targetStage.tasks.findIndex(
								(task) => task.id === targetTaskId,
							);

							if (foundTargetIndex === -1) {
								return currentStages;
							}

							targetStageId = targetStage.id;

							targetIndex = foundTargetIndex;
						}

						if (targetStageId === undefined || targetIndex === undefined) {
							return currentStages;
						}

						const nextStages = moveTaskInBoard(
							currentStages,
							taskId,
							targetStageId,
							targetIndex,
						);

						dragPreviewRef.current = nextStages;

						return nextStages;
					});
				}}
				onDragEnd={(event) => {
					const { source } = event.operation;

					if (!source) {
						clearTaskDragPreview();
						return;
					}

					/*
					 * STAGE DRAGGING
					 */
					if (source.type === BOARD_DND_TYPES.stage) {
						if (event.canceled || !isSortable(source)) {
							return;
						}

						const stageId = getStageIdFromDndId(source.id);

						if (!stageId || source.initialIndex === source.index) {
							return;
						}

						const nextStages = reorderStageInBoard(
							optimisticStages,
							stageId,
							source.index,
						);

						if (nextStages === optimisticStages) {
							return;
						}

						/*
						 * Let dnd-kit finish its own
						 * drag cleanup before React
						 * changes the rendered Board.
						 */
						queueMicrotask(() => {
							runOptimisticBoardAction(nextStages, () =>
								reorderStage(stageId, source.index),
							);
						});

						return;
					}

					/*
					 * TASK DRAGGING
					 */
					if (source.type !== BOARD_DND_TYPES.task) {
						clearTaskDragPreview();
						return;
					}

					const taskId = getTaskIdFromDndId(source.id);

					if (!taskId) {
						clearTaskDragPreview();
						return;
					}

					/*
					 * Escape / canceled drag:
					 *
					 * Absolutely no Server Action.
					 * Absolutely no Zustand update.
					 *
					 * Throw the preview away and the
					 * confirmed Board becomes visible
					 * again.
					 */
					if (event.canceled) {
						clearTaskDragPreview();
						return;
					}

					const originalStages = dragSnapshotRef.current ?? optimisticStages;

					const finalStages = dragPreviewRef.current ?? optimisticStages;

					const originalLocation = findTaskLocation(originalStages, taskId);

					const finalLocation = findTaskLocation(finalStages, taskId);

					if (!originalLocation || !finalLocation) {
						clearTaskDragPreview();
						return;
					}

					const didMove =
						originalLocation.stageId !== finalLocation.stageId ||
						originalLocation.index !== finalLocation.index;

					if (!didMove) {
						clearTaskDragPreview();
						return;
					}

					/*
					 * Save these before clearing the
					 * refs below.
					 */
					const targetStageId = finalLocation.stageId;

					const targetIndex = finalLocation.index;

					/*
					 * dnd-kit is still finishing its
					 * internal drag lifecycle while
					 * onDragEnd runs.
					 *
					 * Defer the React optimistic
					 * update until that synchronous
					 * cleanup has completed.
					 */
					queueMicrotask(() => {
						runOptimisticBoardAction(finalStages, () =>
							moveTaskOnBoard(taskId, targetStageId, targetIndex),
						);

						clearTaskDragPreview();
					});
				}}
			>
				<div className="flex min-h-[calc(100vh-22rem)] items-start gap-4 overflow-x-auto pb-4">
					{renderedStages.map((stage, index) => (
						<StageColumn
							key={stage.id}
							stage={stage}
							index={index}
							canMoveLeft={index > 0}
							canMoveRight={index < renderedStages.length - 1}
							assigneeCandidates={assigneeCandidates}
							permissions={permissions}
						/>
					))}

					{permissions.canManageStages && (
						<CreateStageButton projectId={projectId} />
					)}
				</div>
			</DragDropProvider>
		</div>
	);
}

export function KanbanBoard({
	projectId,
	stages,
	assigneeCandidates,
	permissions,
}: KanbanBoardProps) {
	return (
		<BoardStoreProvider key={projectId} serverStages={stages}>
			<KanbanBoardContent
				projectId={projectId}
				assigneeCandidates={assigneeCandidates}
				permissions={permissions}
			/>
		</BoardStoreProvider>
	);
}
