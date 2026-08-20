import { notFound } from "next/navigation";

import { ArchivedTasksButton } from "@/components/archived-tasks-button";
import { KanbanBoard } from "@/components/kanban-board";
import { ProjectActivityButton } from "@/components/project-activity-button";
import { ProjectHeader } from "@/components/project-header";
import { ProjectMembersButton } from "@/components/project-members-button";
import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { getProjectActivityForUser } from "@/lib/db/activity";
import { getProjectForUser } from "@/lib/db/projects";
import { getArchivedTasksForProject } from "@/lib/db/task-archive";
import type { AssignmentCandidate } from "@/types/member";

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

	const [archivedTasks, activities] = await Promise.all([
		getArchivedTasksForProject(projectId, currentUserId),

		getProjectActivityForUser(projectId, currentUserId),
	]);

	const projectActivities = activities ?? [];

	const lastActivityAt = projectActivities[0]?.createdAt ?? project.updatedAt;

	const permissions = getProjectPermissions(project.accessRole);

	const assigneeCandidates: AssignmentCandidate[] = [
		{
			...project.owner,
			isOwner: true,
		},

		...project.members
			.filter((member) => member.role === "member")
			.map((member) => ({
				...member.user,
				isOwner: false,
			})),
	];

	return (
		<div className="space-y-6">
			<ProjectHeader
				project={project}
				permissions={permissions}
				lastActivityAt={lastActivityAt}
			/>

			<section aria-labelledby="project-board-heading">
				<div className="flex items-center justify-between gap-4">
					<h2 id="project-board-heading" className="text-xl font-semibold">
						Board
					</h2>

					<div className="flex flex-wrap items-center justify-end gap-2">
						<ProjectActivityButton activities={projectActivities} />

						<ArchivedTasksButton
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
				</div>

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
