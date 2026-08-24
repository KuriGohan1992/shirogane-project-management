"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { Button } from "@/components/ui/button";
import type { ProjectLabel } from "@/lib/db/schema";
import type { AssignmentCandidate } from "@/types/member";

type CreateTaskButtonProps = {
	projectId: string;
	stageId: string;
	stageName: string;
	labelCandidates: ProjectLabel[];
	assigneeCandidates: AssignmentCandidate[];
};

export function CreateTaskButton({
	projectId,
	stageId,
	stageName,
	labelCandidates,
	assigneeCandidates,
}: CreateTaskButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<Button
				type="button"
				variant="ghost"
				className="w-full justify-start text-muted-foreground"
				onClick={() => setIsOpen(true)}
			>
				<Plus aria-hidden="true" />
				Add task
			</Button>

			{isOpen && (
				<CreateTaskModal
					projectId={projectId}
					stageId={stageId}
					stageName={stageName}
					labelCandidates={labelCandidates}
					assigneeCandidates={assigneeCandidates}
					open={isOpen}
					onOpenChange={setIsOpen}
				/>
			)}
		</>
	);
}
