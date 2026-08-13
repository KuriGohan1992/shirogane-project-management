// TODO: Add Zustand state and dnd-kit drag-and-drop
// for task movement and direct stage dragging.

import { CreateStageButton } from "@/components/create-stage-button";
import { StageColumn } from "@/components/stage-column";
import type { StageWithTasks } from "@/types/stage";

type KanbanBoardProps = {
	projectId: string;
	stages: StageWithTasks[];
};

export function KanbanBoard({ projectId, stages }: KanbanBoardProps) {
	return (
		<div className="flex min-h-[calc(100vh-22rem)] items-start gap-4 overflow-x-auto pb-4">
			{stages.map((stage, index) => (
				<StageColumn
					key={stage.id}
					stage={stage}
					canMoveLeft={index > 0}
					canMoveRight={index < stages.length - 1}
				/>
			))}

			<CreateStageButton projectId={projectId} />
		</div>
	);
}
