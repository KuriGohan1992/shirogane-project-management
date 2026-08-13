import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { type NewStage, type Stage, stages } from "@/lib/db/schema";

type StageMutationData = Pick<NewStage, "name">;

type StageMutationResult = {
	stage: Stage;
	projectId: string;
};

type StageMoveDirection = "left" | "right";

async function getOwnedProject(projectId: string, ownerId: string) {
	return db.query.projects.findFirst({
		where: (project, { and, eq }) =>
			and(eq(project.id, projectId), eq(project.ownerId, ownerId)),
	});
}

async function getOwnedStage(stageId: string, ownerId: string) {
	const stage = await db.query.stages.findFirst({
		where: (stage, { eq }) => eq(stage.id, stageId),

		with: {
			project: true,
		},
	});

	if (!stage || stage.project.ownerId !== ownerId) {
		return undefined;
	}

	return stage;
}

export async function createStageInOwnedProject(
	projectId: string,
	ownerId: string,
	data: StageMutationData,
): Promise<StageMutationResult | undefined> {
	const project = await getOwnedProject(projectId, ownerId);

	if (!project) {
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

export async function renameStageOwnedByUser(
	stageId: string,
	ownerId: string,
	data: StageMutationData,
): Promise<StageMutationResult | undefined> {
	const existingStage = await getOwnedStage(stageId, ownerId);

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

export async function deleteStageOwnedByUser(
	stageId: string,
	ownerId: string,
): Promise<string | undefined> {
	const existingStage = await getOwnedStage(stageId, ownerId);

	if (!existingStage) {
		return undefined;
	}

	const [deletedStage] = await db
		.delete(stages)
		.where(
			and(
				eq(stages.id, stageId),
				eq(stages.projectId, existingStage.projectId),
			),
		)
		.returning({
			id: stages.id,
		});

	if (!deletedStage) {
		return undefined;
	}

	return existingStage.projectId;
}

export async function moveStageOwnedByUser(
	stageId: string,
	ownerId: string,
	direction: StageMoveDirection,
): Promise<string | undefined> {
	const currentStage = await getOwnedStage(stageId, ownerId);

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
