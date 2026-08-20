"use client";

import { Feedback } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useRouter, useSearchParams } from "next/navigation";
import {
	useEffect,
	useMemo,
	useOptimistic,
	useRef,
	useState,
	useTransition,
} from "react";

import {
	BoardStoreProvider,
	useBoardStore,
} from "@/components/board-store-provider";
import { CreateStageButton } from "@/components/create-stage-button";
import { StageColumn } from "@/components/stage-column";
import { TaskBulkToolbar } from "@/components/task-bulk-toolbar";
import { TaskFilterControls } from "@/components/task-filter-controls";
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
import type { ProjectLabel } from "@/lib/db/schema";
import {
	hasTaskFilters,
	matchesTaskFilters,
	parseTaskFilters,
} from "@/lib/task-filters";
import type { BoardMutationResult } from "@/types/board";
import type { AssignmentCandidate } from "@/types/member";
import type { StageWithTasks } from "@/types/stage";

type KanbanBoardProps = {
	projectId: string;
	stages: StageWithTasks[];
	labelCandidates: ProjectLabel[];
	assigneeCandidates: AssignmentCandidate[];
	permissions: ProjectPermissions;
	currentUserId: string;
	isProjectOwner: boolean;
};

type KanbanBoardContentProps = {
	projectId: string;
	labelCandidates: ProjectLabel[];
	assigneeCandidates: AssignmentCandidate[];
	permissions: ProjectPermissions;
	currentUserId: string;
	isProjectOwner: boolean;
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
	labelCandidates,
	assigneeCandidates,
	permissions,
	currentUserId,
	isProjectOwner,
}: KanbanBoardContentProps) {
	const router = useRouter();

	const searchParams = useSearchParams();

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

	const [isBoardSavePending, startBoardTransition] = useTransition();

	const [boardError, setBoardError] = useState<string>();

	const [selectionMode, setSelectionMode] = useState(false);

	const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
		() => new Set(),
	);

	const dragSnapshotRef = useRef<StageWithTasks[] | null>(null);

	const dragPreviewRef = useRef<StageWithTasks[] | null>(null);

	const lastOverIdRef = useRef<string | null>(null);

	const renderedStages = dragPreviewStages ?? optimisticStages;

	const filters = useMemo(
		() =>
			parseTaskFilters(
				searchParams,

				labelCandidates.map((label) => label.id),

				assigneeCandidates.map((assignee) => assignee.id),
			),

		[searchParams, labelCandidates, assigneeCandidates],
	);

	const taskFiltersActive = hasTaskFilters(filters);

	const totalTaskCount = useMemo(
		() =>
			renderedStages.reduce((total, stage) => total + stage.tasks.length, 0),

		[renderedStages],
	);

	const visibleStages = useMemo(() => {
		if (!taskFiltersActive) {
			return renderedStages;
		}

		return renderedStages.map((stage) => ({
			...stage,

			tasks: stage.tasks.filter((task) => matchesTaskFilters(task, filters)),
		}));
	}, [renderedStages, filters, taskFiltersActive]);

	const visibleTaskCount = useMemo(
		() => visibleStages.reduce((total, stage) => total + stage.tasks.length, 0),

		[visibleStages],
	);

	const totalTaskCountByStageId = useMemo(
		() =>
			new Map(renderedStages.map((stage) => [stage.id, stage.tasks.length])),

		[renderedStages],
	);

	const visibleTaskIds = useMemo(
		() => visibleStages.flatMap((stage) => stage.tasks.map((task) => task.id)),

		[visibleStages],
	);

	const selectedTaskIdsInBoardOrder = useMemo(
		() =>
			renderedStages.flatMap((stage) =>
				stage.tasks
					.filter((task) => selectedTaskIds.has(task.id))
					.map((task) => task.id),
			),

		[renderedStages, selectedTaskIds],
	);

	useEffect(() => {
		const visibleTaskIdSet = new Set(visibleTaskIds);

		setSelectedTaskIds((current) => {
			const next = new Set(
				[...current].filter((taskId) => visibleTaskIdSet.has(taskId)),
			);

			if (next.size === current.size) {
				return current;
			}

			return next;
		});
	}, [visibleTaskIds]);

	function toggleSelectionMode() {
		setSelectionMode((current) => {
			if (current) {
				setSelectedTaskIds(new Set());
			}

			return !current;
		});
	}

	function toggleTaskSelection(taskId: string) {
		setSelectedTaskIds((current) => {
			const next = new Set(current);

			if (next.has(taskId)) {
				next.delete(taskId);
			} else {
				next.add(taskId);
			}

			return next;
		});
	}

	function selectVisibleTasks() {
		setSelectedTaskIds((current) => {
			const next = new Set(current);

			for (const taskId of visibleTaskIds) {
				next.add(taskId);
			}

			return next;
		});
	}

	function clearSelection() {
		setSelectedTaskIds(new Set());
	}

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

					router.refresh();

					return;
				}

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
		<div className="space-y-3">
			<div className="flex flex-col gap-3 xl:flex-row xl:items-center">
				<div className="min-w-0 flex-1">
					<TaskFilterControls
						filters={filters}
						labelCandidates={labelCandidates}
						assigneeCandidates={assigneeCandidates}
						canManageTasks={permissions.canManageTasks}
						selectionMode={selectionMode}
						onToggleSelectionMode={toggleSelectionMode}
					/>
				</div>
			</div>

			{boardError && (
				<p aria-live="polite" className="px-1 text-xs text-destructive">
					{boardError}
				</p>
			)}

			<DragDropProvider
				plugins={(defaults) => [
					...defaults,

					Feedback.configure({
						dropAnimation: null,
					}),
				]}
				onDragStart={(event) => {
					const { source } = event.operation;

					if (
						(taskFiltersActive || selectionMode) &&
						source?.type === BOARD_DND_TYPES.task
					) {
						return;
					}

					if (source?.type !== BOARD_DND_TYPES.task) {
						return;
					}

					dragSnapshotRef.current = optimisticStages;

					dragPreviewRef.current = optimisticStages;

					setDragPreviewStages(optimisticStages);

					lastOverIdRef.current = null;
				}}
				onDragOver={(event) => {
					const { source, target } = event.operation;

					if (
						taskFiltersActive ||
						selectionMode ||
						source?.type !== BOARD_DND_TYPES.task ||
						!target
					) {
						return;
					}

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

						queueMicrotask(() => {
							runOptimisticBoardAction(nextStages, () =>
								reorderStage(stageId, source.index),
							);
						});

						return;
					}

					if (source.type !== BOARD_DND_TYPES.task) {
						clearTaskDragPreview();

						return;
					}

					if (taskFiltersActive || selectionMode) {
						clearTaskDragPreview();

						return;
					}

					const taskId = getTaskIdFromDndId(source.id);

					if (!taskId) {
						clearTaskDragPreview();

						return;
					}

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

					const targetStageId = finalLocation.stageId;

					const targetIndex = finalLocation.index;

					queueMicrotask(() => {
						runOptimisticBoardAction(finalStages, () =>
							moveTaskOnBoard(taskId, targetStageId, targetIndex),
						);

						clearTaskDragPreview();
					});
				}}
			>
				<div className="space-y-2">
					<p className="px-1 text-sm text-muted-foreground">
						{taskFiltersActive
							? `${visibleTaskCount} of ${totalTaskCount} ${
									totalTaskCount === 1 ? "task" : "tasks"
								} shown`
							: `${totalTaskCount} ${totalTaskCount === 1 ? "task" : "tasks"}`}
					</p>

					{selectionMode && (
						<TaskBulkToolbar
							projectId={projectId}
							stages={renderedStages.map((stage) => ({
								id: stage.id,
								name: stage.name,
							}))}
							labelCandidates={labelCandidates}
							assigneeCandidates={assigneeCandidates}
							selectedTaskIds={selectedTaskIdsInBoardOrder}
							visibleTaskIds={visibleTaskIds}
							onSelectVisible={selectVisibleTasks}
							onClearSelection={clearSelection}
						/>
					)}

					<div className="flex min-h-[calc(100vh-22rem)] items-start gap-4 overflow-x-auto pb-4">
						{visibleStages.map((stage, index) => (
							<StageColumn
								key={stage.id}
								stage={stage}
								index={index}
								labelCandidates={labelCandidates}
								assigneeCandidates={assigneeCandidates}
								permissions={permissions}
								currentUserId={currentUserId}
								isProjectOwner={isProjectOwner}
								isBoardSavePending={isBoardSavePending}
								isTaskFilteringActive={taskFiltersActive}
								totalTaskCount={
									totalTaskCountByStageId.get(stage.id) ?? stage.tasks.length
								}
								selectionMode={selectionMode}
								selectedTaskIds={selectedTaskIds}
								onToggleTaskSelection={toggleTaskSelection}
							/>
						))}

						{permissions.canManageStages && (
							<CreateStageButton projectId={projectId} />
						)}
					</div>
				</div>
			</DragDropProvider>
		</div>
	);
}

export function KanbanBoard({
	projectId,
	stages,
	labelCandidates,
	assigneeCandidates,
	permissions,
	currentUserId,
	isProjectOwner,
}: KanbanBoardProps) {
	return (
		<BoardStoreProvider key={projectId} serverStages={stages}>
			<KanbanBoardContent
				projectId={projectId}
				labelCandidates={labelCandidates}
				assigneeCandidates={assigneeCandidates}
				permissions={permissions}
				currentUserId={currentUserId}
				isProjectOwner={isProjectOwner}
			/>
		</BoardStoreProvider>
	);
}
