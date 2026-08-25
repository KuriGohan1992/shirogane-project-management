"use client";

import { FolderOpen, LoaderCircle, Search, SquareCheckBig } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/components/ui/popover";
import { SEARCH_LIMITS } from "@/lib/constants/search";
import { getTaskHref } from "@/lib/task-route";
import { cn } from "@/lib/utils";
import type { GlobalSearchResults } from "@/types/search";

const emptyResults: GlobalSearchResults = {
	projects: [],
	tasks: [],
};

export function GlobalSearch() {
	const pathname = usePathname();
	const router = useRouter();

	const [query, setQuery] = useState("");
	const [results, setResults] = useState<GlobalSearchResults>(emptyResults);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);

	const requestIdRef = useRef(0);

	const trimmedQuery = query.trim();

	const hasQuery = trimmedQuery.length >= SEARCH_LIMITS.minQueryLength;

	const hasResults = results.projects.length > 0 || results.tasks.length > 0;

	const searchableResults = [
		...results.projects.map((project) => ({
			type: "project" as const,
			id: project.id,
			href: `/projects/${project.id}`,
		})),

		...results.tasks.map((task) => ({
			type: "task" as const,
			id: task.id,
			href: getTaskHref(task.projectId, task.id, task.title),
		})),
	];

	// Clear the persistent dashboard search whenever navigation changes the route.
	const previousPathnameRef = useRef(pathname);

	useEffect(() => {
		if (previousPathnameRef.current === pathname) {
			return;
		}

		previousPathnameRef.current = pathname;

		setQuery("");
		setResults(emptyResults);
		setIsLoading(false);
		setIsOpen(false);
		setActiveIndex(-1);
	}, [pathname]);

	// Debounce requests and ignore search responses that are no longer current.
	useEffect(() => {
		if (!hasQuery) {
			requestIdRef.current += 1;

			setResults(emptyResults);
			setIsLoading(false);
			setIsOpen(false);
			setActiveIndex(-1);

			return;
		}

		const requestId = requestIdRef.current + 1;
		requestIdRef.current = requestId;

		const controller = new AbortController();

		const timeoutId = window.setTimeout(async () => {
			setIsLoading(true);
			setIsOpen(true);

			try {
				const response = await fetch(
					`/api/search?q=${encodeURIComponent(trimmedQuery)}`,
					{
						signal: controller.signal,
						cache: "no-store",
					},
				);

				if (!response.ok) {
					throw new Error("Search request failed.");
				}

				const nextResults = (await response.json()) as GlobalSearchResults;
				if (requestIdRef.current === requestId) {
					setResults(nextResults);

					const resultCount =
						nextResults.projects.length + nextResults.tasks.length;

					setActiveIndex(resultCount > 0 ? 0 : -1);
				}
			} catch (error) {
				if (controller.signal.aborted) {
					return;
				}

				console.error("Failed to search projects and tasks:", error);

				if (requestIdRef.current === requestId) {
					setResults(emptyResults);
				}
			} finally {
				if (requestIdRef.current === requestId) {
					setIsLoading(false);
				}
			}
		}, SEARCH_LIMITS.debounceMs);

		return () => {
			window.clearTimeout(timeoutId);
			controller.abort();
		};
	}, [hasQuery, trimmedQuery]);

	function clearSearch() {
		setQuery("");
		setResults(emptyResults);
		setIsLoading(false);
		setIsOpen(false);
		setActiveIndex(-1);
	}

	function navigateToResult(href: string) {
		clearSearch();
		router.push(href);
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Escape") {
			if (isOpen) {
				event.preventDefault();
				setIsOpen(false);
				setActiveIndex(-1);
			}

			return;
		}

		if (!isOpen || searchableResults.length === 0) {
			return;
		}

		if (event.key === "ArrowDown") {
			event.preventDefault();

			setActiveIndex((current) => {
				if (current < 0 || current >= searchableResults.length - 1) {
					return 0;
				}

				return current + 1;
			});

			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();

			setActiveIndex((current) => {
				if (current <= 0) {
					return searchableResults.length - 1;
				}

				return current - 1;
			});

			return;
		}

		if (event.key === "Enter") {
			const activeResult = searchableResults[activeIndex];

			if (!activeResult) {
				return;
			}

			event.preventDefault();
			navigateToResult(activeResult.href);
		}
	}

	return (
		<Popover open={isOpen && hasQuery} onOpenChange={setIsOpen}>
			<PopoverAnchor asChild>
				<div className="relative min-w-0 w-full max-w-md">
					<Search
						aria-hidden="true"
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
						size={16}
					/>

					<input
						data-keyboard-action="global-search"
						type="search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						onFocus={() => {
							if (hasQuery) {
								setIsOpen(true);
							}
						}}
						onKeyDown={handleKeyDown}
						aria-label="Search projects and tasks"
						placeholder="Search..."
						className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
					/>

					{isLoading && (
						<LoaderCircle
							aria-hidden="true"
							size={16}
							className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
						/>
					)}
				</div>
			</PopoverAnchor>

			<PopoverContent
				align="start"
				sideOffset={8}
				className="w-[min(28rem,calc(100vw-2rem))] p-0"
				onOpenAutoFocus={(event) => event.preventDefault()}
			>
				{isLoading && !hasResults ? (
					<div className="px-4 py-6 text-center text-sm text-muted-foreground">
						Searching...
					</div>
				) : !hasResults ? (
					<div className="px-4 py-6 text-center">
						<p className="text-sm font-medium">No results found</p>

						<p className="mt-1 text-xs text-muted-foreground">
							Try another project or task name.
						</p>
					</div>
				) : (
					<div className="max-h-[28rem] overflow-y-auto py-2">
						{results.projects.length > 0 && (
							<section aria-labelledby="global-search-projects">
								<h2
									id="global-search-projects"
									className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
								>
									Projects
								</h2>

								<div className="space-y-0.5 px-1.5">
									{results.projects.map((project, index) => {
										const resultIndex = index;
										const isActive = activeIndex === resultIndex;

										return (
											<Link
												key={project.id}
												href={`/projects/${project.id}`}
												onClick={clearSearch}
												onMouseEnter={() => setActiveIndex(resultIndex)}
												className={cn(
													"flex items-start gap-2 rounded-md px-2.5 py-2.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
													isActive && "bg-muted",
												)}
											>
												<FolderOpen
													aria-hidden="true"
													size={16}
													className="mt-1 shrink-0 text-muted-foreground"
												/>

												<div className="min-w-0">
													<p className="truncate text-sm font-medium">
														{project.name}
													</p>

													{project.description && (
														<p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
															{project.description}
														</p>
													)}
												</div>
											</Link>
										);
									})}
								</div>
							</section>
						)}

						{results.tasks.length > 0 && (
							<section
								aria-labelledby="global-search-tasks"
								className={cn(
									results.projects.length > 0 &&
										"mt-2 border-t border-border pt-2",
								)}
							>
								<h2
									id="global-search-tasks"
									className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
								>
									Tasks
								</h2>

								<div className="space-y-0.5 px-1.5">
									{results.tasks.map((task, index) => {
										const resultIndex = results.projects.length + index;

										const isActive = activeIndex === resultIndex;

										return (
											<Link
												key={task.id}
												href={getTaskHref(task.projectId, task.id, task.title)}
												onClick={clearSearch}
												onMouseEnter={() => setActiveIndex(resultIndex)}
												className={cn(
													"flex items-start gap-2 rounded-md px-2.5 py-2.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
													isActive && "bg-muted",
												)}
											>
												<SquareCheckBig
													aria-hidden="true"
													size={16}
													className="mt-1.5 shrink-0 text-muted-foreground"
												/>

												<div className="min-w-0">
													<p className="truncate text-sm font-medium">
														{task.title}
													</p>

													<p className="mt-0.5 truncate text-xs text-muted-foreground">
														{task.projectName} · {task.stageName}
													</p>
												</div>
											</Link>
										);
									})}
								</div>
							</section>
						)}
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
