"use client";

import {
	ArrowUpDown,
	FolderPlus,
	SearchX,
	SlidersHorizontal,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { CreateProjectButton } from "@/components/create-project-button";
import { ProjectCard } from "@/components/project-card";
import { ProjectFilterControls } from "@/components/project-filter-controls";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useProjectFilters } from "@/hooks/use-project-filters";
import {
	getDefaultProjectSortDirection,
	PROJECT_FILTER_PARAMS,
	type ProjectSortOption,
	parseProjectSortDirection,
	parseProjectSortOption,
	sortProjects,
} from "@/lib/project-filters";
import type { ProjectWithAccess } from "@/types/project";

type ProjectGridProps = {
	projects: ProjectWithAccess[];
};

function replaceProjectGridUrl(params: URLSearchParams) {
	const queryString = params.toString();

	const nextUrl = `${window.location.pathname}${
		queryString ? `?${queryString}` : ""
	}${window.location.hash}`;

	window.history.replaceState(null, "", nextUrl);
}

export function ProjectGrid({ projects }: ProjectGridProps) {
	const searchParams = useSearchParams();

	const filters = useProjectFilters(projects);

	const rawSort = searchParams.get(PROJECT_FILTER_PARAMS.sort);

	const sort = parseProjectSortOption(rawSort);

	const sortDirection = parseProjectSortDirection(
		searchParams.get(PROJECT_FILTER_PARAMS.order),
		sort,
	);

	const visibleProjects = useMemo(
		() => sortProjects(filters.filteredProjects, sort, sortDirection),
		[filters.filteredProjects, sort, sortDirection],
	);

	function handleSortChange(nextSort: ProjectSortOption) {
		const params = new URLSearchParams(window.location.search);

		params.set(PROJECT_FILTER_PARAMS.sort, nextSort);

		params.delete(PROJECT_FILTER_PARAMS.order);

		replaceProjectGridUrl(params);
	}

	function toggleSortDirection() {
		const nextDirection = sortDirection === "asc" ? "desc" : "asc";

		const defaultDirection = getDefaultProjectSortDirection(sort);

		const params = new URLSearchParams(window.location.search);

		if (!rawSort) {
			params.set(PROJECT_FILTER_PARAMS.sort, sort);
		}

		if (nextDirection === defaultDirection) {
			params.delete(PROJECT_FILTER_PARAMS.order);
		} else {
			params.set(PROJECT_FILTER_PARAMS.order, nextDirection);
		}

		replaceProjectGridUrl(params);
	}

	if (projects.length === 0) {
		return (
			<div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 text-center">
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-primary dark:bg-primary/15">
					<FolderPlus aria-hidden="true" size={24} />
				</div>

				<h2 className="text-lg font-semibold text-foreground">
					No projects yet
				</h2>

				<p className="mt-2 max-w-sm text-sm text-muted-foreground">
					Create your first project to start organizing stages and tasks.
				</p>

				<div className="mt-5">
					<CreateProjectButton label="Create your first project" />
				</div>
			</div>
		);
	}

	const sortControls = (
		<div className="flex items-center gap-1">
			<Select
				value={rawSort ? sort : ""}
				onValueChange={(value) =>
					handleSortChange(parseProjectSortOption(value))
				}
			>
				<SelectTrigger
					size="sm"
					aria-label="Sort projects by"
					className="w-fit min-w-32 max-w-48 justify-start gap-2 bg-card text-left data-[placeholder]:text-foreground [&>span:first-child]:truncate [&>svg:last-child]:ml-auto"
				>
					<SlidersHorizontal aria-hidden="true" size={14} />

					<SelectValue placeholder="Sort by" />
				</SelectTrigger>

				<SelectContent position="popper" align="start" sideOffset={4}>
					<SelectItem value="last-activity">Last activity</SelectItem>

					<SelectItem value="date-created">Date created</SelectItem>

					<SelectItem value="due-date">Due date</SelectItem>

					<SelectItem value="name">Name</SelectItem>

					<SelectItem value="color">Color</SelectItem>
				</SelectContent>
			</Select>

			<Button
				type="button"
				variant="outline"
				size="sm"
				className="w-9 bg-card px-0"
				onClick={toggleSortDirection}
				aria-label={
					sortDirection === "asc" ? "Sort descending" : "Sort ascending"
				}
				title={sortDirection === "asc" ? "Sort descending" : "Sort ascending"}
			>
				<ArrowUpDown aria-hidden="true" size={15} />
			</Button>
		</div>
	);

	return (
		<div className="space-y-4">
			<ProjectFilterControls
				query={filters.queryInput}
				onQueryChange={filters.setQueryInput}
				accessFilter={filters.accessFilter}
				onAccessFilterChange={filters.setAccessFilter}
				statusFilter={filters.statusFilter}
				defaultStatus={filters.defaultStatus}
				onStatusFilterChange={filters.setStatusFilter}
				colorFilter={filters.colorFilter}
				onColorFilterChange={filters.setColorFilter}
				scheduleFilter={filters.scheduleFilter}
				onScheduleFilterChange={filters.setScheduleFilter}
				hasFilters={filters.hasFilters}
				onClearFilters={filters.clearFilters}
				trailingControls={sortControls}
			/>

			{filters.hasFilters && (
				<p className="text-sm text-muted-foreground">
					{visibleProjects.length} of {projects.length} projects shown
				</p>
			)}

			{visibleProjects.length === 0 ? (
				<div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 text-center">
					<div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
						<SearchX aria-hidden="true" size={21} />
					</div>

					<h2 className="text-base font-semibold text-foreground">
						No projects match these filters
					</h2>

					<p className="mt-2 max-w-sm text-sm text-muted-foreground">
						Try changing the keyword, access, status, color, or date filters.
					</p>

					<Button
						type="button"
						variant="outline"
						size="sm"
						className="mt-4"
						onClick={filters.clearFilters}
					>
						Clear filters
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
					{visibleProjects.map((project) => (
						<ProjectCard key={project.id} project={project} />
					))}
				</div>
			)}
		</div>
	);
}
