import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
	illustrationSrc: string;
	title: string;
	description: ReactNode;
	action?: ReactNode;
	className?: string;
	illustrationClassName?: string;
};

export function EmptyState({
	illustrationSrc,
	title,
	description,
	action,
	className,
	illustrationClassName,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center px-6 py-10 text-center",
				className,
			)}
		>
			<div
				aria-hidden="true"
				className={cn("mb-4 w-64 sm:w-72 lg:w-80", illustrationClassName)}
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

			<h2 className="text-xl font-bold text-foreground">{title}</h2>

			<p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
				{description}
			</p>

			{action && <div className="mt-5">{action}</div>}
		</div>
	);
}
