"use client";

import { Search, SearchX, UsersRound, X } from "lucide-react";
import { useMemo, useState } from "react";

import { TeamMemberCard } from "@/components/team/team-member-card";
import { TeamMemberSidebar } from "@/components/team/team-member-sidebar";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getColorHex } from "@/lib/constants/colors";
import { SEARCH_LIMITS } from "@/lib/constants/search";
import type { TeamCollaborator, TeamDirectoryData } from "@/types/team";

const ALL_PROJECTS = "all";

type TeamDirectoryProps = TeamDirectoryData;

export function TeamDirectory({ collaborators, projects }: TeamDirectoryProps) {
	const [query, setQuery] = useState("");
	const [projectFilter, setProjectFilter] = useState(ALL_PROJECTS);

	const [selectedCollaborator, setSelectedCollaborator] =
		useState<TeamCollaborator | null>(null);

	const normalizedQuery = query.trim().toLocaleLowerCase("en-US");

	const visibleCollaborators = useMemo(() => {
		return collaborators.filter((collaborator) => {
			const matchesProject =
				projectFilter === ALL_PROJECTS ||
				collaborator.projects.some((project) => project.id === projectFilter);

			if (!matchesProject) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			const name = collaborator.name?.toLocaleLowerCase("en-US") ?? "";

			const email = collaborator.email.toLocaleLowerCase("en-US");

			const projectNames = collaborator.projects.map((project) =>
				project.name.toLocaleLowerCase("en-US"),
			);

			return (
				name.includes(normalizedQuery) ||
				email.includes(normalizedQuery) ||
				projectNames.some((projectName) =>
					projectName.includes(normalizedQuery),
				)
			);
		});
	}, [collaborators, normalizedQuery, projectFilter]);

	const hasFilters =
		normalizedQuery.length > 0 || projectFilter !== ALL_PROJECTS;

	function clearFilters() {
		setQuery("");
		setProjectFilter(ALL_PROJECTS);
	}

	if (collaborators.length === 0) {
		return (
			<div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 text-center">
				<div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
					<UsersRound aria-hidden="true" size={23} />
				</div>

				<h2 className="text-lg font-semibold text-foreground">
					No collaborators yet
				</h2>

				<p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
					People added to projects you can access will appear here. Project
					membership is managed from the individual project.
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-4">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
					<div className="relative w-full min-w-0 lg:max-w-md lg:flex-1">
						<Search
							aria-hidden="true"
							size={16}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
						/>

						<input
							type="search"
							value={query}
							maxLength={SEARCH_LIMITS.maxQueryLength}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search collaborators..."
							aria-label="Search collaborators"
							className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-9 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
						/>

						{query.length > 0 && (
							<button
								type="button"
								onClick={() => setQuery("")}
								aria-label="Clear collaborator search"
								className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<X aria-hidden="true" size={14} />
							</button>
						)}
					</div>

					<Select
						value={projectFilter === ALL_PROJECTS ? "" : projectFilter}
						onValueChange={setProjectFilter}
					>
						<SelectTrigger
							size="sm"
							aria-label="Filter collaborators by project"
							className="w-fit min-w-28 max-w-72 bg-card data-[placeholder]:text-foreground [&>span:first-child]:truncate"
						>
							<SelectValue placeholder="Project" />
						</SelectTrigger>

						<SelectContent position="popper" align="start" sideOffset={4}>
							<SelectItem value={ALL_PROJECTS}>All projects</SelectItem>

							{projects.map((project) => (
								<SelectItem key={project.id} value={project.id}>
									<span
										aria-hidden="true"
										className="size-2.5 rounded-full"
										style={{
											backgroundColor: getColorHex(project.color),
										}}
									/>

									{project.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{hasFilters && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="shrink-0 bg-card"
							onClick={clearFilters}
						>
							Clear filters
						</Button>
					)}
				</div>

				{hasFilters && (
					<p className="text-sm text-muted-foreground">
						{visibleCollaborators.length} of {collaborators.length}{" "}
						collaborators shown
					</p>
				)}

				{visibleCollaborators.length === 0 ? (
					<div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 text-center">
						<div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
							<SearchX aria-hidden="true" size={21} />
						</div>

						<h2 className="text-base font-semibold text-foreground">
							No collaborators match these filters
						</h2>

						<p className="mt-2 max-w-sm text-sm text-muted-foreground">
							Try changing the search or selected project.
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
						{visibleCollaborators.map((collaborator) => (
							<TeamMemberCard
								key={collaborator.id}
								collaborator={collaborator}
								onSelect={setSelectedCollaborator}
							/>
						))}
					</div>
				)}
			</div>

			<TeamMemberSidebar
				collaborator={selectedCollaborator}
				onOpenChange={(open) => {
					if (!open) {
						setSelectedCollaborator(null);
					}
				}}
			/>
		</>
	);
}
