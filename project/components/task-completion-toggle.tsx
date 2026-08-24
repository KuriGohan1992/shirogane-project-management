"use client";

import { Circle, CircleCheckBig } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { setTaskCompletedState } from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";

type TaskCompletionToggleProps = {
	taskId: string;
	completed: boolean;
	canManage: boolean;
	compact?: boolean;
    onPrimary?: boolean;
};

export function TaskCompletionToggle({
	taskId,
	completed,
	canManage,
	compact = false,
    onPrimary,
}: TaskCompletionToggleProps) {
	const router = useRouter();

	const [confirmedCompleted, setConfirmedCompleted] = useState(completed);

	const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
		confirmedCompleted,
		(_currentCompleted, nextCompleted: boolean) => nextCompleted,
	);

	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		setConfirmedCompleted(completed);
	}, [completed]);

	if (!canManage) {
		if (!completed) {
			return null;
		}

		return (
			<span
				title="Completed"
className={cn(
	"inline-flex shrink-0 items-center justify-center",
	compact ? "size-6" : "size-8",
	onPrimary
		? "text-primary-foreground"
		: "text-emerald-600 dark:text-emerald-400",
)}
			>
				<CircleCheckBig
					aria-hidden="true"
					className={compact ? "size-4" : "size-5"}
				/>

				<span className="sr-only">Completed</span>
			</span>
		);
	}

	function handleToggle() {
		const nextCompleted = !optimisticCompleted;

		startTransition(async () => {
			setOptimisticCompleted(nextCompleted);

			try {
				const result = await setTaskCompletedState(taskId, nextCompleted);

				if (!result.success) {
					toast.error(
						"Your access or the task may have changed. The page was refreshed.",
					);

					router.refresh();

					return;
				}

				setConfirmedCompleted(nextCompleted);

				router.refresh();
			} catch (error) {
				console.error("Failed to update task completion:", error);

				toast.error("The task could not be updated. The page was refreshed.");

				router.refresh();
			}
		});
	}

	return (
		<button
			type="button"
			disabled={isPending}
			aria-pressed={optimisticCompleted}
			aria-label={optimisticCompleted ? "Reopen task" : "Mark task complete"}
			title={optimisticCompleted ? "Reopen task" : "Mark task complete"}
			onClick={handleToggle}
className={cn(
	"group/completion inline-flex shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-wait disabled:opacity-70",
	compact ? "size-6" : "size-8",
	onPrimary
		? "focus-visible:ring-primary-foreground/50"
		: "focus-visible:ring-ring",
	optimisticCompleted
		? onPrimary
			? "text-primary-foreground hover:bg-primary-foreground/10"
			: "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
		: onPrimary
			? "text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground"
			: "text-muted-foreground hover:bg-muted hover:text-foreground",
)}
		>
			{optimisticCompleted ? (
				<CircleCheckBig
					aria-hidden="true"
					className={compact ? "size-4" : "size-5"}
				/>
			) : (
				<Circle
					aria-hidden="true"
					className={cn(
						compact ? "size-4" : "size-5",
						"transition-[stroke-width] group-hover/completion:[stroke-width:2.5]",
					)}
				/>
			)}
		</button>
	);
}
