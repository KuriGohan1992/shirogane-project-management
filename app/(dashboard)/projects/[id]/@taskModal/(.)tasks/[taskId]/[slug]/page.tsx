import { notFound } from "next/navigation";
import { AssignmentCandidatesProvider } from "@/components/assignment-candidates-provider";
import { TaskRouteModal } from "@/components/modals/task-route-modal";
import { TaskAccessDenied } from "@/components/task-access-denied";
import { TaskDetailsView } from "@/components/task-details-view";
import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { getTaskDetailsForUser } from "@/lib/db/task-details";
import { projectIdSchema } from "@/lib/validations/project";
import { taskIdSchema } from "@/lib/validations/task";

type TaskModalPageProps = {
	params: Promise<{
		id: string;
		taskId: string;
		slug: string;
	}>;
};

export default async function TaskModalPage({ params }: TaskModalPageProps) {
	const { id, taskId } = await params;

	const projectIdResult = projectIdSchema.safeParse(id);

	const taskIdResult = taskIdSchema.safeParse(taskId);

	if (!projectIdResult.success || !taskIdResult.success) {
		notFound();
	}

	const user = await getCurrentDatabaseUser();

	const lookup = await getTaskDetailsForUser(
		projectIdResult.data,
		taskIdResult.data,
		user.id,
	);

	if (lookup.status === "not_found") {
		notFound();
	}

	if (lookup.status === "forbidden") {
		return (
			<TaskRouteModal taskTitle="Access denied">
				<TaskAccessDenied compact />
			</TaskRouteModal>
		);
	}

	const { details } = lookup;

	const permissions = getProjectPermissions(details.accessRole);

	return (
		<TaskRouteModal taskTitle={details.task.title}>
			<AssignmentCandidatesProvider
				projectId={projectIdResult.data}
				initialCandidates={details.assigneeCandidates}
				canLoadTeamCandidates={permissions.canManageMembers}
			>
				<TaskDetailsView
					task={details.task}
					projectName={details.projectName}
					stageName={details.stageName}
					labelCandidates={details.labelCandidates}
					assigneeCandidates={details.assigneeCandidates}
					permissions={permissions}
					currentUserId={user.id}
					isProjectOwner={details.accessRole === "owner"}
				/>
			</AssignmentCandidatesProvider>
		</TaskRouteModal>
	);
}
