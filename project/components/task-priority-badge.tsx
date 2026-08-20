import type { Task } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type TaskPriorityBadgeProps = {
	priority: NonNullable<Task["priority"]>;
	className?: string;
};

function getPriorityClasses(priority: NonNullable<Task["priority"]>) {
	switch (priority) {
		case "low":
			return "rounded-full bg-sky-500 text-white";

		case "medium":
			return "rounded-lg bg-amber-600 text-white";

		case "high":
			return "rounded-sm bg-orange-500 text-white";

		case "urgent":
			return "rounded-xs bg-red-500 text-white";
	}
}

export function TaskPriorityBadge({
	priority,
	className,
}: TaskPriorityBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex w-fit items-center px-2 py-0.5 text-xs font-semibold capitalize",
				getPriorityClasses(priority),
				className,
			)}
		>
			{priority}
		</span>
	);
}
