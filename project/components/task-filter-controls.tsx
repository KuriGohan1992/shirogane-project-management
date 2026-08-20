"use client";

import { Check, ChevronDown, Search, UserRound, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { UserAvatar } from "@/components/user-avatar";
import { getColorHex } from "@/lib/constants/colors";
import { SEARCH_LIMITS } from "@/lib/constants/search";
import type { ProjectLabel } from "@/lib/db/schema";
import {
	hasTaskFilters,
	TASK_DUE_FILTER_OPTIONS,
	TASK_FILTER_PARAMS,
	TASK_PRIORITY_FILTER_OPTIONS,
	type TaskFilters,
	UNASSIGNED_TASK_FILTER_VALUE,
} from "@/lib/task-filters";
import { cn } from "@/lib/utils";
import type { AssignmentCandidate } from "@/types/member";

type TaskFilterControlsProps = {
	filters: TaskFilters;
	labelCandidates: ProjectLabel[];
	assigneeCandidates: AssignmentCandidate[];
	visibleTaskCount: number;
	totalTaskCount: number;
};

type FilterOptionButtonProps = {
	selected: boolean;
	onClick: () => void;
	children: React.ReactNode;
};

function replaceTaskFilterUrl(params: URLSearchParams) {
	const queryString = params.toString();

	const nextUrl = `${window.location.pathname}${
		queryString ? `?${queryString}` : ""
	}${window.location.hash}`;

	window.history.replaceState(null, "", nextUrl);
}

function updateTaskFilterParam(key: string, value: string) {
	const params = new URLSearchParams(window.location.search);

	const normalizedValue = value.trim();

	if (normalizedValue.length === 0) {
		params.delete(key);
	} else {
		params.set(key, normalizedValue);
	}

	replaceTaskFilterUrl(params);
}

function toggleTaskFilterParam(key: string, value: string) {
	const params = new URLSearchParams(window.location.search);

	const currentValues = [...new Set(params.getAll(key))];

	const isSelected = currentValues.includes(value);

	params.delete(key);

	for (const currentValue of currentValues) {
		if (currentValue !== value) {
			params.append(key, currentValue);
		}
	}

	if (!isSelected) {
		params.append(key, value);
	}

	replaceTaskFilterUrl(params);
}

function clearTaskFilters() {
	const params = new URLSearchParams(window.location.search);

	for (const key of Object.values(TASK_FILTER_PARAMS)) {
		params.delete(key);
	}

	replaceTaskFilterUrl(params);
}

function FilterOptionButton({
	selected,
	onClick,
	children,
}: FilterOptionButtonProps) {
	return (
		<button
			type="button"
			aria-pressed={selected}
			onClick={onClick}
			className={cn(
				"flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted",
				selected && "bg-muted/70",
			)}
		>
			<span
				aria-hidden="true"
				className={cn(
					"flex size-4 shrink-0 items-center justify-center rounded border border-input bg-background",
					selected && "border-primary bg-primary text-primary-foreground",
				)}
			>
				{selected && <Check size={11} />}
			</span>

			{children}
		</button>
	);
}

function getPriorityLabel(filters: TaskFilters) {
	if (filters.priorities.length === 0) {
		return "All priorities";
	}

	if (filters.priorities.length === 1) {
		const priority = filters.priorities[0];

		return (
			TASK_PRIORITY_FILTER_OPTIONS.find((option) => option.value === priority)
				?.label ?? "Priority"
		);
	}

	return `${filters.priorities.length} priorities`;
}

function getLabelFilterLabel(
	filters: TaskFilters,
	labelCandidates: ProjectLabel[],
) {
	if (filters.labelIds.length === 0) {
		return "All labels";
	}

	if (filters.labelIds.length === 1) {
		const label = labelCandidates.find(
			(candidate) => candidate.id === filters.labelIds[0],
		);

		return label?.name ?? "Label";
	}

	return `${filters.labelIds.length} labels`;
}

function getAssigneeFilterLabel(
	filters: TaskFilters,
	assigneeCandidates: AssignmentCandidate[],
) {
	if (filters.assigneeIds.length === 0) {
		return "All assignees";
	}

	if (filters.assigneeIds.length === 1) {
		const assigneeId = filters.assigneeIds[0];

		if (assigneeId === UNASSIGNED_TASK_FILTER_VALUE) {
			return "Unassigned";
		}

		const assignee = assigneeCandidates.find(
			(candidate) => candidate.id === assigneeId,
		);

		return assignee?.name ?? assignee?.email ?? "Assignee";
	}

	return `${filters.assigneeIds.length} assignees`;
}

function getDueDateFilterLabel(filters: TaskFilters) {
	if (filters.dueDates.length === 0) {
		return "All dates";
	}

	if (filters.dueDates.length === 1) {
		const dueDate = filters.dueDates[0];

		return (
			TASK_DUE_FILTER_OPTIONS.find((option) => option.value === dueDate)
				?.label ?? "Due date"
		);
	}

	return `${filters.dueDates.length} date filters`;
}

export function TaskFilterControls({
	filters,
	labelCandidates,
	assigneeCandidates,
	visibleTaskCount,
	totalTaskCount,
}: TaskFilterControlsProps) {
	const filtersActive = hasTaskFilters(filters);

	const priorityLabel = getPriorityLabel(filters);

	const labelFilterLabel = getLabelFilterLabel(filters, labelCandidates);

	const assigneeFilterLabel = getAssigneeFilterLabel(
		filters,
		assigneeCandidates,
	);

	const dueDateFilterLabel = getDueDateFilterLabel(filters);

	return (
		<div className="space-y-2">
			<div className="flex flex-col gap-3 xl:flex-row xl:items-center">
				<div className="relative min-w-0 flex-1 xl:max-w-sm">
					<Search
						aria-hidden="true"
						size={16}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
					/>

					<input
						type="search"
						value={filters.query}
						maxLength={SEARCH_LIMITS.maxQueryLength}
						onChange={(event) =>
							updateTaskFilterParam(
								TASK_FILTER_PARAMS.query,
								event.target.value,
							)
						}
						aria-label="Filter tasks by title or description"
						placeholder="Filter tasks..."
						className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
					/>

					{filters.query.length > 0 && (
						<button
							type="button"
							onClick={() =>
								updateTaskFilterParam(TASK_FILTER_PARAMS.query, "")
							}
							aria-label="Clear task keyword filter"
							className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						>
							<X aria-hidden="true" size={14} />
						</button>
					)}
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Popover>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className={cn(
									filters.priorities.length > 0 && "border-primary/40",
								)}
							>
								<span className="max-w-36 truncate">{priorityLabel}</span>

								<ChevronDown
									aria-hidden="true"
									size={14}
									className="text-muted-foreground"
								/>
							</Button>
						</PopoverTrigger>

						<PopoverContent align="start" className="w-56 p-2">
							<p className="px-2 pb-1 pt-1 text-xs font-semibold text-muted-foreground">
								Priority
							</p>

							{TASK_PRIORITY_FILTER_OPTIONS.map((option) => (
								<FilterOptionButton
									key={option.value}
									selected={filters.priorities.includes(option.value)}
									onClick={() =>
										toggleTaskFilterParam(
											TASK_FILTER_PARAMS.priority,
											option.value,
										)
									}
								>
									<span>{option.label}</span>
								</FilterOptionButton>
							))}
						</PopoverContent>
					</Popover>

					<Popover>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className={cn(
									filters.labelIds.length > 0 && "border-primary/40",
								)}
							>
								<span className="max-w-36 truncate">{labelFilterLabel}</span>

								<ChevronDown
									aria-hidden="true"
									size={14}
									className="text-muted-foreground"
								/>
							</Button>
						</PopoverTrigger>

						<PopoverContent align="start" className="w-64 p-2">
							<p className="px-2 pb-1 pt-1 text-xs font-semibold text-muted-foreground">
								Labels
							</p>

							{labelCandidates.length === 0 ? (
								<p className="px-2 py-3 text-sm text-muted-foreground">
									No project labels yet.
								</p>
							) : (
								<div className="max-h-64 overflow-y-auto">
									{labelCandidates.map((label) => (
										<FilterOptionButton
											key={label.id}
											selected={filters.labelIds.includes(label.id)}
											onClick={() =>
												toggleTaskFilterParam(
													TASK_FILTER_PARAMS.label,
													label.id,
												)
											}
										>
											<span
												aria-hidden="true"
												className="size-2.5 shrink-0 rounded-full"
												style={{
													backgroundColor: getColorHex(label.color),
												}}
											/>

											<span className="min-w-0 truncate">{label.name}</span>
										</FilterOptionButton>
									))}
								</div>
							)}
						</PopoverContent>
					</Popover>

					<Popover>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className={cn(
									filters.assigneeIds.length > 0 && "border-primary/40",
								)}
							>
								<span className="max-w-40 truncate">{assigneeFilterLabel}</span>

								<ChevronDown
									aria-hidden="true"
									size={14}
									className="text-muted-foreground"
								/>
							</Button>
						</PopoverTrigger>

						<PopoverContent align="start" className="w-72 p-2">
							<p className="px-2 pb-1 pt-1 text-xs font-semibold text-muted-foreground">
								Assignees
							</p>

							<div className="max-h-72 overflow-y-auto">
								<FilterOptionButton
									selected={filters.assigneeIds.includes(
										UNASSIGNED_TASK_FILTER_VALUE,
									)}
									onClick={() =>
										toggleTaskFilterParam(
											TASK_FILTER_PARAMS.assignee,
											UNASSIGNED_TASK_FILTER_VALUE,
										)
									}
								>
									<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
										<UserRound aria-hidden="true" size={14} />
									</span>

									<span>Unassigned</span>
								</FilterOptionButton>

								{assigneeCandidates.map((assignee) => (
									<FilterOptionButton
										key={assignee.id}
										selected={filters.assigneeIds.includes(assignee.id)}
										onClick={() =>
											toggleTaskFilterParam(
												TASK_FILTER_PARAMS.assignee,
												assignee.id,
											)
										}
									>
										<UserAvatar user={assignee} className="size-7" />

										<span className="min-w-0 flex-1 truncate">
											{assignee.name ?? assignee.email}
										</span>

										{assignee.isOwner && (
											<span className="text-[10px] text-muted-foreground">
												Owner
											</span>
										)}
									</FilterOptionButton>
								))}
							</div>
						</PopoverContent>
					</Popover>

					<Popover>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className={cn(
									filters.dueDates.length > 0 && "border-primary/40",
								)}
							>
								<span className="max-w-44 truncate">{dueDateFilterLabel}</span>

								<ChevronDown
									aria-hidden="true"
									size={14}
									className="text-muted-foreground"
								/>
							</Button>
						</PopoverTrigger>

						<PopoverContent align="start" className="w-64 p-2">
							<p className="px-2 pb-1 pt-1 text-xs font-semibold text-muted-foreground">
								Due date
							</p>

							{TASK_DUE_FILTER_OPTIONS.map((option) => (
								<FilterOptionButton
									key={option.value}
									selected={filters.dueDates.includes(option.value)}
									onClick={() =>
										toggleTaskFilterParam(TASK_FILTER_PARAMS.due, option.value)
									}
								>
									<span>{option.label}</span>
								</FilterOptionButton>
							))}
						</PopoverContent>
					</Popover>

					<Button
						type="button"
						variant="ghost"
						size="sm"
						disabled={!filtersActive}
						onClick={clearTaskFilters}
					>
						Clear filters
					</Button>
				</div>
			</div>

			{filtersActive && (
				<p className="px-1 text-sm text-muted-foreground">
					{visibleTaskCount} of {totalTaskCount}{" "}
					{totalTaskCount === 1 ? "task" : "tasks"} shown
				</p>
			)}
		</div>
	);
}
