import "server-only";

import type { ProjectAccessRole } from "@/lib/auth/project-permissions";
import { db } from "@/lib/db";

export async function getProjectAccess(
	projectId: string,
	userId: string,
): Promise<ProjectAccessRole | undefined> {
	const project = await db.query.projects.findFirst({
		columns: {
			id: true,
			ownerId: true,
		},

		where: (project, { eq }) => eq(project.id, projectId),

		with: {
			members: {
				columns: {
					userId: true,
					role: true,
				},

				where: (member, { eq }) => eq(member.userId, userId),
			},
		},
	});

	if (!project) {
		return undefined;
	}

	if (project.ownerId === userId) {
		return "owner";
	}

	return project.members[0]?.role;
}
