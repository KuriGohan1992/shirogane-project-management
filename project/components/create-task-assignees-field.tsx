"use client";

import { Check, Plus, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

import { TaskAssigneeStack } from "@/components/task-assignee-stack";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import type { AssignmentCandidate } from "@/types/member";

type CreateTaskAssigneesFieldProps = {
	formId: string;
	candidates: AssignmentCandidate[];
	pending: boolean;
};

export function CreateTaskAssigneesField({
	formId,
	candidates,
	pending,
}: CreateTaskAssigneesFieldProps) {
	const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);

	const selectedAssigneeIdSet = useMemo(
		() => new Set(selectedAssigneeIds),
		[selectedAssigneeIds],
	);

	const candidateById = useMemo(
		() => new Map(candidates.map((candidate) => [candidate.id, candidate])),
		[candidates],
	);

	const selectedAssignees = selectedAssigneeIds
		.map((assigneeId) => candidateById.get(assigneeId))
		.filter(
			(candidate): candidate is AssignmentCandidate => candidate !== undefined,
		);

	const projectCandidates = candidates.filter(
		(candidate) => candidate.source === "project",
	);

	const teamCandidates = candidates.filter(
		(candidate) => candidate.source === "team",
	);

	function toggleAssignee(assigneeId: string) {
		setSelectedAssigneeIds((current) =>
			current.includes(assigneeId)
				? current.filter((id) => id !== assigneeId)
				: [...current, assigneeId],
		);
	}

	function renderCandidate(candidate: AssignmentCandidate) {
		const isSelected = selectedAssigneeIdSet.has(candidate.id);

		return (
			<button
				key={candidate.id}
				type="button"
				aria-pressed={isSelected}
				disabled={pending}
				onClick={() => toggleAssignee(candidate.id)}
				className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted disabled:opacity-50"
			>
				<UserAvatar user={candidate} className="size-9 shrink-0" />

				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-foreground">
						{candidate.name ?? candidate.email}
					</p>

					{candidate.jobTitle && (
						<p className="truncate text-xs font-medium text-muted-foreground">
							{candidate.jobTitle}
						</p>
					)}

					<p className="truncate text-xs text-muted-foreground">
						{candidate.email}
					</p>
				</div>

				{candidate.isOwner && (
					<span className="shrink-0 text-xs text-muted-foreground">Owner</span>
				)}

				{isSelected && (
					<Check aria-hidden="true" className="size-4 shrink-0 text-primary" />
				)}
			</button>
		);
	}

	return (
		<div className="flex min-w-0 items-center gap-1">
			{selectedAssigneeIds.map((assigneeId) => (
				<input
					key={assigneeId}
					type="hidden"
					name="assigneeIds"
					form={formId}
					value={assigneeId}
					readOnly
				/>
			))}

			{selectedAssignees.length > 0 && (
				<TaskAssigneeStack users={selectedAssignees} size="large" />
			)}

			<Popover modal>
				<PopoverTrigger asChild>
					{selectedAssignees.length === 0 ? (
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-8 shrink-0 bg-card hover:bg-card/90"
							disabled={pending}
						>
							<UserPlus aria-hidden="true" className="size-4" />
							Assign
						</Button>
					) : (
						<button
							type="button"
							disabled={pending}
							aria-label="Manage task assignees"
							className="ml-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Plus aria-hidden="true" className="size-4" />
						</button>
					)}
				</PopoverTrigger>

				<PopoverContent align="end" className="w-80 p-2">
					{candidates.length === 0 ? (
						<p className="px-2 py-4 text-center text-sm text-muted-foreground">
							No assignable collaborators.
						</p>
					) : (
						<div className="max-h-72 overflow-y-auto">
							{projectCandidates.length > 0 && (
								<div>
									<p className="px-2 pb-1 pt-1 text-xs font-semibold text-muted-foreground">
										Eligible collaborators
									</p>

									<div className="space-y-1">
										{projectCandidates.map(renderCandidate)}
									</div>
								</div>
							)}

							{teamCandidates.length > 0 && (
								<div
									className={cn(
										projectCandidates.length > 0 &&
											"mt-2 border-t border-border pt-2",
									)}
								>
									<div className="px-2 pb-1">
										<p className="text-xs font-semibold text-muted-foreground">
											Your team
										</p>

										<p className="mt-0.5 text-xs text-muted-foreground">
											Selecting someone here adds them to this project as a
											Member when the task is created.
										</p>
									</div>

									<div className="space-y-1">
										{teamCandidates.map(renderCandidate)}
									</div>
								</div>
							)}
						</div>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
}
