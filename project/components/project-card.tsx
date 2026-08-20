import { CalendarRange, Clock3 } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { ProjectActions } from "@/components/project-actions";
import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { getColorHex } from "@/lib/constants/colors";
import type { Project } from "@/lib/db/schema";
import type { EditableProject, ProjectWithAccess } from "@/types/project";

type ProjectCardProps = {
	project: ProjectWithAccess;
};

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

function formatProjectSchedule(project: Project) {
	if (project.startDate && project.dueDate) {
		return `${formatDate(project.startDate)} – ${formatDate(project.dueDate)}`;
	}

	if (project.startDate) {
		return `Starts ${formatDate(project.startDate)}`;
	}

	if (project.dueDate) {
		return `Due ${formatDate(project.dueDate)}`;
	}

	return "No project dates";
}

function toEditableProject(project: Project): EditableProject {
	return {
		id: project.id,
		name: project.name,
		description: project.description ?? "",
		color: project.color,
		startDate: project.startDate?.toISOString().slice(0, 10) ?? "",
		dueDate: project.dueDate?.toISOString().slice(0, 10) ?? "",
	};
}

export function ProjectCard({ project }: ProjectCardProps) {
	const permissions = getProjectPermissions(project.accessRole);
	const color = getColorHex(project.color);

	return (
		<article
			className="group relative flex h-[18rem] overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-[var(--project-color)] hover:shadow-md"
			style={
				{
					"--project-color": color,
				} as CSSProperties
			}
		>
			<div
				aria-hidden="true"
				className="absolute inset-x-0 top-0 h-4"
				style={{ backgroundColor: color }}
			/>

			<div className="flex min-h-0 w-full flex-col p-5 pt-6">
				<div className="mb-4 flex items-center justify-between gap-3">
					<ProjectActions
						project={toEditableProject(project)}
						canEdit={permissions.canEditProject}
						canDelete={permissions.canDeleteProject}
						compact
					/>

					<span className="shrink-0 text-xs font-medium capitalize text-muted-foreground">
						{project.accessRole}
					</span>
				</div>

				<Link href={`/projects/${project.id}`} className="min-h-0">
					<h2
						title={project.name}
						className="line-clamp-2 min-h-14 text-lg font-semibold leading-7 text-foreground transition-colors group-hover:text-[var(--project-color)]"
					>
						{project.name}
					</h2>

					<p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
						{project.description || "No description yet."}
					</p>
				</Link>

				<div className="mt-auto space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<CalendarRange aria-hidden="true" size={16} className="shrink-0" />

						<span className="truncate">{formatProjectSchedule(project)}</span>
					</div>

					<div className="flex items-center gap-2">
						<Clock3 aria-hidden="true" size={16} className="shrink-0" />

						<span className="truncate">
							Last activity {formatDate(project.lastActivityAt)}
						</span>
					</div>
				</div>
			</div>
		</article>
	);
}
