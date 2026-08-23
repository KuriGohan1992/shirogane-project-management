"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { Button } from "@/components/ui/button";

type CreateProjectButtonProps = {
	label?: string;
	keyboardShortcutTarget?: boolean;
};

export function CreateProjectButton({
	label = "New Project",
	keyboardShortcutTarget = false,
}: CreateProjectButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<Button
				type="button"
				data-keyboard-action={
					keyboardShortcutTarget ? "new-project" : undefined
				}
				onClick={() => setIsOpen(true)}
			>
				{label}
				<Plus aria-hidden="true" />
			</Button>

			{isOpen && <CreateProjectModal open={isOpen} onOpenChange={setIsOpen} />}
		</>
	);
}
