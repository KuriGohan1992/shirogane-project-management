import "server-only";

import { and, eq, inArray, isNull } from "drizzle-orm";

import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { db } from "@/lib/db";
import { recordTaskActivity } from "@/lib/db/activity";
import { getProjectAccess } from "@/lib/db/project-access";
import { type Task, taskAssignees, taskLabels, tasks } from "@/lib/db/schema";
import { createNotificationsSafely } from "../services/notifications";

type BulkTaskMutationResult = {
	projectId: string;
	affectedCount: number;
};

type BulkPermission = "manage" | "assign";

async function getBulkTaskContext(
	projectId: string,
	taskIds: string[],
	userId: string,
	permission: BulkPermission,
) {
	const uniqueTaskIds = [...new Set(taskIds)];

	if (uniqueTaskIds.length === 0) {
		return undefined;
	}

	const accessRole = await getProjectAccess(projectId, userId);

	if (!accessRole) {
		return undefined;
	}

	const permissions = getProjectPermissions(accessRole);

	const allowed =
		permission === "assign"
			? permissions.canAssignTasks
			: permissions.canManageTasks;

	if (!allowed) {
		return undefined;
	}

	const selectedTasks = await db.query.tasks.findMany({
		where: (task, { and, inArray, isNull }) =>
			and(inArray(task.id, uniqueTaskIds), isNull(task.archivedAt)),

		with: {
			stage: {
				columns: {
					projectId: true,
					name: true,
				},
			},
		},
	});

	if (
		selectedTasks.length !== uniqueTaskIds.length ||
		selectedTasks.some((task) => task.stage.projectId !== projectId)
	) {
		return undefined;
	}

	const taskById = new Map(selectedTasks.map((task) => [task.id, task]));

	const orderedTasks = uniqueTaskIds.flatMap((taskId) => {
		const task = taskById.get(taskId);

		return task ? [task] : [];
	});

	return {
		projectId,
		tasks: orderedTasks,
	};
}

async function getAssignableProjectUser(
	projectId: string,
	assigneeUserId: string,
) {
	const [project, assignee] = await Promise.all([
		db.query.projects.findFirst({
			columns: {
				ownerId: true,
			name: true,
			},

			where: (project, { eq }) => eq(project.id, projectId),
		}),

		db.query.users.findFirst({
			columns: {
				id: true,
				name: true,
				email: true,
			},

			where: (user, { eq }) => eq(user.id, assigneeUserId),
		}),
	]);

	if (!project || !assignee) {
		return undefined;
	}

if (project.ownerId === assignee.id) {
	return {
		user: assignee,
		project,
	};
}

	const member = await db.query.projectMembers.findFirst({
		columns: {
			userId: true,
		},

		where: (member, { and, eq }) =>
			and(
				eq(member.projectId, projectId),
				eq(member.userId, assignee.id),
				eq(member.role, "member"),
			),
	});

return member
	? {
			user: assignee,
			project,
		}
	: undefined;
}

function getUserDisplayName(user: { name: string | null; email: string }) {
	return user.name ?? user.email;
}

async function recordTaskActivities(
	entries: Parameters<typeof recordTaskActivity>[0][],
) {
	await Promise.all(entries.map((entry) => recordTaskActivity(entry)));
}

export async function moveTasksForUser(
	projectId: string,
	taskIds: string[],
	targetStageId: string,
	userId: string,
): Promise<BulkTaskMutationResult | undefined> {
	const context = await getBulkTaskContext(
		projectId,
		taskIds,
		userId,
		"manage",
	);

	if (!context) {
		return undefined;
	}

	const targetStage = await db.query.stages.findFirst({
		columns: {
			id: true,
			projectId: true,
			name: true,
		},

		where: (stage, { eq }) => eq(stage.id, targetStageId),
	});

	if (!targetStage || targetStage.projectId !== projectId) {
		return undefined;
	}

	const selectedTaskIds = new Set(context.tasks.map((task) => task.id));

	const affectedStageIds = [
		...new Set([targetStage.id, ...context.tasks.map((task) => task.stageId)]),
	];

	const affectedTasks = await db.query.tasks.findMany({
		where: (task, { and, inArray, isNull }) =>
			and(inArray(task.stageId, affectedStageIds), isNull(task.archivedAt)),

		orderBy: (task, { asc }) => [asc(task.position)],
	});

	const tasksByStage = new Map<string, typeof affectedTasks>();

	for (const task of affectedTasks) {
		const stageTasks = tasksByStage.get(task.stageId) ?? [];

		stageTasks.push(task);

		tasksByStage.set(task.stageId, stageTasks);
	}

	const updatedAt = new Date();

	const sourceUpdates = affectedStageIds
		.filter((sourceStageId) => sourceStageId !== targetStage.id)
		.flatMap((sourceStageId) => {
			const remainingTasks = (tasksByStage.get(sourceStageId) ?? []).filter(
				(task) => !selectedTaskIds.has(task.id),
			);

			return remainingTasks.map((task, index) =>
				db
					.update(tasks)
					.set({
						position: index * 1000,
						updatedAt,
					})
					.where(and(eq(tasks.id, task.id), isNull(tasks.archivedAt))),
			);
		});

	const targetTasks = (tasksByStage.get(targetStage.id) ?? []).filter(
		(task) => !selectedTaskIds.has(task.id),
	);

	const nextTargetTasks = [...targetTasks, ...context.tasks];

	const targetUpdates = nextTargetTasks.map((task, index) =>
		db
			.update(tasks)
			.set({
				stageId: targetStage.id,
				position: index * 1000,
				updatedAt,
			})
			.where(and(eq(tasks.id, task.id), isNull(tasks.archivedAt))),
	);

	const updates = [...sourceUpdates, ...targetUpdates];

	const [firstUpdate, ...remainingUpdates] = updates;

	if (firstUpdate) {
		await db.batch([firstUpdate, ...remainingUpdates]);
	}

	await recordTaskActivities(
		context.tasks.flatMap((task) =>
			task.stageId === targetStage.id
				? []
				: [
						{
							projectId,
							taskId: task.id,
							actorId: userId,
							action: "task_moved" as const,
							taskTitle: task.title,
							metadata: {
								fromStage: task.stage.name,
								toStage: targetStage.name,
							},
						},
					],
		),
	);

	return {
		projectId,
		affectedCount: context.tasks.length,
	};
}

