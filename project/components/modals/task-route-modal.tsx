"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type TaskRouteModalProps = {
	taskTitle: string;
	children: ReactNode;
	closeHref?: string;
};

export function TaskRouteModal({
	taskTitle,
	children,
	closeHref,
}: TaskRouteModalProps) {
	const router = useRouter();

	function closeModal() {
		if (closeHref) {
			router.replace(closeHref);
			return;
		}

		router.back();
	}

	return (
		<Dialog
			open
			onOpenChange={(open) => {
				if (!open) {
					closeModal();
				}
			}}
		>
			<DialogContent
				showCloseButton
				className="max-h-[90vh] w-[min(1180px,calc(100vw-2rem))] max-w-none gap-0 overflow-y-auto border-border/80 bg-background p-0 shadow-2xl sm:max-w-none"
			>
				<DialogHeader className="sr-only">
					<DialogTitle>{taskTitle}</DialogTitle>

					<DialogDescription>View and manage the task.</DialogDescription>
				</DialogHeader>

				{children}
			</DialogContent>
		</Dialog>
	);
}
