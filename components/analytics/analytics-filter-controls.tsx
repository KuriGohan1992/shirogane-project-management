"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ANALYTICS_PERIOD_OPTIONS,
	type AnalyticsPeriod,
	DEFAULT_ANALYTICS_PERIOD,
} from "@/lib/analytics";
import type { AnalyticsProjectOption } from "@/types/analytics";

type AnalyticsFilterControlsProps = {
	period: AnalyticsPeriod;
	projectId: string | null;
	projects: AnalyticsProjectOption[];
};

export function AnalyticsFilterControls({
	period,
	projectId,
	projects,
}: AnalyticsFilterControlsProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [isPending, startTransition] = useTransition();

	function updateFilters(
		updates: Partial<{
			period: AnalyticsPeriod;
			projectId: string | null;
		}>,
	) {
		const params = new URLSearchParams(searchParams.toString());

		if (updates.period !== undefined) {
			if (updates.period === DEFAULT_ANALYTICS_PERIOD) {
				params.delete("period");
			} else {
				params.set("period", updates.period);
			}
		}

		if (updates.projectId !== undefined) {
			if (updates.projectId) {
				params.set("projectId", updates.projectId);
			} else {
				params.delete("projectId");
			}
		}

		const query = params.toString();

		startTransition(() => {
			router.replace(query ? `${pathname}?${query}` : pathname, {
				scroll: false,
			});
		});
	}

	return (
		<div className="flex flex-nowrap items-center justify-end gap-2">
			<Select
				value={period}
				disabled={isPending}
				onValueChange={(value) =>
					updateFilters({
						period: value as AnalyticsPeriod,
					})
				}
			>
				<SelectTrigger
					size="sm"
					aria-label="Analytics period"
					className="w-fit min-w-32 shrink-0 bg-card"
				>
					<SelectValue />
				</SelectTrigger>

				<SelectContent position="popper" align="end">
					{ANALYTICS_PERIOD_OPTIONS.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={projectId ?? "all"}
				disabled={isPending || projects.length === 0}
				onValueChange={(value) =>
					updateFilters({
						projectId: value === "all" ? null : value,
					})
				}
			>
				<SelectTrigger
					size="sm"
					aria-label="Analytics project"
					className="w-fit min-w-36 max-w-64 shrink-0 bg-card [&>span]:truncate"
				>
					<SelectValue placeholder="All projects" />
				</SelectTrigger>

				<SelectContent position="popper" align="end">
					<SelectItem value="all">All projects</SelectItem>

					{projects.map((project) => (
						<SelectItem key={project.id} value={project.id}>
							{project.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
