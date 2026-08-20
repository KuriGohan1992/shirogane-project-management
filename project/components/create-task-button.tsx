"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { Button } from "@/components/ui/button";
import type { ProjectLabel } from "@/lib/db/schema";

type CreateTaskButtonProps = {
	projectId: string;
	stageId: string;
	stageName: string;
	labelCandidates: ProjectLabel[];
};

export function CreateTaskButton({
	projectId,
	stageId,
	stageName,
	labelCandidates,
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
					open={isOpen}
					onOpenChange={setIsOpen}
				/>
			)}
		</>
	);
}