export async function setTaskPriorityForUser(
	projectId: string,
	taskIds: string[],
	priority: Task["priority"],
	userId: string,
): Promise<BulkTaskMutationResult | undefined> {
	const context = await getBulkTaskContext(
		projectId,
		taskIds,
		userId,
		"manage",
	);

	if (!context) {
		return undefined;
	}

	const changedTasks = context.tasks.filter(
		(task) => task.priority !== priority,
	);

	if (changedTasks.length === 0) {
		return {
			projectId,
			affectedCount: 0,
		};
	}

	await db
		.update(tasks)
		.set({
			priority,
			updatedAt: new Date(),
		})
		.where(
			and(
				inArray(
					tasks.id,
					changedTasks.map((task) => task.id),
				),
				isNull(tasks.archivedAt),
			),
		);

	await recordTaskActivities(
		changedTasks.map((task) => ({
			projectId,
			taskId: task.id,
			actorId: userId,
			action: "task_updated" as const,
			taskTitle: task.title,
			metadata: {
				changedFields: "priority",
			},
		})),
	);

	return {
		projectId,
		affectedCount: changedTasks.length,
	};
}

async function changeTaskAssigneeForUser(
	mode: "assign" | "unassign",
	projectId: string,
	taskIds: string[],
	assigneeUserId: string,
	userId: string,
): Promise<BulkTaskMutationResult | undefined> {
	const context = await getBulkTaskContext(
		projectId,
		taskIds,
		userId,
		"assign",
	);

	if (!context) {
		return undefined;
	}

const assignable =
	await getAssignableProjectUser(
		projectId,
		assigneeUserId,
	);

if (!assignable) {
	return undefined;
}

const {
	user: assignee,
	project,
} = assignable;

	const changedRows =
		mode === "assign"
			? await db
					.insert(taskAssignees)
					.values(
						context.tasks.map((task) => ({
							taskId: task.id,
							userId: assignee.id,
						})),
					)
					.onConflictDoNothing()
					.returning({
						taskId: taskAssignees.taskId,
					})
			: await db
					.delete(taskAssignees)
					.where(
						and(
							inArray(
								taskAssignees.taskId,
								context.tasks.map((task) => task.id),
							),
							eq(taskAssignees.userId, assignee.id),
						),
					)
					.returning({
						taskId: taskAssignees.taskId,
					});

	const changedTaskIds = new Set(changedRows.map((row) => row.taskId));

	const changedTasks = context.tasks.filter((task) =>
		changedTaskIds.has(task.id),
	);

	await recordTaskActivities(
		changedTasks.map((task) => ({
			projectId,
			taskId: task.id,
			actorId: userId,
			action: mode === "assign" ? "assignee_added" : "assignee_removed",
			taskTitle: task.title,
			metadata: {
				assigneeName: getUserDisplayName(assignee),
			},
		})),
	);

	if (changedTasks.length === 1) {
	const [task] =
		changedTasks;

	if (task) {
		await createNotificationsSafely([
			mode === "assign"
				? {
						type:
							"task_assigned",

						recipientId:
							assignee.id,

						actorId:
							userId,

						projectId,

						taskId:
							task.id,

						metadata: {
							projectName:
								project.name,

							taskTitle:
								task.title,
						},
					}
				: {
						type:
							"task_unassigned",

						recipientId:
							assignee.id,

						actorId:
							userId,

						projectId,

						taskId:
							task.id,

						metadata: {
							projectName:
								project.name,

							taskTitle:
								task.title,
						},
					},
		]);
	}
}

if (changedTasks.length > 1) {
	await createNotificationsSafely([
		mode === "assign"
			? {
					type:
						"tasks_assigned",

					recipientId:
						assignee.id,

					actorId:
						userId,

					projectId,

					metadata: {
						projectName:
							project.name,

						taskCount:
							changedTasks.length,
					},
				}
			: {
					type:
						"tasks_unassigned",

					recipientId:
						assignee.id,

					actorId:
						userId,

					projectId,

					metadata: {
						projectName:
							project.name,

						taskCount:
							changedTasks.length,
					},
				},
	]);
}

	return {
		projectId,
		affectedCount: changedTasks.length,
	};
}

