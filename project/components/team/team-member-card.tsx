import { ChevronRight } from "lucide-react";

import { UserAvatar } from "@/components/user-avatar";
import { getColorHex } from "@/lib/constants/colors";
import type { TeamCollaborator } from "@/types/team";

type TeamMemberCardProps = {
	collaborator: TeamCollaborator;
	onSelect: (collaborator: TeamCollaborator) => void;
};

const MAX_VISIBLE_PROJECTS = 3;

export function TeamMemberCard({
	collaborator,
	onSelect,
}: TeamMemberCardProps) {
	const displayName = collaborator.name?.trim() || collaborator.email;

	const visibleProjects = collaborator.projects.slice(0, MAX_VISIBLE_PROJECTS);

	const hiddenProjectCount =
		collaborator.projects.length - visibleProjects.length;

	return (
		<button
			type="button"
			onClick={() => onSelect(collaborator)}
			aria-label={`View shared projects with ${displayName}`}
			className="group flex min-h-44 w-full flex-col rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			<div className="flex min-w-0 items-start gap-3">
				<UserAvatar user={collaborator} className="size-11 shrink-0" />

				<div className="min-w-0 flex-1">
					<h2 className="truncate font-semibold text-foreground">
						{displayName}
					</h2>

					{collaborator.name && (
						<p className="mt-0.5 truncate text-sm text-muted-foreground">
							{collaborator.email}
						</p>
					)}
				</div>

				<ChevronRight
					aria-hidden="true"
					className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
				/>
			</div>

			<div className="mt-4 border-t border-border pt-4">
				<div className="flex items-center gap-2">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Shared projects
					</p>

					<span className="text-xs font-semibold text-muted-foreground">
						{collaborator.projects.length}
					</span>
				</div>

				<div className="mt-3 space-y-2">
					{visibleProjects.map((project) => (
						<div
							key={project.id}
							className="flex min-w-0 items-center gap-2 text-sm"
						>
							<span
								aria-hidden="true"
								className="size-2.5 shrink-0 rounded-full"
								style={{
									backgroundColor: getColorHex(project.color),
								}}
							/>

							<span className="min-w-0 flex-1 truncate text-foreground">
								{project.name}
							</span>

							<span className="shrink-0 text-xs capitalize text-muted-foreground">
								{project.role}
							</span>
						</div>
					))}
				</div>

				{hiddenProjectCount > 0 && (
					<p className="mt-2 text-xs font-medium text-muted-foreground">
						+{hiddenProjectCount} more
					</p>
				)}
			</div>
		</button>
	);
}
