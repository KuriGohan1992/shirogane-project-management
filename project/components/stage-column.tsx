import { CreateTaskButton } from "@/components/create-task-button";
import { StageActions } from "@/components/stage-actions";
import { TaskCard } from "@/components/task-card";
import type { AssignmentCandidate } from "@/types/member";
import type { StageWithTasks } from "@/types/stage";

type StageColumnProps = {
	stage: StageWithTasks;
	canMoveLeft: boolean;
	canMoveRight: boolean;
	assigneeCandidates: AssignmentCandidate[];
};

export function StageColumn({
	stage,
	canMoveLeft,
	canMoveRight,
	assigneeCandidates,
}: StageColumnProps) {
	return (
		<section className="w-[min(20rem,85vw)] shrink-0 rounded-xl border border-border bg-muted/40">
			<div className="flex items-center gap-2 border-b border-border px-4 py-3">
				<h3 className="min-w-0 flex-1 truncate font-semibold text-foreground">
					{stage.name}
				</h3>

				<span className="shrink-0 rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
					{stage.tasks.length}
				</span>

				<StageActions
					stage={{
						id: stage.id,
						name: stage.name,
					}}
					canMoveLeft={canMoveLeft}
					canMoveRight={canMoveRight}
				/>
			</div>

			<div className="space-y-3 p-3">
				{stage.tasks.length === 0 ? (
					<div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border px-4 text-center">
						<p className="text-xs text-muted-foreground">
							No tasks in this stage.
						</p>
					</div>
				) : (
					stage.tasks.map((task) => (
						<TaskCard
							key={task.id}
							task={task}
							assigneeCandidates={assigneeCandidates}
						/>
					))
				)}

				<CreateTaskButton stageId={stage.id} stageName={stage.name} />
			</div>
		</section>
	);
}
