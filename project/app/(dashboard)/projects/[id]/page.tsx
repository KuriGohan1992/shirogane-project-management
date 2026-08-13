import { notFound } from "next/navigation";

import { KanbanBoard } from "@/components/kanban-board";
import { ProjectHeader } from "@/components/project-header";
import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { getProjectOwnedByUser } from "@/lib/db/projects";
import { projectIdSchema } from "@/lib/validations/project";

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

	return (
		<div className="space-y-6">
			<ProjectHeader project={project} />

			<section aria-labelledby="project-board-heading">
				<div className="mb-4">
					<h2
						id="project-board-heading"
						className="text-xl font-semibold text-foreground"
					>
						Board
					</h2>

					<p className="mt-1 text-sm text-muted-foreground">
						Organize tasks across your project stages.
					</p>
				</div>

				<KanbanBoard stages={project.stages} />
			</section>
		</div>
	);
}
