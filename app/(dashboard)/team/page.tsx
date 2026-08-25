import { EmptyState } from "@/components/empty-state";
import { TeamDirectory } from "@/components/team/team-directory";
import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { getTeamDirectoryForUser } from "@/lib/db/team";

export default async function TeamPage() {
	const user = await getCurrentDatabaseUser();

	const team = await getTeamDirectoryForUser(user.id);

	const collaboratorCount = team.collaborators.length;
	const projectCount = team.projects.length;

	if (collaboratorCount === 0) {
		return (
			<div className="flex min-h-[calc(100vh-8rem)] flex-col">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Team</h1>

					<p className="mt-0.5 text-muted-foreground">
						0 collaborators across{" "}
						{projectCount === 1 ? "1 project" : `${projectCount} projects`}
					</p>
				</div>

<EmptyState
	className="flex-1"
	illustrationSrc="/empty-states/team-work-rafiki.svg"
	title="No collaborators yet"
	description="People added to projects you can access will appear here. Project membership is managed from the individual project."
/>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-3xl font-bold text-foreground">Team</h1>

				<p className="mt-0.5 text-muted-foreground">
					{collaboratorCount === 1
						? "1 collaborator"
						: `${collaboratorCount} collaborators`}{" "}
					across {projectCount === 1 ? "1 project" : `${projectCount} projects`}
				</p>
			</div>

			<TeamDirectory
				collaborators={team.collaborators}
				projects={team.projects}
			/>
		</div>
	);
}
