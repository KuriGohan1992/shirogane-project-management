import { LayoutPanelTop } from "lucide-react";
import { notFound } from "next/navigation";

import { ProjectHeader } from "@/components/project-header";
import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { getProjectOwnedByUser } from "@/lib/db/projects";
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

	const project = await getProjectOwnedByUser(id, user.id);

	if (!project) {
		notFound();
	}

	return (
		<div className="space-y-6">
			<ProjectHeader project={project} />

			<section aria-labelledby="project-board-heading">
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h2
							id="project-board-heading"
							className="text-xl font-semibold text-foreground"
						>
							Board
						</h2>

						<p className="mt-1 text-sm text-muted-foreground">
							Tasks will be organized across these project stages.
						</p>
					</div>
				</div>

				<div className="flex gap-4 overflow-x-auto pb-4">
					{project.stages.map((stage) => (
						<section
							key={stage.id}
							className="w-[min(20rem,85vw)] shrink-0 rounded-xl border border-border bg-muted/40"
						>
							<div className="flex items-center gap-2 border-b border-border px-4 py-3">
								<div className="h-2.5 w-2.5 rounded-full bg-primary" />

								<h3 className="font-semibold text-foreground">{stage.name}</h3>
							</div>

							<div className="flex min-h-80 items-center justify-center p-4">
								<div className="text-center">
									<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-background text-muted-foreground">
										<LayoutPanelTop aria-hidden="true" size={20} />
									</div>

									<p className="mt-3 text-sm font-medium text-foreground">
										No tasks yet
									</p>

									<p className="mt-1 text-xs text-muted-foreground">
										Tasks added to this stage will appear here.
									</p>
								</div>
							</div>
						</section>
					))}
				</div>
			</section>
		</div>
	);
}
