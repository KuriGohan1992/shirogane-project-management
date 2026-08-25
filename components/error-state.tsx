import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ErrorStateProps = {
	illustrationSrc: string;
	title: string;
	description: ReactNode;
	action?: ReactNode;
	secondaryAction?: ReactNode;
	className?: string;
	illustrationClassName?: string;
	compact?: boolean;
};

export function ErrorState({
	illustrationSrc,
	title,
	description,
	action,
	secondaryAction,
	className,
	illustrationClassName,
	compact = false,
}: ErrorStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center px-6 text-center",
				compact ? "min-h-80 py-6" : "min-h-[calc(100vh-8rem)] py-10",
				className,
			)}
		>
			<div
				aria-hidden="true"
				className={cn(
					"mb-4",
					compact ? "w-48 sm:w-56" : "w-64 sm:w-72 lg:w-80",
					illustrationClassName,
				)}
			>
				<Image
					src={illustrationSrc}
					alt=""
					width={320}
					height={320}
					unoptimized
					className="h-auto w-full object-contain"
				/>
			</div>

			<h1
				className={cn(
					"font-bold text-foreground",
					compact ? "text-xl" : "text-2xl",
				)}
			>
				{title}
			</h1>

			<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
				{description}
			</p>

			{(action || secondaryAction) && (
				<div className="mt-5 flex flex-wrap items-center justify-center gap-2">
					{action}
					{secondaryAction}
				</div>
			)}
		</div>
	);
}
