import { X } from "lucide-react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserAvatar } from "@/components/user-avatar";
import { removeCollaboratorFromTeam } from "@/lib/actions/members";
import { getColorHex } from "@/lib/constants/colors";
import { cn } from "@/lib/utils";
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

	const removableProjects = collaborator.projects.filter(
		(project) => project.canRemoveMember,
	);

	const canRemove = removableProjects.length > 0;

	const removeAction = removeCollaboratorFromTeam.bind(null, collaborator.id);

	return (
		<div className="group relative min-h-44 w-full rounded-xl border border-border bg-card transition-colors hover:border-foreground/25">
			<button
				type="button"
				onClick={() => onSelect(collaborator)}
				aria-label={`View shared projects with ${displayName}`}
				className="flex min-h-44 w-full flex-col rounded-xl px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/20"
			>
				<div
					className={cn(
						"flex min-h-[3.75rem] min-w-0 items-start gap-3",
						canRemove && "pr-9",
					)}
				>
					<UserAvatar user={collaborator} className="size-11 shrink-0" />

					<div className="min-w-0">
						<h2 className="truncate font-semibold leading-tight text-foreground">
							{displayName}
						</h2>

						{collaborator.jobTitle && (
							<p className="truncate text-sm font-medium leading-tight text-muted-foreground">
								{collaborator.jobTitle}
							</p>
						)}

						<p className="mt-1 truncate text-xs text-muted-foreground">
							{collaborator.email}
						</p>
					</div>
				</div>

				<div className="mt-3 w-full border-t border-border pt-3">
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
						<p className="mt-2 text-sm font-medium text-muted-foreground">
							+{hiddenProjectCount} more
						</p>
					)}
				</div>
			</button>

			{canRemove && (
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<button
							type="button"
							aria-label={`Remove ${displayName} from your projects`}
							title="Remove collaborator"
							className="group/remove absolute right-4 top-4 z-10 inline-flex size-7 items-center justify-center text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<X
								aria-hidden="true"
								className="size-4 transition-transform duration-150 group-hover/remove:scale-110 group-hover/remove:[stroke-width:3]"
								strokeWidth={2.25}
							/>
						</button>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Remove {displayName}?</AlertDialogTitle>

							<AlertDialogDescription>
								This will remove {displayName} from {removableProjects.length}{" "}
								{removableProjects.length === 1 ? "project" : "projects"} that
								you own and remove all of their task assignments in those
								projects. Their Shiro account, comments, activity history, and
								projects managed by other people will not be deleted.
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>

							<form action={removeAction}>
								<AlertDialogAction
									type="submit"
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									Remove collaborator
								</AlertDialogAction>
							</form>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</div>
	);
}
