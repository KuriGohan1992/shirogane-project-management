import { CreateProjectButton } from "@/components/create-project-button";
import { EmptyState } from "@/components/empty-state";
import { ProjectGrid } from "@/components/project-grid";

import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { getProjectsForUser } from "@/lib/db/projects";

export default async function ProjectsPage() {
	const user = await getCurrentDatabaseUser();
	const projects = await getProjectsForUser(user.id);

	if (projects.length === 0) {
		return (
			<div className="flex min-h-[calc(100vh-8rem)] flex-col">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Projects</h1>

					<p className="mt-0.5 text-muted-foreground">0 projects</p>
				</div>

				<EmptyState
					className="flex-1"
					illustrationSrc="/illustrations/empty-cuate.svg"
					title="No projects yet"
					description="Create your first project to start organizing stages and tasks."
					action={
						<CreateProjectButton
							label="Create your first project"
							keyboardShortcutTarget
							showIcon={false}
						/>
					}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Projects</h1>

					<p className="mt-0.5 text-muted-foreground">
						{projects.length === 1
							? "1 project"
							: `${projects.length} projects`}
					</p>
				</div>

				<CreateProjectButton keyboardShortcutTarget />
			</div>

			<ProjectGrid projects={projects} />
		</div>
	);
}
