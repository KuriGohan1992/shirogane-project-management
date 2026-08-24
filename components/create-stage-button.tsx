"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { CreateStageModal } from "@/components/modals/create-stage-modal";
import { Button } from "@/components/ui/button";

type CreateStageButtonProps = {
	projectId: string;
};

export function CreateStageButton({ projectId }: CreateStageButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="w-[min(20rem,85vw)] shrink-0">
			<Button
				type="button"
				variant="outline"
				className="h-12 w-full justify-start border-dashed text-muted-foreground"
				onClick={() => setIsOpen(true)}
			>
				<Plus aria-hidden="true" />
				Add stage
			</Button>

			{isOpen && (
				<CreateStageModal
					projectId={projectId}
					open={isOpen}
					onOpenChange={setIsOpen}
				/>
			)}
		</div>
	);
}
