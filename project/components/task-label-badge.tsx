import { getColorHex } from "@/lib/constants/colors";
import type { ProjectLabel } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type TaskLabelBadgeProps = {
	label: ProjectLabel;
	className?: string;
};

export function TaskLabelBadge({ label, className }: TaskLabelBadgeProps) {
	const color = getColorHex(label.color);

	return (
		<span
			className={cn(
				"inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium text-foreground",
				className,
			)}
			style={{
				borderColor: `${color}66`,
				backgroundColor: `${color}18`,
			}}
		>
			<span
				aria-hidden="true"
				className="size-2 shrink-0 rounded-full"
				style={{ backgroundColor: color }}
			/>

			<span className="truncate">{label.name}</span>
		</span>
	);
}
