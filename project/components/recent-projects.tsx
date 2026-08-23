import { CalendarRange, Clock3 } from "lucide-react";
import Link from "next/link";

import { getColorHex } from "@/lib/constants/colors";
import type { DashboardProjectSummary } from "@/lib/db/dashboard";
import type { Project } from "@/lib/db/schema";

type RecentProjectsProps = {
	projects: DashboardProjectSummary[];
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

export function RecentProjects({ projects }: RecentProjectsProps) {
	if (projects.length === 0) {
		return (
			<div className="flex min-h-40 items-center justify-center px-6 text-center">
				<p className="text-sm text-muted-foreground">
					No active projects to show.
				</p>
			</div>
		);
	}

	return (
		<div className="grid h-full gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
			{projects.map((project) => (
				<Link
					key={project.id}
					href={`/projects/${project.id}`}
					className="group relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-border px-4 pb-3 pt-3 transition-colors hover:bg-muted"
				>
					<div
						aria-hidden="true"
						className="absolute inset-x-0 top-0 h-3"
						style={{
							backgroundColor: getColorHex(project.color),
						}}
					/>

					<div className="mt-1">
						<span className="text-xs font-semibold capitalize text-muted-foreground">
							{project.accessRole}
						</span>

						<h3
							title={project.name}
							className="mt-0.5 line-clamp-1 text-sm font-bold leading-5 text-foreground"
						>
							{project.name}
						</h3>

						<p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
							{project.description || "No description yet."}
						</p>
					</div>

					<div className="mt-auto space-y-1 border-t border-border pt-1.5 text-sm text-muted-foreground">
						<div className="flex items-center gap-1.5">
							<CalendarRange
								aria-hidden="true"
								size={13}
								className="shrink-0"
							/>

							<span className="truncate text-xs text-muted-foreground">
								{formatProjectSchedule(project)}
							</span>
						</div>

						<div className="flex items-center gap-1.5">
							<Clock3 aria-hidden="true" size={13} className="shrink-0" />

							<span className="truncate text-xs text-muted-foreground">
								Last activity {formatDate(project.lastActivityAt)}
							</span>
						</div>
					</div>
				</Link>
			))}
		</div>
	);
}
