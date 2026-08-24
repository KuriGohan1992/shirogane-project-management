"use client";

import { Feedback } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useRouter, useSearchParams } from "next/navigation";
import {
	useCallback,
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
	BOARD_KEYBOARD_COMMAND_EVENT,
	type BoardKeyboardCommandDetail,
} from "@/lib/keyboard-shortcuts";
import {
	hasTaskFilters,
	matchesTaskFilters,
	parseTaskFilters,
} from "@/lib/task-filters";
import { getTaskHref } from "@/lib/task-route";
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

type KeyboardTaskLocation = {
	stageIndex: number;
	taskIndex: number;
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

function findKeyboardTaskLocation(
	stages: StageWithTasks[],
	taskId: string,
): KeyboardTaskLocation | undefined {
	for (const [stageIndex, stage] of stages.entries()) {
		const taskIndex = stage.tasks.findIndex((task) => task.id === taskId);

		if (taskIndex !== -1) {
			return {
				stageIndex,
				taskIndex,
			};
		}
	}

	return undefined;
}

function getFirstVisibleTaskId(stages: StageWithTasks[]) {
	for (const stage of stages) {
		const firstTask = stage.tasks[0];

		if (firstTask) {
			return firstTask.id;
		}
	}

	return null;
}

function getVerticalKeyboardTarget(
	stages: StageWithTasks[],
	location: KeyboardTaskLocation,
	direction: -1 | 1,
) {
	const stage = stages[location.stageIndex];

	if (!stage) {
		return null;
	}

	const targetTask = stage.tasks[location.taskIndex + direction];

	return targetTask?.id ?? stage.tasks[location.taskIndex]?.id ?? null;
}

function getHorizontalKeyboardTarget(
	stages: StageWithTasks[],
	location: KeyboardTaskLocation,
	direction: -1 | 1,
) {
	for (
		let stageIndex = location.stageIndex + direction;
		stageIndex >= 0 && stageIndex < stages.length;
		stageIndex += direction
	) {
		const stage = stages[stageIndex];

		if (!stage || stage.tasks.length === 0) {
			continue;
		}

		const targetTaskIndex = Math.min(
			location.taskIndex,
			stage.tasks.length - 1,
		);

		return stage.tasks[targetTaskIndex]?.id ?? null;
	}

	return stages[location.stageIndex]?.tasks[location.taskIndex]?.id ?? null;
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

	const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);

	const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const dragSnapshotRef = useRef<StageWithTasks[] | null>(null);

	const dragPreviewRef = useRef<StageWithTasks[] | null>(null);

	const lastOverIdRef = useRef<string | null>(null);

	const renderedStages = dragPreviewStages ?? optimisticStages;

	const projectAssigneeCandidates = useMemo(
		() =>
			assigneeCandidates.filter(
				(candidate) => !candidate.needsProjectMembership,
			),
		[assigneeCandidates],
	);

	const filters = useMemo(
		() =>
			parseTaskFilters(
				searchParams,

				labelCandidates.map((label) => label.id),

				projectAssigneeCandidates.map((assignee) => assignee.id),
			),

		[searchParams, labelCandidates, projectAssigneeCandidates],
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

	useEffect(() => {
		if (!focusedTaskId) {
			return;
		}

		if (visibleTaskIds.includes(focusedTaskId)) {
			return;
		}

		setFocusedTaskId(getFirstVisibleTaskId(visibleStages));
	}, [focusedTaskId, visibleStages, visibleTaskIds]);

	useEffect(() => {
		if (!focusedTaskId) {
			return;
		}

		const frameId = window.requestAnimationFrame(() => {
			const taskElement = document.getElementById(
				`board-task-${focusedTaskId}`,
			);

			taskElement?.scrollIntoView({
				block: "nearest",
				inline: "nearest",
			});
		});

		return () => {
			window.cancelAnimationFrame(frameId);
		};
	}, [focusedTaskId]);

	const toggleSelectionMode = useCallback(() => {
		if (!permissions.canManageTasks) {
			return;
		}

		setSelectionMode((current) => {
			if (current) {
				setSelectedTaskIds(new Set());
				setArchiveDialogOpen(false);
				setDeleteDialogOpen(false);
			} else if (!focusedTaskId) {
				setFocusedTaskId(getFirstVisibleTaskId(visibleStages));
			}

			return !current;
		});
	}, [focusedTaskId, permissions.canManageTasks, visibleStages]);

	const toggleTaskSelection = useCallback((taskId: string) => {
		setSelectedTaskIds((current) => {
			const next = new Set(current);

			if (next.has(taskId)) {
				next.delete(taskId);
			} else {
				next.add(taskId);
			}

			return next;
		});
	}, []);

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

	const moveKeyboardFocus = useCallback(
		(direction: "left" | "right" | "up" | "down") => {
			setFocusedTaskId((currentTaskId) => {
				const firstTaskId = getFirstVisibleTaskId(visibleStages);

				if (!currentTaskId) {
					return firstTaskId;
				}

				const location = findKeyboardTaskLocation(visibleStages, currentTaskId);

				if (!location) {
					return firstTaskId;
				}

				if (direction === "up") {
					return getVerticalKeyboardTarget(visibleStages, location, -1);
				}

				if (direction === "down") {
					return getVerticalKeyboardTarget(visibleStages, location, 1);
				}

				if (direction === "left") {
					return getHorizontalKeyboardTarget(visibleStages, location, -1);
				}

				return getHorizontalKeyboardTarget(visibleStages, location, 1);
			});
		},
		[visibleStages],
	);

	const openFocusedTask = useCallback(() => {
		if (!focusedTaskId) {
			return;
		}

		for (const stage of visibleStages) {
			const task = stage.tasks.find(
				(candidate) => candidate.id === focusedTaskId,
			);

			if (!task) {
				continue;
			}

			router.push(getTaskHref(projectId, task.id, task.title));
			return;
		}
	}, [focusedTaskId, projectId, router, visibleStages]);

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

	useEffect(() => {
		function handleBoardKeyboardCommand(event: Event) {
			const keyboardEvent = event as CustomEvent<BoardKeyboardCommandDetail>;

			const command = keyboardEvent.detail?.command;

			if (!command) {
				return;
			}

			if (command === "left" || command === "right") {
				if (visibleTaskIds.length === 0) {
					return;
				}

				keyboardEvent.preventDefault();
				moveKeyboardFocus(command);
				return;
			}

			if (command === "up" || command === "down") {
				if (visibleTaskIds.length === 0) {
					return;
				}

				keyboardEvent.preventDefault();
				moveKeyboardFocus(command);
				return;
			}

			if (command === "open") {
				if (!focusedTaskId) {
					return;
				}

				keyboardEvent.preventDefault();
				openFocusedTask();
				return;
			}

			if (command === "toggle-selection-mode") {
				if (!permissions.canManageTasks) {
					return;
				}

				keyboardEvent.preventDefault();
				toggleSelectionMode();
				return;
			}

			if (command === "toggle-focused-selection") {
				if (
					!selectionMode ||
					!focusedTaskId ||
					!visibleTaskIds.includes(focusedTaskId)
				) {
					return;
				}

				keyboardEvent.preventDefault();
				toggleTaskSelection(focusedTaskId);
				return;
			}

			if (command === "archive-selected") {
				if (
					selectionMode &&
					selectedTaskIds.size > 0 &&
					permissions.canManageTasks
				) {
					keyboardEvent.preventDefault();
					setArchiveDialogOpen(true);
				}

				return;
			}

			if (command === "delete-selected") {
				if (
					selectionMode &&
					selectedTaskIds.size > 0 &&
					permissions.canManageTasks
				) {
					keyboardEvent.preventDefault();
					setDeleteDialogOpen(true);
				}

				return;
			}

			if (command === "escape") {
				if (selectionMode) {
					keyboardEvent.preventDefault();
					setSelectionMode(false);
					setSelectedTaskIds(new Set());
					setArchiveDialogOpen(false);
					setDeleteDialogOpen(false);
					return;
				}

				if (focusedTaskId) {
					keyboardEvent.preventDefault();
					setFocusedTaskId(null);
				}
			}
		}

		window.addEventListener(
			BOARD_KEYBOARD_COMMAND_EVENT,
			handleBoardKeyboardCommand,
		);

		return () => {
			window.removeEventListener(
				BOARD_KEYBOARD_COMMAND_EVENT,
				handleBoardKeyboardCommand,
			);
		};
	}, [
		focusedTaskId,
		moveKeyboardFocus,
		openFocusedTask,
		permissions.canManageTasks,
		selectedTaskIds,
		selectionMode,
		toggleSelectionMode,
		toggleTaskSelection,
		visibleTaskIds,
	]);

	return (
		<div className="space-y-3">
			<div className="flex flex-col gap-3 xl:flex-row xl:items-center">
				<div className="min-w-0 flex-1">
					<TaskFilterControls
						filters={filters}
						labelCandidates={labelCandidates}
						assigneeCandidates={projectAssigneeCandidates}
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
							archiveDialogOpen={archiveDialogOpen}
							onArchiveDialogOpenChange={setArchiveDialogOpen}
							deleteDialogOpen={deleteDialogOpen}
							onDeleteDialogOpenChange={setDeleteDialogOpen}
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
								keyboardFocusedTaskId={focusedTaskId}
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
