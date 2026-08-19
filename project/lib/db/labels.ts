import "server-only";

import { and, eq, ne } from "drizzle-orm";

import { getProjectPermissions } from "@/lib/auth/project-permissions";
import type { ColorValue } from "@/lib/constants/colors";
import { db } from "@/lib/db";
import { getProjectAccess } from "@/lib/db/project-access";
import { type ProjectLabel, projectLabels, taskLabels } from "@/lib/db/schema";

type LabelData = {
	name: string;
	color: ColorValue;
};

type TaskLabelMutationResult =
	| {
			status: "task_not_found";
	  }
	| {
			status: "label_not_found";
			projectId: string;
	  }
	| {
			status: "created" | "existing" | "assigned" | "unassigned";
			projectId: string;
	  };

type ProjectLabelMutationResult =
	| {
			status: "label_not_found";
	  }
	| {
			status: "duplicate" | "updated" | "deleted";
			projectId: string;
	  };

function normalizeLabelName(name: string) {
	return name.trim().toLocaleLowerCase("en-US");
}

async function getManageableTask(taskId: string, userId: string) {
	const task = await db.query.tasks.findFirst({
		columns: {
			id: true,
		},

		where: (task, { and, eq, isNull }) =>
			and(eq(task.id, taskId), isNull(task.archivedAt)),

		with: {
			stage: {
				columns: {
					projectId: true,
				},
			},
		},
	});

	if (!task) {
		return undefined;
	}

	const accessRole = await getProjectAccess(task.stage.projectId, userId);

	if (!accessRole || !getProjectPermissions(accessRole).canManageTasks) {
		return undefined;
	}

	return task;
}

async function getManageableProjectLabel(labelId: string, userId: string) {
	const label = await db.query.projectLabels.findFirst({
		where: (label, { eq }) => eq(label.id, labelId),
	});

	if (!label) {
		return undefined;
	}

	const accessRole = await getProjectAccess(label.projectId, userId);

	if (!accessRole || !getProjectPermissions(accessRole).canManageTasks) {
		return undefined;
	}

	return label;
}

async function getProjectLabel(projectId: string, labelId: string) {
	return db.query.projectLabels.findFirst({
		where: (label, { and, eq }) =>
			and(eq(label.id, labelId), eq(label.projectId, projectId)),
	});
}

export async function createProjectLabelForTask(
	taskId: string,
	userId: string,
	data: LabelData,
): Promise<TaskLabelMutationResult> {
	const task = await getManageableTask(taskId, userId);

	if (!task) {
		return {
			status: "task_not_found",
		};
	}

	const projectId = task.stage.projectId;
	const normalizedName = normalizeLabelName(data.name);

	const existingLabel = await db.query.projectLabels.findFirst({
		where: (label, { and, eq }) =>
			and(
				eq(label.projectId, projectId),
				eq(label.normalizedName, normalizedName),
			),
	});

	let label: ProjectLabel | undefined = existingLabel;
	let wasCreated = false;

	if (!label) {
		const [createdLabel] = await db
			.insert(projectLabels)
			.values({
				projectId,
				name: data.name,
				normalizedName,
				color: data.color,
			})
			.onConflictDoNothing({
				target: [projectLabels.projectId, projectLabels.normalizedName],
			})
			.returning();

		wasCreated = Boolean(createdLabel);

		label =
			createdLabel ??
			(await db.query.projectLabels.findFirst({
				where: (projectLabel, { and, eq }) =>
					and(
						eq(projectLabel.projectId, projectId),
						eq(projectLabel.normalizedName, normalizedName),
					),
			}));
	}

	if (!label) {
		throw new Error("Failed to create or find the project label.");
	}

	await db
		.insert(taskLabels)
		.values({
			taskId,
			labelId: label.id,
		})
		.onConflictDoNothing();

	return {
		status: wasCreated ? "created" : "existing",
		projectId,
	};
}

export async function assignLabelToTask(
	taskId: string,
	labelId: string,
	userId: string,
): Promise<TaskLabelMutationResult> {
	const task = await getManageableTask(taskId, userId);

	if (!task) {
		return {
			status: "task_not_found",
		};
	}

	const projectId = task.stage.projectId;
	const label = await getProjectLabel(projectId, labelId);

	if (!label) {
		return {
			status: "label_not_found",
			projectId,
		};
	}

	await db
		.insert(taskLabels)
		.values({
			taskId,
			labelId,
		})
		.onConflictDoNothing();

	return {
		status: "assigned",
		projectId,
	};
}

export async function unassignLabelFromTask(
	taskId: string,
	labelId: string,
	userId: string,
): Promise<TaskLabelMutationResult> {
	const task = await getManageableTask(taskId, userId);

	if (!task) {
		return {
			status: "task_not_found",
		};
	}

	const projectId = task.stage.projectId;
	const label = await getProjectLabel(projectId, labelId);

	if (!label) {
		return {
			status: "label_not_found",
			projectId,
		};
	}

	await db
		.delete(taskLabels)
		.where(and(eq(taskLabels.taskId, taskId), eq(taskLabels.labelId, labelId)));

	return {
		status: "unassigned",
		projectId,
	};
}

export async function updateProjectLabelForUser(
	labelId: string,
	userId: string,
	data: LabelData,
): Promise<ProjectLabelMutationResult> {
	const label = await getManageableProjectLabel(labelId, userId);

	if (!label) {
		return {
			status: "label_not_found",
		};
	}

	const normalizedName = normalizeLabelName(data.name);

	const duplicate = await db.query.projectLabels.findFirst({
		columns: {
			id: true,
		},
		where: and(
			eq(projectLabels.projectId, label.projectId),
			eq(projectLabels.normalizedName, normalizedName),
			ne(projectLabels.id, label.id),
		),
	});

	if (duplicate) {
		return {
			status: "duplicate",
			projectId: label.projectId,
		};
	}

	await db
		.update(projectLabels)
		.set({
			name: data.name,
			normalizedName,
			color: data.color,
			updatedAt: new Date(),
		})
		.where(eq(projectLabels.id, label.id));

	return {
		status: "updated",
		projectId: label.projectId,
	};
}

export async function deleteProjectLabelForUser(
	labelId: string,
	userId: string,
): Promise<ProjectLabelMutationResult> {
	const label = await getManageableProjectLabel(labelId, userId);

	if (!label) {
		return {
			status: "label_not_found",
		};
	}

	await db.delete(projectLabels).where(eq(projectLabels.id, label.id));

	return {
		status: "deleted",
		projectId: label.projectId,
	};
}
