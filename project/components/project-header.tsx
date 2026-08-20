import { ArrowLeft, CalendarRange, Clock3 } from "lucide-react";
import Link from "next/link";

import { ProjectActions } from "@/components/project-actions";
import type { ProjectPermissions } from "@/lib/auth/project-permissions";
import { getColorHex } from "@/lib/constants/colors";
import type { Project } from "@/lib/db/schema";
import type { EditableProject } from "@/types/project";

type ProjectHeaderProps = {
	project: Project;
	permissions: ProjectPermissions;
	lastActivityAt: Date;
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

export function ProjectHeader({
	project,
	permissions,
	lastActivityAt,
}: ProjectHeaderProps) {
	return (
		<div className="relative overflow-hidden rounded-xl border border-border bg-card">
			<div
				aria-hidden="true"
				className="absolute inset-x-0 top-0 h-4"
				style={{
					backgroundColor: getColorHex(project.color),
				}}
			/>

			<div className="p-6 pt-7">
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
							<h1 className="truncate text-2xl font-bold text-foreground sm:text-3xl">
								{project.name}
							</h1>

							<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
								{project.description || "No project description yet."}
							</p>

							<div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
								<div className="flex items-center gap-2">
									<CalendarRange aria-hidden="true" size={16} />

									<span>{formatProjectSchedule(project)}</span>
								</div>

								<div className="flex items-center gap-2">
									<Clock3 aria-hidden="true" size={16} />

									<span>Last activity {formatDate(lastActivityAt)}</span>
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
		</div>
	);
}
