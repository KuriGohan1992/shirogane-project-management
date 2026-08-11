import { FolderPlus } from "lucide-react";

import { CreateProjectButton } from "@/components/create-project-button";
import { ProjectCard } from "@/components/project-card";
import type { Project } from "@/lib/db/schema";

type ProjectGridProps = {
	projects: Project[];
};

export function ProjectGrid({ projects }: ProjectGridProps) {
	if (projects.length === 0) {
		return (
			<div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 text-center">
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-primary dark:bg-primary/15">
					<FolderPlus aria-hidden="true" size={24} />
				</div>

				<h2 className="text-lg font-semibold text-foreground">
					No projects yet
				</h2>

				<p className="mt-2 max-w-sm text-sm text-muted-foreground">
					Create your first project to start organizing stages and tasks.
				</p>

				<div className="mt-5">
					<CreateProjectButton label="Create your first project" />
				</div>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
			{projects.map((project) => (
				<ProjectCard key={project.id} project={project} />
			))}
		</div>
	);
}
