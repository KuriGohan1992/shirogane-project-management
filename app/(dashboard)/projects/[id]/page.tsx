import { notFound } from "next/navigation";

import { ProjectBoardContent } from "@/components/project-board-content";
import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { projectIdSchema } from "@/lib/validations/project";

type ProjectPageProps = {
	params: Promise<{
		id: string;
	}>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
	const { id } = await params;

	const idResult = projectIdSchema.safeParse(id);

	if (!idResult.success) {
		notFound();
	}

	const user = await getCurrentDatabaseUser();

	return (
		<ProjectBoardContent projectId={idResult.data} currentUserId={user.id} />
	);
}
