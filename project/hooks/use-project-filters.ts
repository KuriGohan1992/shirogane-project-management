"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { SEARCH_LIMITS } from "@/lib/constants/search";
import {
	matchesProjectScheduleFilter,
	matchesProjectStatusFilter,
	PROJECT_FILTER_DEFAULTS,
	PROJECT_FILTER_PARAMS,
	type ProjectAccessFilter,
	type ProjectColorFilter,
	type ProjectFilterTarget,
	type ProjectScheduleFilter,
	type ProjectStatusFilter,
	parseProjectAccessFilter,
	parseProjectColorFilter,
	parseProjectScheduleFilter,
	parseProjectStatusFilter,
} from "@/lib/project-filters";

type UseProjectFiltersOptions = {
	defaultStatus?: ProjectStatusFilter;
};

function replaceProjectFilterUrl(params: URLSearchParams) {
	const queryString = params.toString();

	const nextUrl = `${window.location.pathname}${
		queryString ? `?${queryString}` : ""
	}${window.location.hash}`;

	window.history.replaceState(null, "", nextUrl);
}

export function useProjectFilters<T extends ProjectFilterTarget>(
	projects: T[],
	options: UseProjectFiltersOptions = {},
) {
	const { defaultStatus = PROJECT_FILTER_DEFAULTS.status } = options;
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

	const rawStatusFilter = searchParams.get(PROJECT_FILTER_PARAMS.status);

	const statusFilter =
		rawStatusFilter === null
			? defaultStatus
			: parseProjectStatusFilter(rawStatusFilter);

	const scheduleFilter = parseProjectScheduleFilter(
		searchParams.get(PROJECT_FILTER_PARAMS.dates),
	);

	const [queryInput, setQueryInput] = useState(urlQuery);

	const normalizedQuery = queryInput.trim().toLocaleLowerCase("en-US");

	const hasFilters =
		normalizedQuery.length > 0 ||
		accessFilter !== PROJECT_FILTER_DEFAULTS.access ||
		colorFilter !== PROJECT_FILTER_DEFAULTS.color ||
		statusFilter !== defaultStatus ||
		scheduleFilter !== PROJECT_FILTER_DEFAULTS.dates;

	useEffect(() => {
		setQueryInput(urlQuery);
	}, [urlQuery]);

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

	const filteredProjects = useMemo(
		() =>
			projects.filter((project) => {
				const description =
					project.description?.toLocaleLowerCase("en-US") ?? "";

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
			}),
		[
			projects,
			normalizedQuery,
			accessFilter,
			colorFilter,
			statusFilter,
			scheduleFilter,
		],
	);

	function updateFilterParam(key: string, value: string, defaultValue: string) {
		const params = new URLSearchParams(window.location.search);

		if (value === defaultValue) {
			params.delete(key);
		} else {
			params.set(key, value);
		}

		replaceProjectFilterUrl(params);
	}

	function setAccessFilter(value: ProjectAccessFilter) {
		updateFilterParam(
			PROJECT_FILTER_PARAMS.access,
			value,
			PROJECT_FILTER_DEFAULTS.access,
		);
	}

	function setStatusFilter(value: ProjectStatusFilter) {
		updateFilterParam(PROJECT_FILTER_PARAMS.status, value, defaultStatus);
	}

	function setColorFilter(value: ProjectColorFilter) {
		updateFilterParam(
			PROJECT_FILTER_PARAMS.color,
			value,
			PROJECT_FILTER_DEFAULTS.color,
		);
	}

	function setScheduleFilter(value: ProjectScheduleFilter) {
		updateFilterParam(
			PROJECT_FILTER_PARAMS.dates,
			value,
			PROJECT_FILTER_DEFAULTS.dates,
		);
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

	return {
		queryInput,
		setQueryInput,
		accessFilter,
		setAccessFilter,
		colorFilter,
		setColorFilter,
		statusFilter,
		setStatusFilter,
		scheduleFilter,
		setScheduleFilter,
		defaultStatus,
		hasFilters,
		clearFilters,
		filteredProjects,
	};
}
