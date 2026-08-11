"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { Button } from "@/components/ui/button";

type CreateProjectButtonProps = {
	label?: string;
};

export function CreateProjectButton({
	label = "New Project",
}: CreateProjectButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<Button type="button" onClick={() => setIsOpen(true)}>
				<Plus aria-hidden="true" />
				{label}
			</Button>

			{isOpen && <CreateProjectModal open={isOpen} onOpenChange={setIsOpen} />}
		</>
	);
}
