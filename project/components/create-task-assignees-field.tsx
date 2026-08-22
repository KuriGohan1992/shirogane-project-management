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

	function toggleAssignee(assigneeId: string) {
		setSelectedAssigneeIds((current) =>
			current.includes(assigneeId)
				? current.filter((id) => id !== assigneeId)
				: [...current, assigneeId],
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

			<Popover>
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
							No assignable project members.
						</p>
					) : (
						<div className="max-h-72 space-y-1 overflow-y-auto">
							{candidates.map((candidate) => {
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
										<UserAvatar user={candidate} className="size-7 shrink-0" />

										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium">
												{candidate.name ?? candidate.email}
											</p>

											<p className="truncate text-xs text-muted-foreground">
												{candidate.email}
											</p>
										</div>

										{candidate.isOwner && (
											<span className="shrink-0 text-xs text-muted-foreground">
												Owner
											</span>
										)}

										{isSelected && (
											<Check
												aria-hidden="true"
												className="size-4 shrink-0 text-primary"
											/>
										)}
									</button>
								);
							})}
						</div>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
}
