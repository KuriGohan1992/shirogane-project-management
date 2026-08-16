"use client";

// TODO: Add dnd-kit drag-and-drop and useOptimistic updates for
// direct stage dragging and task movement in the next board phase.

import {
	BoardStoreProvider,
	useBoardStore,
} from "@/components/board-store-provider";
import { CreateStageButton } from "@/components/create-stage-button";
import { StageColumn } from "@/components/stage-column";
import type { ProjectPermissions } from "@/lib/auth/project-permissions";
import type { AssignmentCandidate } from "@/types/member";
import type { StageWithTasks } from "@/types/stage";

type KanbanBoardProps = {
	projectId: string;
	stages: StageWithTasks[];
	assigneeCandidates: AssignmentCandidate[];
	permissions: ProjectPermissions;
};

type KanbanBoardContentProps = {
	projectId: string;
	assigneeCandidates: AssignmentCandidate[];
	permissions: ProjectPermissions;
};

function KanbanBoardContent({
	projectId,
	assigneeCandidates,
	permissions,
}: KanbanBoardContentProps) {
	const stages = useBoardStore((state) => state.stages);

	return (
		<div className="flex min-h-[calc(100vh-22rem)] items-start gap-4 overflow-x-auto pb-4">
			{stages.map((stage, index) => (
				<StageColumn
					key={stage.id}
					stage={stage}
					canMoveLeft={index > 0}
					canMoveRight={index < stages.length - 1}
					assigneeCandidates={assigneeCandidates}
					permissions={permissions}
				/>
			))}

			{permissions.canManageStages && (
				<CreateStageButton projectId={projectId} />
			)}
		</div>
	);
}

export function KanbanBoard({
	projectId,
	stages,
	assigneeCandidates,
	permissions,
}: KanbanBoardProps) {
	return (
		<BoardStoreProvider key={projectId} serverStages={stages}>
			<KanbanBoardContent
				projectId={projectId}
				assigneeCandidates={assigneeCandidates}
				permissions={permissions}
			/>
		</BoardStoreProvider>
	);
}
