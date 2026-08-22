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

	const ownerName = project.owner.name ?? project.owner.email;

	const showOwner = project.accessRole !== "owner";

	return (
		<article
			className="group relative flex h-[15rem] overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md"
			style={
				{
					"--project-color": color,
				} as CSSProperties
			}
		>
			<div
				aria-hidden="true"
				className="absolute inset-x-0 top-0 h-4"
				style={{
					backgroundColor: color,
				}}
			/>

			<div className="flex min-h-0 w-full flex-col px-5 pb-4 pt-6">
				<div className="flex h-5 items-center justify-between gap-2 mt-1">
					<div className="flex min-w-0 items-center gap-2">
						<span className="shrink-0 text-xs font-semibold capitalize text-muted-foreground">
							{project.accessRole}
						</span>

						{project.completedAt && (
							<span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
								Completed
							</span>
						)}
					</div>

					<ProjectActions
						project={toEditableProject(project)}
						canEdit={permissions.canEditProject}
						canDelete={permissions.canDeleteProject}
						canComplete={permissions.canCompleteProject}
						isCompleted={project.completedAt !== null}
						compact
						menuSize="small"
					/>
				</div>

				<Link href={`/projects/${project.id}`} className="mt-1 block min-h-0">
					<h2
						title={project.name}
						className="line-clamp-2 text-lg font-semibold leading-6 text-foreground transition-colors group-hover:text-[var(--project-color)]"
					>
						{project.name}
					</h2>

					<p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted-foreground">
						{project.description || "No description yet."}
					</p>
				</Link>

				{showOwner && (
					<p
						title={ownerName}
						className="mt-3 truncate text-right text-xs text-muted-foreground"
					>
						Owned by{" "}
						<span className="font-medium text-foreground/80">{ownerName}</span>
					</p>
				)}

				<div className="mt-auto space-y-2 border-t border-border pt-3 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<CalendarRange aria-hidden="true" size={15} className="shrink-0" />

						<span className="truncate">{formatProjectSchedule(project)}</span>
					</div>

					<div className="flex items-center gap-2">
						<Clock3 aria-hidden="true" size={15} className="shrink-0" />

						<span className="truncate">
							Last activity {formatDate(project.lastActivityAt)}
						</span>
					</div>
				</div>
			</div>
		</article>
	);
}
