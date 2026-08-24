"use client";

import { Check, Plus, UserPlus } from "lucide-react";

import { TaskAssigneeStack } from "@/components/task-assignee-stack";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { UserAvatar } from "@/components/user-avatar";
import { assignTask, unassignTask } from "@/lib/actions/assignees";
import { cn } from "@/lib/utils";
import type { AssignmentCandidate } from "@/types/member";
import type { UserSummary } from "@/types/user";

type TaskAssigneePickerProps = {
	taskId: string;
	candidates: AssignmentCandidate[];
	assignedUsers: UserSummary[];
	canManage: boolean;
	fieldStyle?: boolean;
	modal?: boolean;
};

export function TaskAssigneePicker({
	taskId,
	candidates,
	assignedUsers,
	canManage,
	fieldStyle = false,
	modal = false,
}: TaskAssigneePickerProps) {
	const assignedUserIds = new Set(assignedUsers.map((user) => user.id));

	const projectCandidates = candidates.filter(
		(candidate) => candidate.source === "project",
	);

	const teamCandidates = candidates.filter(
		(candidate) => candidate.source === "team",
	);

	if (!canManage) {
		if (assignedUsers.length === 0) {
			return (
				<span className="text-sm text-muted-foreground">No assignees</span>
			);
		}

		return (
			<TaskAssigneeStack
				users={assignedUsers}
				size={fieldStyle ? "large" : "small"}
			/>
		);
	}

	function renderCandidate(candidate: AssignmentCandidate) {
		const isAssigned = assignedUserIds.has(candidate.id);

		const action = isAssigned
			? unassignTask.bind(null, taskId, candidate.id)
			: assignTask.bind(null, taskId, candidate.id);

		return (
			<form key={candidate.id} action={action}>
				<button
					type="submit"
					aria-pressed={isAssigned}
					className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted"
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
						<span className="shrink-0 text-xs text-muted-foreground">
							Owner
						</span>
					)}

					{isAssigned && (
						<Check
							aria-hidden="true"
							className="size-4 shrink-0 text-primary"
						/>
					)}
				</button>
			</form>
		);
	}

	return (
		<div className="flex min-w-0 items-center gap-1">
			<TaskAssigneeStack
				users={assignedUsers}
				size={fieldStyle ? "large" : "small"}
			/>

			<Popover modal={modal}>
				<PopoverTrigger asChild>
					{assignedUsers.length === 0 ? (
						<Button
							type="button"
							variant={fieldStyle ? "outline" : "ghost"}
							size="sm"
							className={
								fieldStyle ? "h-8 bg-card px-2 hover:bg-card/90" : "h-7 px-2"
							}
							aria-label="Manage task assignees"
						>
							<UserPlus aria-hidden="true" className="size-4" />
							Assign
						</Button>
					) : (
						<button
							type="button"
							aria-label="Manage task assignees"
							className={cn(
								"inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
								fieldStyle ? "size-8" : "size-6",
							)}
						>
							<Plus
								aria-hidden="true"
								className={fieldStyle ? "size-4" : "size-3.5"}
							/>
						</button>
					)}
				</PopoverTrigger>

				<PopoverContent
					align={fieldStyle ? "end" : "start"}
					className="w-80 p-2"
				>
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
											Assigning someone here adds them to this project as a
											Member.
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
