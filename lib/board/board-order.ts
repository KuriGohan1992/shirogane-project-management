import type { StageWithTasks } from "@/types/stage";

const POSITION_STEP = 1000;

type BoardTask = StageWithTasks["tasks"][number];

function clampIndex(index: number, minimum: number, maximum: number) {
	return Math.min(Math.max(index, minimum), maximum);
}

function normalizeTaskPositions(tasks: BoardTask[], stageId: string) {
	return tasks.map((task, index) => ({
		...task,
		stageId,
		position: index * POSITION_STEP,
	}));
}

export function reorderStageInBoard(
	stages: StageWithTasks[],
	stageId: string,
	targetIndex: number,
): StageWithTasks[] {
	const currentIndex = stages.findIndex((stage) => stage.id === stageId);

	if (currentIndex === -1) {
		return stages;
	}

	const boundedTargetIndex = clampIndex(targetIndex, 0, stages.length - 1);

	if (currentIndex === boundedTargetIndex) {
		return stages;
	}

	const reorderedStages = [...stages];

	const [movedStage] = reorderedStages.splice(currentIndex, 1);

	if (!movedStage) {
		return stages;
	}

	reorderedStages.splice(boundedTargetIndex, 0, movedStage);

	return reorderedStages.map((stage, index) => ({
		...stage,
		position: index * POSITION_STEP,
	}));
}

export function moveTaskInBoard(
	stages: StageWithTasks[],
	taskId: string,
	targetStageId: string,
	targetIndex: number,
): StageWithTasks[] {
	const sourceStageIndex = stages.findIndex((stage) =>
		stage.tasks.some((task) => task.id === taskId),
	);

	const targetStageIndex = stages.findIndex(
		(stage) => stage.id === targetStageId,
	);

	if (sourceStageIndex === -1 || targetStageIndex === -1) {
		return stages;
	}

	const sourceStage = stages[sourceStageIndex];

	const targetStage = stages[targetStageIndex];

	if (!sourceStage || !targetStage) {
		return stages;
	}

	const currentTaskIndex = sourceStage.tasks.findIndex(
		(task) => task.id === taskId,
	);

	if (currentTaskIndex === -1) {
		return stages;
	}

	/*
	 * Reordering inside the same Stage.
	 */
	if (sourceStage.id === targetStage.id) {
		const boundedTargetIndex = clampIndex(
			targetIndex,
			0,
			sourceStage.tasks.length - 1,
		);

		if (currentTaskIndex === boundedTargetIndex) {
			return stages;
		}

		const reorderedTasks = [...sourceStage.tasks];

		const [movedTask] = reorderedTasks.splice(currentTaskIndex, 1);

		if (!movedTask) {
			return stages;
		}

		reorderedTasks.splice(boundedTargetIndex, 0, movedTask);

		return stages.map((stage) =>
			stage.id === sourceStage.id
				? {
						...stage,
						tasks: normalizeTaskPositions(reorderedTasks, stage.id),
					}
				: stage,
		);
	}

	/*
	 * Moving between two different Stages.
	 */
	const sourceTasks = [...sourceStage.tasks];

	const [movedTask] = sourceTasks.splice(currentTaskIndex, 1);

	if (!movedTask) {
		return stages;
	}

	const targetTasks = [...targetStage.tasks];

	const boundedTargetIndex = clampIndex(targetIndex, 0, targetTasks.length);

	targetTasks.splice(boundedTargetIndex, 0, {
		...movedTask,
		stageId: targetStage.id,
	});

	return stages.map((stage) => {
		if (stage.id === sourceStage.id) {
			return {
				...stage,
				tasks: normalizeTaskPositions(sourceTasks, stage.id),
			};
		}

		if (stage.id === targetStage.id) {
			return {
				...stage,
				tasks: normalizeTaskPositions(targetTasks, stage.id),
			};
		}

		return stage;
	});
}
