"use client";

import { Circle, CircleCheckBig } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useState, useTransition } from "react";

import { setTaskCompletedState } from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";

type TaskCompletionToggleProps = {
	taskId: string;
	completed: boolean;
	canManage: boolean;
	compact?: boolean;
};

export function TaskCompletionToggle({
	taskId,
	completed,
	canManage,
	compact = false,
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
					"inline-flex shrink-0 items-center justify-center text-emerald-600 dark:text-emerald-400",
					compact ? "size-6" : "size-8",
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

			const result = await setTaskCompletedState(taskId, nextCompleted);

			if (!result.success) {
				console.error(result.message ?? "The task could not be updated.");
				router.refresh();
				return;
			}

			setConfirmedCompleted(nextCompleted);
			router.refresh();
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
				"group/completion inline-flex shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-70",
				compact ? "size-6" : "size-8",
				optimisticCompleted
					? "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
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
