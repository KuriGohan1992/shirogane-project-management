import { notFound } from "next/navigation";

import { KanbanBoard } from "@/components/kanban-board";
import { ProjectHeader } from "@/components/project-header";
import { ProjectMembersButton } from "@/components/project-members-button";
import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { getProjectOwnedByUser } from "@/lib/db/projects";
import { projectIdSchema } from "@/lib/validations/project";
import type { AssignmentCandidate } from "@/types/member";

type ProjectPageProps = {
	params: Promise<{
		id: string;
	}>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
	const { id } = await params;

	const idResult = projectIdSchema.safeParse(id);

	if (!idResult.success) {
		notFound();
	}

	const user = await getCurrentDatabaseUser();

	const project = await getProjectOwnedByUser(idResult.data, user.id);

	if (!project) {
		notFound();
	}

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
			<ProjectHeader project={project} />

			<section aria-labelledby="project-board-heading">
				<div className="flex items-center justify-between gap-4">
					<h2 className="text-xl font-semibold">Board</h2>

					<ProjectMembersButton
						projectId={project.id}
						owner={project.owner}
						members={project.members}
					/>
				</div>

				<KanbanBoard
					projectId={project.id}
					stages={project.stages}
					assigneeCandidates={assigneeCandidates}
				/>
			</section>
		</div>
	);
}
