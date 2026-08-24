"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import {
	Dialog,
	DialogClose,
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

	function handleOpenChange(open: boolean) {
		if (open) {
			return;
		}

		if (closeHref) {
			router.replace(closeHref);
			return;
		}

		router.back();
	}

	return (
		<Dialog open onOpenChange={handleOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="max-h-[90vh] w-[min(1180px,calc(100vw-2rem))] max-w-none gap-0 overflow-hidden border-0 bg-background p-0 shadow-2xl sm:max-w-none"
			>
				<DialogHeader className="sr-only">
					<DialogTitle>{taskTitle}</DialogTitle>

					<DialogDescription>View and manage the task.</DialogDescription>
				</DialogHeader>

				<DialogClose className="absolute right-4 top-4 z-30 inline-flex size-8 items-center justify-center rounded-md text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50">
					<X aria-hidden="true" className="size-4" />
					<span className="sr-only">Close</span>
				</DialogClose>

				{children}
			</DialogContent>
		</Dialog>
	);
}