"use client";

import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getColorHex } from "@/lib/constants/colors";
import type { AnalyticsProjectProgress } from "@/types/analytics";

type ProjectProgressPanelProps = {
	projects: AnalyticsProjectProgress[];
};

export function ProjectProgressPanel({ projects }: ProjectProgressPanelProps) {
	const [sortAscending, setSortAscending] = useState(false);
	const [showCompleted, setShowCompleted] = useState(false);

	const visibleProjects = useMemo(() => {
		const filteredProjects = showCompleted
			? projects
			: projects.filter((project) => project.completionRate < 100);

		return [...filteredProjects].sort((left, right) => {
			const progressDifference = sortAscending
				? left.completionRate - right.completionRate
				: right.completionRate - left.completionRate;

			return progressDifference || left.name.localeCompare(right.name);
		});
	}, [projects, showCompleted, sortAscending]);

	return (
		<section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
			<div className="flex shrink-0 items-center gap-2 border-b border-primary bg-primary px-5 py-3 text-primary-foreground">
				<h2 className="text-lg font-bold">Project progress</h2>

				<button
					type="button"
					onClick={() => setSortAscending((current) => !current)}
					aria-label={
						sortAscending
							? "Sort progress descending"
							: "Sort progress ascending"
					}
					title={
						sortAscending
							? "Sort progress descending"
							: "Sort progress ascending"
					}
					className="group/sort inline-flex items-center justify-center text-primary-foreground/80 transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
				>
					<ArrowUpDown
						aria-hidden="true"
						className="size-5 transition-transform duration-100 group-hover/sort:scale-110 group-hover/sort:[stroke-width:2]"
						strokeWidth={2}
					/>
				</button>

				<div className="ml-auto flex shrink-0 items-center gap-2">
					<Label
						htmlFor="analytics-show-completed"
						className="cursor-pointer text-sm font-medium text-primary-foreground"
					>
						Show completed
					</Label>

					<Checkbox
						id="analytics-show-completed"
						checked={showCompleted}
						onCheckedChange={(checked) => setShowCompleted(checked === true)}
						className="border-primary-foreground/60 data-[state=checked]:border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
					/>
				</div>
			</div>

			<div className="scrollbar-thin min-h-0 max-h-[25rem] flex-1 overflow-y-auto px-4 xl:max-h-none">
				{visibleProjects.length === 0 ? (
					<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
						{showCompleted
							? "No projects to show."
							: "All projects are completed."}
					</div>
				) : (
					<div className="divide-y divide-border">
						{visibleProjects.map((project) => (
							<div key={project.id} className="py-3 first:pt-3 last:pb-3">
								<div className="mb-2 flex min-w-0 items-start gap-3">
									<span
										aria-hidden="true"
										className="mt-1 size-2.5 shrink-0 rounded-full"
										style={{
											backgroundColor: getColorHex(project.color),
										}}
									/>

									<div className="min-w-0 flex-1">
										<Link
											href={`/projects/${project.id}`}
											className="block truncate text-sm font-semibold text-foreground underline-offset-2 hover:underline"
										>
											{project.name}
										</Link>

										<p className="mt-0.5 text-xs text-muted-foreground">
											{project.completedTasks}/{project.totalTasks} complete
											{project.overdueTasks > 0 &&
												` · ${project.overdueTasks} overdue`}
										</p>
									</div>

									<span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
										{project.completionRate}%
									</span>
								</div>

								<div
									role="progressbar"
									aria-label={`${project.name} completion`}
									aria-valuenow={project.completionRate}
									aria-valuemin={0}
									aria-valuemax={100}
									className="h-2 overflow-hidden rounded-full bg-muted"
								>
									<div
										className="h-full rounded-full"
										style={{
											width: `${project.completionRate}%`,
											backgroundColor: getColorHex(project.color),
										}}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
