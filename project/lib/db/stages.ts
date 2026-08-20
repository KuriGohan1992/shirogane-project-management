import "server-only";

import { and, eq } from "drizzle-orm";
import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { db } from "@/lib/db";
import { getProjectAccess } from "@/lib/db/project-access";
import { type NewStage, type Stage, stages } from "@/lib/db/schema";

type StageMutationData = Pick<NewStage, "name">;

type StageMutationResult = {
	stage: Stage;
	projectId: string;
};

type DeleteStageResult =
	| {
			status: "forbidden";
	  }
	| {
			status: "deleted" | "already_deleted";
			projectId: string;
	  };

type StageMoveDirection = "left" | "right";

export async function createStageInProject(
	projectId: string,
	userId: string,
	data: StageMutationData,
): Promise<StageMutationResult | undefined> {
	const accessRole = await getProjectAccess(projectId, userId);

	if (!accessRole || !getProjectPermissions(accessRole).canManageStages) {
		return undefined;
	}

	const lastStage = await db.query.stages.findFirst({
		where: (stage, { eq }) => eq(stage.projectId, projectId),

		orderBy: (stage, { desc }) => [desc(stage.position)],
	});

	const position = (lastStage?.position ?? -1000) + 1000;

	const [stage] = await db
		.insert(stages)
		.values({
			projectId,
			position,
			...data,
		})
		.returning();

	if (!stage) {
		throw new Error("Failed to create stage.");
	}

	return {
		stage,
		projectId,
	};
}

export async function renameStageForUser(
	stageId: string,
	ownerId: string,
	data: StageMutationData,
): Promise<StageMutationResult | undefined> {
	const existingStage = await getEditableStage(stageId, ownerId);

	if (!existingStage) {
		return undefined;
	}

	const [stage] = await db
		.update(stages)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(stages.id, stageId),
				eq(stages.projectId, existingStage.projectId),
			),
		)
		.returning();

	if (!stage) {
		return undefined;
	}

	return {
		stage,
		projectId: existingStage.projectId,
	};
}

export async function deleteStageForUser(
	projectId: string,
	stageId: string,
	userId: string,
): Promise<DeleteStageResult> {
	const accessRole = await getProjectAccess(projectId, userId);

	if (!accessRole || !getProjectPermissions(accessRole).canManageStages) {
		return {
			status: "forbidden",
		};
	}

	const [deletedStage] = await db
		.delete(stages)
		.where(and(eq(stages.id, stageId), eq(stages.projectId, projectId)))
		.returning({
			id: stages.id,
		});

	return {
		status: deletedStage ? "deleted" : "already_deleted",
		projectId,
	};
}

export async function reorderStageForUser(
	stageId: string,
	userId: string,
	targetIndex: number,
): Promise<string | undefined> {
	const currentStage = await getEditableStage(stageId, userId);

	if (!currentStage) {
		return undefined;
	}

	const projectStages = await db.query.stages.findMany({
		where: (stage, { eq }) => eq(stage.projectId, currentStage.projectId),

		orderBy: (stage, { asc }) => [asc(stage.position)],
	});

	const currentIndex = projectStages.findIndex(
		(stage) => stage.id === currentStage.id,
	);

	if (currentIndex === -1) {
		return undefined;
	}

	const boundedTargetIndex = Math.min(
		Math.max(targetIndex, 0),
		projectStages.length - 1,
	);

	if (currentIndex === boundedTargetIndex) {
		return currentStage.projectId;
	}

	const reorderedStages = [...projectStages];

	const [movedStage] = reorderedStages.splice(currentIndex, 1);

	if (!movedStage) {
		return undefined;
	}

	reorderedStages.splice(boundedTargetIndex, 0, movedStage);

	const updatedAt = new Date();

	const updates = reorderedStages.map((stage, index) =>
		db
			.update(stages)
			.set({
				position: index * 1000,
				updatedAt,
			})
			.where(
				and(
					eq(stages.id, stage.id),
					eq(stages.projectId, currentStage.projectId),
				),
			),
	);

	const [firstUpdate, ...remainingUpdates] = updates;

	if (firstUpdate) {
		await db.batch([firstUpdate, ...remainingUpdates]);
	}

	return currentStage.projectId;
}

export async function moveStageForUser(
	stageId: string,
	ownerId: string,
	direction: StageMoveDirection,
): Promise<string | undefined> {
	const currentStage = await getEditableStage(stageId, ownerId);

	if (!currentStage) {
		return undefined;
	}

	const projectStages = await db.query.stages.findMany({
		where: (stage, { eq }) => eq(stage.projectId, currentStage.projectId),

		orderBy: (stage, { asc }) => [asc(stage.position)],
	});

	const currentIndex = projectStages.findIndex(
		(stage) => stage.id === currentStage.id,
	);

	if (currentIndex === -1) {
		return undefined;
	}

	const targetIndex =
		direction === "left" ? currentIndex - 1 : currentIndex + 1;

	const targetStage = projectStages[targetIndex];

	if (!targetStage) {
		return currentStage.projectId;
	}

	const updatedAt = new Date();

	await db.batch([
		db
			.update(stages)
			.set({
				position: targetStage.position,
				updatedAt,
			})
			.where(
				and(
					eq(stages.id, currentStage.id),
					eq(stages.projectId, currentStage.projectId),
				),
			),

		db
			.update(stages)
			.set({
				position: currentStage.position,
				updatedAt,
			})
			.where(
				and(
					eq(stages.id, targetStage.id),
					eq(stages.projectId, currentStage.projectId),
				),
			),
	]);

	return currentStage.projectId;
}

async function getEditableStage(stageId: string, userId: string) {
	const stage = await db.query.stages.findFirst({
		columns: {
			id: true,
			projectId: true,
			position: true,
		},

		where: (stage, { eq }) => eq(stage.id, stageId),
	});

	if (!stage) {
		return undefined;
	}

	const accessRole = await getProjectAccess(stage.projectId, userId);

	if (!accessRole || !getProjectPermissions(accessRole).canManageStages) {
		return undefined;
	}

	return stage;
}
