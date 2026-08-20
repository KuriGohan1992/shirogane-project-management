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

type ProjectLabelCreateResult =
	| {
			status: "project_not_found";
	  }
	| {
			status: "created" | "existing";
			projectId: string;
			label: ProjectLabel;
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

async function canManageProjectTasks(projectId: string, userId: string) {
	const accessRole = await getProjectAccess(projectId, userId);

	return Boolean(
		accessRole && getProjectPermissions(accessRole).canManageTasks,
	);
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

	if (!(await canManageProjectTasks(task.stage.projectId, userId))) {
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

	if (!(await canManageProjectTasks(label.projectId, userId))) {
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

async function createOrFindProjectLabel(projectId: string, data: LabelData) {
	const normalizedName = normalizeLabelName(data.name);

	const existingLabel = await db.query.projectLabels.findFirst({
		where: (label, { and, eq }) =>
			and(
				eq(label.projectId, projectId),
				eq(label.normalizedName, normalizedName),
			),
	});

	if (existingLabel) {
		return {
			status: "existing" as const,
			label: existingLabel,
		};
	}

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

	if (createdLabel) {
		return {
			status: "created" as const,
			label: createdLabel,
		};
	}

	const concurrentLabel = await db.query.projectLabels.findFirst({
		where: (label, { and, eq }) =>
			and(
				eq(label.projectId, projectId),
				eq(label.normalizedName, normalizedName),
			),
	});

	if (!concurrentLabel) {
		throw new Error("Failed to create or find the project label.");
	}

	return {
		status: "existing" as const,
		label: concurrentLabel,
	};
}

export async function createProjectLabelForUser(
	projectId: string,
	userId: string,
	data: LabelData,
): Promise<ProjectLabelCreateResult> {
	if (!(await canManageProjectTasks(projectId, userId))) {
		return {
			status: "project_not_found",
		};
	}

	const result = await createOrFindProjectLabel(projectId, data);

	return {
		...result,
		projectId,
	};
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

	const result = await createOrFindProjectLabel(projectId, data);

	await db
		.insert(taskLabels)
		.values({
			taskId,
			labelId: result.label.id,
		})
		.onConflictDoNothing();

	return {
		status: result.status,
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
