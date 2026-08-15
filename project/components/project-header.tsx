import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import Link from "next/link";

import { ProjectActions } from "@/components/project-actions";
import type { ProjectPermissions } from "@/lib/auth/project-permissions";
import type { Project } from "@/lib/db/schema";
import type { EditableProject } from "@/types/project";

type ProjectHeaderProps = {
	project: Project;
	permissions: ProjectPermissions;
};

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

function toEditableProject(project: Project): EditableProject {
	return {
		id: project.id,
		name: project.name,
		description: project.description ?? "",
		dueDate: project.dueDate?.toISOString().slice(0, 10) ?? "",
	};
}

export function ProjectHeader({ project, permissions }: ProjectHeaderProps) {
	return (
		<div className="rounded-xl border border-border bg-card p-6">
			<div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
				<div className="flex min-w-0 gap-3">
					<Link
						href="/projects"
						aria-label="Back to projects"
						className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						<ArrowLeft aria-hidden="true" size={20} />
					</Link>

					<div className="min-w-0">
						<div className="flex items-center gap-3">
							<h1 className="truncate text-2xl font-bold text-foreground sm:text-3xl">
								{project.name}
							</h1>
						</div>

						<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
							{project.description || "No project description yet."}
						</p>

						<div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
							<div className="flex items-center gap-2">
								<CalendarDays aria-hidden="true" size={16} />
								<span>
									{project.dueDate
										? `Due ${formatDate(project.dueDate)}`
										: "No due date"}
								</span>
							</div>

							<div className="flex items-center gap-2">
								<Clock3 aria-hidden="true" size={16} />
								<span>Updated {formatDate(project.updatedAt)}</span>
							</div>
						</div>
					</div>
				</div>

				<ProjectActions
					project={toEditableProject(project)}
					canEdit={permissions.canEditProject}
					canDelete={permissions.canDeleteProject}
				/>
			</div>
		</div>
	);
}
