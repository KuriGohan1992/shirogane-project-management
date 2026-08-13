// TODO: Add Zustand state and dnd-kit task/stage reordering.

import { StageColumn } from "@/components/stage-column";
import type { StageWithTasks } from "@/types/task";

type KanbanBoardProps = {
	stages: StageWithTasks[];
};

export function KanbanBoard({ stages }: KanbanBoardProps) {
	return (
		<div className="flex items-start gap-4 overflow-x-auto pb-4">
			{stages.map((stage) => (
				<StageColumn key={stage.id} stage={stage} />
			))}
		</div>
	);
}
