import { CreateTaskButton } from "@/components/create-task-button";
import { TaskCard } from "@/components/task-card";
import type { StageWithTasks } from "@/types/task";

type StageColumnProps = {
	stage: StageWithTasks;
};

export function StageColumn({ stage }: StageColumnProps) {
	return (
		<section className="w-[min(20rem,85vw)] shrink-0 rounded-xl border border-border bg-muted/40">
			<div className="flex items-center justify-between border-b border-border px-4 py-3">
				<h3 className="font-semibold text-foreground">{stage.name}</h3>

				<span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
					{stage.tasks.length}
				</span>
			</div>

			<div className="space-y-3 p-3">
				{stage.tasks.length === 0 ? (
					<div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border px-4 text-center">
						<p className="text-xs text-muted-foreground">
							No tasks in this stage.
						</p>
					</div>
				) : (
					stage.tasks.map((task) => <TaskCard key={task.id} task={task} />)
				)}

				<CreateTaskButton stageId={stage.id} stageName={stage.name} />
			</div>
		</section>
	);
}
