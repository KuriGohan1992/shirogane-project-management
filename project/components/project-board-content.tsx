import { notFound } from "next/navigation";

import { ArchivedTasksButton } from "@/components/archived-tasks-button";
import { KanbanBoard } from "@/components/kanban-board";
import { ProjectActivityButton } from "@/components/project-activity-button";
import { ProjectHeader } from "@/components/project-header";
import { ProjectMembersButton } from "@/components/project-members-button";
import { buildAssignmentCandidates } from "@/lib/assignment-candidates";
import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { getProjectActivityForUser } from "@/lib/db/activity";
import { getProjectForUser } from "@/lib/db/projects";
import { getArchivedTasksForProject } from "@/lib/db/task-archive";
import { getTeamCollaboratorProfilesForUser } from "@/lib/db/team";

type ProjectBoardContentProps = {
	projectId: string;
	currentUserId: string;
};

export async function ProjectBoardContent({
	projectId,
	currentUserId,
}: ProjectBoardContentProps) {
	const project = await getProjectForUser(projectId, currentUserId);

	if (!project) {
		notFound();
	}

	const permissions = getProjectPermissions(project.accessRole);

	const [archivedTasks, activities, teamCollaborators] = await Promise.all([
		getArchivedTasksForProject(projectId, currentUserId),

		getProjectActivityForUser(projectId, currentUserId),

		permissions.canManageMembers
			? getTeamCollaboratorProfilesForUser(currentUserId)
			: Promise.resolve([]),
	]);

	const projectActivities = activities ?? [];

	const lastActivityAt = projectActivities[0]?.createdAt ?? project.updatedAt;

	const assigneeCandidates = buildAssignmentCandidates({
		owner: project.owner,
		members: project.members,
		teamCollaborators,
		canManageMembers: permissions.canManageMembers,
	});

	return (
		<div className="space-y-6">
			<ProjectHeader
				project={project}
				permissions={permissions}
				accessRole={project.accessRole}
				owner={project.owner}
				lastActivityAt={lastActivityAt}
				headerActions={
					<div className="flex items-center gap-2">
						<ProjectActivityButton activities={projectActivities} />

						<ArchivedTasksButton
							projectId={project.id}
							tasks={archivedTasks}
							canManage={permissions.canManageTasks}
						/>

						<ProjectMembersButton
							projectId={project.id}
							owner={project.owner}
							members={project.members}
							canManageMembers={permissions.canManageMembers}
						/>
					</div>
				}
			/>

			<section aria-labelledby="project-board-heading">
				<KanbanBoard
					projectId={project.id}
					stages={project.stages}
					labelCandidates={project.labels}
					assigneeCandidates={assigneeCandidates}
					permissions={permissions}
					currentUserId={currentUserId}
					isProjectOwner={project.accessRole === "owner"}
				/>
			</section>
		</div>
	);
}
