import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type ShiroBrandProps = {
	className?: string;
	priority?: boolean;
};

export function ShiroBrand({ className, priority = false }: ShiroBrandProps) {
	return (
		<Link
			href="/"
			aria-label="Shiro home"
			className={cn("flex items-center gap-0.75", className)}
		>
			<Image
				src="/shiro-logo.png"
				alt=""
				width={36}
				height={36}
				priority={priority}
				className="shrink-0"
			/>

			<span className="text-2xl font-bold text-foreground">Shiro</span>
		</Link>
	);
}
