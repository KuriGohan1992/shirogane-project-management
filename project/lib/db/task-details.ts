import "server-only";

import { db } from "@/lib/db";
import { getProjectAccess } from "@/lib/db/project-access";

export async function getTaskDetailsForUser(
	projectId: string,
	taskId: string,
	userId: string,
) {
	const taskContext = await db.query.tasks.findFirst({
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

	if (!taskContext || taskContext.stage.projectId !== projectId) {
		return {
			status: "not_found",
		} as const;
	}

	const accessRole = await getProjectAccess(projectId, userId);

	if (!accessRole) {
		return {
			status: "forbidden",
		} as const;
	}

	const result = await db.query.tasks.findFirst({
		where: (task, { and, eq, isNull }) =>
			and(eq(task.id, taskId), isNull(task.archivedAt)),

		with: {
			stage: {
				columns: {
					id: true,
					name: true,
					projectId: true,
				},

				with: {
					project: {
						columns: {
							id: true,
							name: true,
						},

						with: {
							labels: {
								orderBy: (label, { asc }) => [asc(label.name)],
							},

							owner: {
								columns: {
									id: true,
									name: true,
									email: true,
									imageUrl: true,
								},
							},

							members: {
								columns: {
									role: true,
								},

								orderBy: (member, { asc }) => [asc(member.joinedAt)],

								with: {
									user: {
										columns: {
											id: true,
											name: true,
											email: true,
											imageUrl: true,
										},
									},
								},
							},
						},
					},
				},
			},

			assignees: {
				orderBy: (assignee, { asc }) => [asc(assignee.assignedAt)],

				with: {
					user: {
						columns: {
							id: true,
							name: true,
							email: true,
							imageUrl: true,
						},
					},
				},
			},

			labels: {
				with: {
					label: true,
				},
			},

			comments: {
				orderBy: (comment, { asc }) => [asc(comment.createdAt)],

				with: {
					author: {
						columns: {
							id: true,
							name: true,
							email: true,
							imageUrl: true,
						},
					},
				},
			},
		},
	});

	if (!result || result.stage.projectId !== projectId) {
		return {
			status: "not_found",
		} as const;
	}

	const { stage, ...task } = result;

	const assigneeCandidates = [
		{
			...stage.project.owner,
			isOwner: true,
		},

		...stage.project.members
			.filter((member) => member.role === "member")
			.map((member) => ({
				...member.user,
				isOwner: false,
			})),
	];

	return {
		status: "success",

		details: {
			task,
			stageName: stage.name,
			projectName: stage.project.name,
			labelCandidates: stage.project.labels,
			assigneeCandidates,
			accessRole,
		},
	} as const;
}
