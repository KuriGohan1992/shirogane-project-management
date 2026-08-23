import { Search, X } from "lucide-react";
import type { ReactNode } from "react";

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
	PROJECT_FILTER_DEFAULTS,
	type ProjectAccessFilter,
	type ProjectColorFilter,
	type ProjectScheduleFilter,
	type ProjectStatusFilter,
	parseProjectAccessFilter,
	parseProjectColorFilter,
	parseProjectScheduleFilter,
	parseProjectStatusFilter,
} from "@/lib/project-filters";

type ProjectFilterControlsProps = {
	query: string;
	onQueryChange: (value: string) => void;

	accessFilter: ProjectAccessFilter;
	onAccessFilterChange: (value: ProjectAccessFilter) => void;

	statusFilter: ProjectStatusFilter;
	defaultStatus: ProjectStatusFilter;
	onStatusFilterChange: (value: ProjectStatusFilter) => void;

	colorFilter: ProjectColorFilter;
	onColorFilterChange: (value: ProjectColorFilter) => void;

	scheduleFilter: ProjectScheduleFilter;
	onScheduleFilterChange: (value: ProjectScheduleFilter) => void;

	hasFilters: boolean;
	onClearFilters: () => void;

	showScheduleFilter?: boolean;

	trailingControls?: ReactNode;

	utilityControls?: ReactNode;
	compactSearch?: boolean;
};

export function ProjectFilterControls({
	query,
	onQueryChange,

	accessFilter,
	onAccessFilterChange,

	statusFilter,
	defaultStatus,
	onStatusFilterChange,

	colorFilter,
	onColorFilterChange,

	scheduleFilter,
	onScheduleFilterChange,

	hasFilters,
	onClearFilters,

	showScheduleFilter = true,

	trailingControls,
	utilityControls,
	compactSearch = false,
}: ProjectFilterControlsProps) {
	const statusValue =
		defaultStatus === PROJECT_FILTER_DEFAULTS.status &&
		statusFilter === PROJECT_FILTER_DEFAULTS.status
			? ""
			: statusFilter;

	return (
		<div className="flex flex-col gap-3 xl:flex-row xl:items-center">
			{/* Search */}
			<div
				className={
					compactSearch
						? "relative w-full min-w-0 xl:w-[450px] xl:flex-none"
						: "relative w-full min-w-0 xl:flex-1"
				}
			>
				<Search
					aria-hidden="true"
					size={16}
					className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
				/>

				<input
					data-keyboard-action="project-filter"
					type="search"
					value={query}
					maxLength={SEARCH_LIMITS.maxQueryLength}
					onChange={(event) => onQueryChange(event.target.value)}
					aria-label="Filter projects by name or description"
					placeholder="Filter projects..."
					className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-9 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
				/>

				{query.length > 0 && (
					<button
						type="button"
						onClick={() => onQueryChange("")}
						aria-label="Clear project keyword filter"
						className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						<X aria-hidden="true" size={14} />
					</button>
				)}
			</div>

			{/* Actual filters */}
			<div className="flex flex-wrap items-center gap-2">
				<Select
					value={
						accessFilter === PROJECT_FILTER_DEFAULTS.access ? "" : accessFilter
					}
					onValueChange={(value) =>
						onAccessFilterChange(parseProjectAccessFilter(value))
					}
				>
					<SelectTrigger
						size="sm"
						aria-label="Filter projects by access"
						className="w-fit min-w-24 max-w-40 bg-card data-[placeholder]:text-foreground [&>span:first-child]:truncate"
					>
						<SelectValue placeholder="Access" />
					</SelectTrigger>

					<SelectContent position="popper" align="start" sideOffset={4}>
						<SelectItem value={PROJECT_FILTER_DEFAULTS.access}>All</SelectItem>

						<SelectItem value="owner">Owner</SelectItem>

						<SelectItem value="member">Member</SelectItem>

						<SelectItem value="viewer">Viewer</SelectItem>
					</SelectContent>
				</Select>

				<Select
					value={statusValue}
					onValueChange={(value) =>
						onStatusFilterChange(parseProjectStatusFilter(value))
					}
				>
					<SelectTrigger
						size="sm"
						aria-label="Filter projects by status"
						className="w-fit min-w-24 max-w-40 bg-card data-[placeholder]:text-foreground [&>span:first-child]:truncate"
					>
						<SelectValue placeholder="Status" />
					</SelectTrigger>

					<SelectContent position="popper" align="start" sideOffset={4}>
						<SelectItem value={PROJECT_FILTER_DEFAULTS.status}>All</SelectItem>

						<SelectItem value="active">Active</SelectItem>

						<SelectItem value="completed">Completed</SelectItem>
					</SelectContent>
				</Select>

				<Select
					value={
						colorFilter === PROJECT_FILTER_DEFAULTS.color ? "" : colorFilter
					}
					onValueChange={(value) =>
						onColorFilterChange(parseProjectColorFilter(value))
					}
				>
					<SelectTrigger
						size="sm"
						aria-label="Filter projects by color"
						className="w-fit min-w-24 max-w-40 bg-card data-[placeholder]:text-foreground [&>span:first-child]:truncate"
					>
						<SelectValue placeholder="Color" />
					</SelectTrigger>

					<SelectContent position="popper" align="start" sideOffset={4}>
						<SelectItem value={PROJECT_FILTER_DEFAULTS.color}>All</SelectItem>

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

				{showScheduleFilter && (
					<Select
						value={
							scheduleFilter === PROJECT_FILTER_DEFAULTS.dates
								? ""
								: scheduleFilter
						}
						onValueChange={(value) =>
							onScheduleFilterChange(parseProjectScheduleFilter(value))
						}
					>
						<SelectTrigger
							size="sm"
							aria-label="Filter projects by dates"
							className="w-fit min-w-28 max-w-52 bg-card data-[placeholder]:text-foreground [&>span:first-child]:truncate"
						>
							<SelectValue placeholder="Due date" />
						</SelectTrigger>

						<SelectContent position="popper" align="start" sideOffset={4}>
							<SelectItem value={PROJECT_FILTER_DEFAULTS.dates}>All</SelectItem>

							<SelectItem value="no-dates">No project dates</SelectItem>

							<SelectItem value="overdue">Overdue</SelectItem>

							<SelectItem value="due-next-7-days">
								Due in next 7 days
							</SelectItem>
						</SelectContent>
					</Select>
				)}

				{trailingControls}

				{hasFilters && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="shrink-0 bg-card"
						onClick={onClearFilters}
					>
						Clear filters
					</Button>
				)}
			</div>

			{/* Non-filter page controls */}
			{utilityControls && (
				<div className="flex shrink-0 items-center gap-2 xl:ml-auto">
					{utilityControls}
				</div>
			)}
		</div>
	);
}
