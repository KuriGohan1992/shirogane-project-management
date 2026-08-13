"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { Button } from "@/components/ui/button";

type CreateTaskButtonProps = {
	stageId: string;
	stageName: string;
};

export function CreateTaskButton({
	stageId,
	stageName,
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
					stageId={stageId}
					stageName={stageName}
					open={isOpen}
					onOpenChange={setIsOpen}
				/>
			)}
		</>
	);
}
