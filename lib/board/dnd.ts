export const BOARD_DND_TYPES = {
	stage: "stage",
	task: "task",
} as const;

const STAGE_DND_PREFIX = "stage:";
const TASK_DND_PREFIX = "task:";
const STAGE_TASK_DROP_ZONE_PREFIX = "stage-task-drop:";

export function getStageDndId(stageId: string) {
	return `${STAGE_DND_PREFIX}${stageId}`;
}

export function getTaskDndId(taskId: string) {
	return `${TASK_DND_PREFIX}${taskId}`;
}

export function getStageTaskDropZoneDndId(stageId: string) {
	return `${STAGE_TASK_DROP_ZONE_PREFIX}${stageId}`;
}

export function getStageIdFromDndId(id: string | number) {
	const value = String(id);

	if (!value.startsWith(STAGE_DND_PREFIX)) {
		return undefined;
	}

	return value.slice(STAGE_DND_PREFIX.length);
}

export function getTaskIdFromDndId(id: string | number) {
	const value = String(id);

	if (!value.startsWith(TASK_DND_PREFIX)) {
		return undefined;
	}

	return value.slice(TASK_DND_PREFIX.length);
}

export function getStageIdFromTaskDropZoneDndId(id: string | number) {
	const value = String(id);

	if (!value.startsWith(STAGE_TASK_DROP_ZONE_PREFIX)) {
		return undefined;
	}

	return value.slice(STAGE_TASK_DROP_ZONE_PREFIX.length);
}