export function assignUserToTasksForUser(
	projectId: string,
	taskIds: string[],
	assigneeUserId: string,
	userId: string,
) {
	return changeTaskAssigneeForUser(
		"assign",
		projectId,
		taskIds,
		assigneeUserId,
		userId,
	);
}

export function unassignUserFromTasksForUser(
	projectId: string,
	taskIds: string[],
	assigneeUserId: string,
	userId: string,
) {
	return changeTaskAssigneeForUser(
		"unassign",
		projectId,
		taskIds,
		assigneeUserId,
		userId,
	);
}

async function changeTaskLabelForUser(
	mode: "add" | "remove",
	projectId: string,
	taskIds: string[],
	labelId: string,
	userId: string,
): Promise<BulkTaskMutationResult | undefined> {
	const context = await getBulkTaskContext(
		projectId,
		taskIds,
		userId,
		"manage",
	);

	if (!context) {
		return undefined;
	}

	const label = await db.query.projectLabels.findFirst({
		columns: {
			id: true,
			name: true,
		},

		where: (label, { and, eq }) =>
			and(eq(label.id, labelId), eq(label.projectId, projectId)),
	});

	if (!label) {
		return undefined;
	}

	const changedRows =
		mode === "add"
			? await db
					.insert(taskLabels)
					.values(
						context.tasks.map((task) => ({
							taskId: task.id,
							labelId: label.id,
						})),
					)
					.onConflictDoNothing()
					.returning({
						taskId: taskLabels.taskId,
					})
			: await db
					.delete(taskLabels)
					.where(
						and(
							inArray(
								taskLabels.taskId,
								context.tasks.map((task) => task.id),
							),
							eq(taskLabels.labelId, label.id),
						),
					)
					.returning({
						taskId: taskLabels.taskId,
					});

	const changedTaskIds = new Set(changedRows.map((row) => row.taskId));

	const changedTasks = context.tasks.filter((task) =>
		changedTaskIds.has(task.id),
	);

	await recordTaskActivities(
		changedTasks.map((task) => ({
			projectId,
			taskId: task.id,
			actorId: userId,
			action: mode === "add" ? "label_added" : "label_removed",
			taskTitle: task.title,
			metadata: {
				labelName: label.name,
			},
		})),
	);

	return {
		projectId,
		affectedCount: changedTasks.length,
	};
}

export function addLabelToTasksForUser(
	projectId: string,
	taskIds: string[],
	labelId: string,
	userId: string,
) {
	return changeTaskLabelForUser("add", projectId, taskIds, labelId, userId);
}

export function removeLabelFromTasksForUser(
	projectId: string,
	taskIds: string[],
	labelId: string,
	userId: string,
) {
	return changeTaskLabelForUser("remove", projectId, taskIds, labelId, userId);
}

export async function archiveTasksForUser(
	projectId: string,
	taskIds: string[],
	userId: string,
): Promise<BulkTaskMutationResult | undefined> {
	const context = await getBulkTaskContext(
		projectId,
		taskIds,
		userId,
		"manage",
	);

	if (!context) {
		return undefined;
	}

	const archivedAt = new Date();

	const archivedTasks = await db
		.update(tasks)
		.set({
			archivedAt,
			updatedAt: archivedAt,
		})
		.where(
			and(
				inArray(
					tasks.id,
					context.tasks.map((task) => task.id),
				),
				isNull(tasks.archivedAt),
			),
		)
		.returning({
			id: tasks.id,
		});

	const archivedTaskIds = new Set(archivedTasks.map((task) => task.id));

	const changedTasks = context.tasks.filter((task) =>
		archivedTaskIds.has(task.id),
	);

	await recordTaskActivities(
		changedTasks.map((task) => ({
			projectId,
			taskId: task.id,
			actorId: userId,
			action: "task_archived" as const,
			taskTitle: task.title,
			metadata: {
				stageName: task.stage.name,
			},
		})),
	);

	return {
		projectId,
		affectedCount: changedTasks.length,
	};
}

export async function deleteTasksForUser(
	projectId: string,
	taskIds: string[],
	userId: string,
): Promise<BulkTaskMutationResult | undefined> {
	const context = await getBulkTaskContext(
		projectId,
		taskIds,
		userId,
		"manage",
	);

	if (!context) {
		return undefined;
	}

	const deletedTasks = await db
		.delete(tasks)
		.where(
			and(
				inArray(
					tasks.id,
					context.tasks.map((task) => task.id),
				),
				isNull(tasks.archivedAt),
			),
		)
		.returning({
			id: tasks.id,
		});

	return {
		projectId,
		affectedCount: deletedTasks.length,
	};
}
