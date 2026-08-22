"use client";

import {
	ArrowUpDown,
	FolderPlus,
	Search,
	SearchX,
	SlidersHorizontal,
	X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CreateProjectButton } from "@/components/create-project-button";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { COLOR_OPTIONS } from "@/lib/constants/colors";
import { SEARCH_LIMITS } from "@/lib/constants/search";
import {
	getDefaultProjectSortDirection,
	matchesProjectScheduleFilter,
	matchesProjectStatusFilter,
	PROJECT_FILTER_DEFAULTS,
	PROJECT_FILTER_PARAMS,
	type ProjectSortOption,
	parseProjectAccessFilter,
	parseProjectColorFilter,
	parseProjectScheduleFilter,
	parseProjectSortDirection,
	parseProjectSortOption,
	parseProjectStatusFilter,
	sortProjects,
} from "@/lib/project-filters";
import type { ProjectWithAccess } from "@/types/project";

type ProjectGridProps = {
	projects: ProjectWithAccess[];
};

function replaceProjectFilterUrl(params: URLSearchParams) {
	const queryString = params.toString();

	const nextUrl = `${window.location.pathname}${
		queryString ? `?${queryString}` : ""
	}${window.location.hash}`;

	window.history.replaceState(null, "", nextUrl);
}

function updateProjectFilterParam(
	key: string,
	value: string,
	defaultValue: string,
) {
	const params = new URLSearchParams(window.location.search);

	if (value === defaultValue) {
		params.delete(key);
	} else {
		params.set(key, value);
	}

	replaceProjectFilterUrl(params);
}

export function ProjectGrid({ projects }: ProjectGridProps) {
	const searchParams = useSearchParams();

	const urlQuery =
		searchParams
			.get(PROJECT_FILTER_PARAMS.query)
			?.slice(0, SEARCH_LIMITS.maxQueryLength) ?? "";

	const accessFilter = parseProjectAccessFilter(
		searchParams.get(PROJECT_FILTER_PARAMS.access),
	);

	const colorFilter = parseProjectColorFilter(
		searchParams.get(PROJECT_FILTER_PARAMS.color),
	);

	const statusFilter = parseProjectStatusFilter(
		searchParams.get(PROJECT_FILTER_PARAMS.status),
	);

	const scheduleFilter = parseProjectScheduleFilter(
		searchParams.get(PROJECT_FILTER_PARAMS.dates),
	);

	const sort = parseProjectSortOption(
		searchParams.get(PROJECT_FILTER_PARAMS.sort),
	);

	const sortDirection = parseProjectSortDirection(
		searchParams.get(PROJECT_FILTER_PARAMS.order),
		sort,
	);

	const [queryInput, setQueryInput] = useState(urlQuery);

	const normalizedQuery = queryInput.trim().toLocaleLowerCase("en-US");

	const hasFilters =
		normalizedQuery.length > 0 ||
		accessFilter !== PROJECT_FILTER_DEFAULTS.access ||
		colorFilter !== PROJECT_FILTER_DEFAULTS.color ||
		statusFilter !== PROJECT_FILTER_DEFAULTS.status ||
		scheduleFilter !== PROJECT_FILTER_DEFAULTS.dates;

	// Keep the controlled input synchronized with bookmarked or shared URLs.
	useEffect(() => {
		setQueryInput(urlQuery);
	}, [urlQuery]);

	// Keep filtering instant while writing the shareable keyword to the URL after typing settles.
	useEffect(() => {
		if (queryInput === urlQuery) {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			const params = new URLSearchParams(window.location.search);

			const query = queryInput.trim();

			if (query.length === 0) {
				params.delete(PROJECT_FILTER_PARAMS.query);
			} else {
				params.set(PROJECT_FILTER_PARAMS.query, query);
			}

			replaceProjectFilterUrl(params);
		}, SEARCH_LIMITS.debounceMs);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [queryInput, urlQuery]);

	const visibleProjects = useMemo(() => {
		const filteredProjects = projects.filter((project) => {
			const description = project.description?.toLocaleLowerCase("en-US") ?? "";

			const name = project.name.toLocaleLowerCase("en-US");

			const matchesQuery =
				normalizedQuery.length === 0 ||
				name.includes(normalizedQuery) ||
				description.includes(normalizedQuery);

			const matchesAccess =
				accessFilter === PROJECT_FILTER_DEFAULTS.access ||
				project.accessRole === accessFilter;

			const matchesColor =
				colorFilter === PROJECT_FILTER_DEFAULTS.color ||
				project.color === colorFilter;

			return (
				matchesQuery &&
				matchesAccess &&
				matchesColor &&
				matchesProjectStatusFilter(project, statusFilter) &&
				matchesProjectScheduleFilter(project, scheduleFilter)
			);
		});

		return sortProjects(filteredProjects, sort, sortDirection);
	}, [
		projects,
		normalizedQuery,
		accessFilter,
		colorFilter,
		statusFilter,
		scheduleFilter,
		sort,
		sortDirection,
	]);

	function handleSortChange(nextSort: ProjectSortOption) {
		const params = new URLSearchParams(window.location.search);

		if (nextSort === PROJECT_FILTER_DEFAULTS.sort) {
			params.delete(PROJECT_FILTER_PARAMS.sort);
		} else {
			params.set(PROJECT_FILTER_PARAMS.sort, nextSort);
		}

		// Each sort type starts with the direction that makes the most sense for it.
		params.delete(PROJECT_FILTER_PARAMS.order);

		replaceProjectFilterUrl(params);
	}

	function toggleSortDirection() {
		const nextDirection = sortDirection === "asc" ? "desc" : "asc";

		const defaultDirection = getDefaultProjectSortDirection(sort);

		const params = new URLSearchParams(window.location.search);

		if (nextDirection === defaultDirection) {
			params.delete(PROJECT_FILTER_PARAMS.order);
		} else {
			params.set(PROJECT_FILTER_PARAMS.order, nextDirection);
		}

		replaceProjectFilterUrl(params);
	}

	function clearFilters() {
		const params = new URLSearchParams(window.location.search);

		params.delete(PROJECT_FILTER_PARAMS.query);

		params.delete(PROJECT_FILTER_PARAMS.access);

		params.delete(PROJECT_FILTER_PARAMS.color);

		params.delete(PROJECT_FILTER_PARAMS.status);

		params.delete(PROJECT_FILTER_PARAMS.dates);

		setQueryInput("");

		replaceProjectFilterUrl(params);
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

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 xl:flex-row xl:items-center">
				<div className="relative min-w-0 flex-1 xl:max-w-sm">
					<Search
						aria-hidden="true"
						size={16}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
					/>

					<input
						data-keyboard-action="project-filter"
						type="search"
						value={queryInput}
						maxLength={SEARCH_LIMITS.maxQueryLength}
						onChange={(event) => setQueryInput(event.target.value)}
						aria-label="Filter projects by name or description"
						placeholder="Filter projects..."
						className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
					/>

					{queryInput.length > 0 && (
						<button
							type="button"
							onClick={() => setQueryInput("")}
							aria-label="Clear project keyword filter"
							className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						>
							<X aria-hidden="true" size={14} />
						</button>
					)}
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Select
						value={accessFilter}
						onValueChange={(value) =>
							updateProjectFilterParam(
								PROJECT_FILTER_PARAMS.access,
								value,
								PROJECT_FILTER_DEFAULTS.access,
							)
						}
					>
						<SelectTrigger size="sm" aria-label="Filter projects by access">
							<SelectValue />
						</SelectTrigger>

						<SelectContent>
							<SelectItem value="all">All access</SelectItem>

							<SelectItem value="owner">Owner</SelectItem>

							<SelectItem value="member">Member</SelectItem>

							<SelectItem value="viewer">Viewer</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={statusFilter}
						onValueChange={(value) =>
							updateProjectFilterParam(
								PROJECT_FILTER_PARAMS.status,
								value,
								PROJECT_FILTER_DEFAULTS.status,
							)
						}
					>
						<SelectTrigger size="sm" aria-label="Filter projects by status">
							<SelectValue />
						</SelectTrigger>

						<SelectContent>
							<SelectItem value="all">All projects</SelectItem>

							<SelectItem value="active">Active</SelectItem>

							<SelectItem value="completed">Completed</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={colorFilter}
						onValueChange={(value) =>
							updateProjectFilterParam(
								PROJECT_FILTER_PARAMS.color,
								value,
								PROJECT_FILTER_DEFAULTS.color,
							)
						}
					>
						<SelectTrigger size="sm" aria-label="Filter projects by color">
							<SelectValue />
						</SelectTrigger>

						<SelectContent>
							<SelectItem value="all">All colors</SelectItem>

							{COLOR_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									<span
										aria-hidden="true"
										className="size-2.5 rounded-full"
										style={{
											backgroundColor: option.hex,
										}}
									/>

									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={scheduleFilter}
						onValueChange={(value) =>
							updateProjectFilterParam(
								PROJECT_FILTER_PARAMS.dates,
								value,
								PROJECT_FILTER_DEFAULTS.dates,
							)
						}
					>
						<SelectTrigger size="sm" aria-label="Filter projects by dates">
							<SelectValue />
						</SelectTrigger>

						<SelectContent>
							<SelectItem value="all">All dates</SelectItem>

							<SelectItem value="no-dates">No project dates</SelectItem>

							<SelectItem value="overdue">Overdue</SelectItem>

							<SelectItem value="due-next-7-days">
								Due in next 7 days
							</SelectItem>
						</SelectContent>
					</Select>

					<div className="flex items-center gap-1">
						<Select
							value={sort}
							onValueChange={(value) =>
								handleSortChange(parseProjectSortOption(value))
							}
						>
							<SelectTrigger size="sm" aria-label="Sort projects by">
								<SlidersHorizontal aria-hidden="true" size={14} />

								<SelectValue />
							</SelectTrigger>

							<SelectContent>
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
							className="w-9 px-0"
							onClick={toggleSortDirection}
							aria-label={
								sortDirection === "asc" ? "Sort descending" : "Sort ascending"
							}
							title={
								sortDirection === "asc" ? "Sort descending" : "Sort ascending"
							}
						>
							<ArrowUpDown aria-hidden="true" size={15} />
						</Button>
					</div>

					<Button
						type="button"
						variant="ghost"
						size="sm"
						disabled={!hasFilters}
						onClick={clearFilters}
					>
						Clear filters
					</Button>
				</div>
			</div>

			{hasFilters && (
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
						Try changing the keyword, access, color, or date filters.
					</p>

					<Button
						type="button"
						variant="outline"
						size="sm"
						className="mt-4"
						onClick={clearFilters}
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
