"use client";

import { Check, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { UserAvatar } from "@/components/user-avatar";
import { assignTask, unassignTask } from "@/lib/actions/assignees";
import type { AssignmentCandidate } from "@/types/member";
import type { UserSummary } from "@/types/user";

type TaskAssigneePickerProps = {
	taskId: string;
	candidates: AssignmentCandidate[];
	assignedUsers: UserSummary[];
	canManage: boolean;
};

export function TaskAssigneePicker({
	taskId,
	candidates,
	assignedUsers,
	canManage,
}: TaskAssigneePickerProps) {
	const assignedUserIds = new Set(assignedUsers.map((user) => user.id));
	const visibleAssignees = assignedUsers.slice(0, 5);

	const hiddenAssigneeCount = assignedUsers.length - visibleAssignees.length;

	if (!canManage) {
		if (assignedUsers.length === 0) {
			return null;
		}

		return (
			<fieldset className="flex min-w-0 items-center gap-1.5 border-0 p-0">
				<legend className="sr-only">Task assignees</legend>

				<div className="flex -space-x-2">
					{visibleAssignees.map((user) => (
						<UserAvatar
							key={user.id}
							user={user}
							className="size-6 border-2 border-card"
						/>
					))}
				</div>

				{assignedUsers.length > 3 && (
					<span className="text-xs text-muted-foreground">
						+{assignedUsers.length - 3}
					</span>
				)}
			</fieldset>
		);
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="h-7 px-2"
					aria-label="Manage task assignees"
				>
					{visibleAssignees.length === 0 ? (
						<>
							<UserPlus aria-hidden="true" />
							Assign
						</>
					) : (
						<div className="flex items-center">
							<div className="flex -space-x-1.5">
								{visibleAssignees.map((user) => (
									<UserAvatar
										key={user.id}
										user={user}
										className="size-5 border-2 border-card"
									/>
								))}
							</div>

							{hiddenAssigneeCount > 0 && (
								<span className="ml-1 text-xs font-medium text-muted-foreground">
									+{hiddenAssigneeCount}
								</span>
							)}
						</div>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent align="end" className="w-80 p-2">
				<div className="px-2 pb-2">
					<p className="text-sm font-medium">Assignees</p>

					<p className="text-xs text-muted-foreground">
						Assign project members to this task.
					</p>
				</div>

				<div className="max-h-72 space-y-1 overflow-y-auto">
					{candidates.map((candidate) => {
						const isAssigned = assignedUserIds.has(candidate.id);

						const action = isAssigned
							? unassignTask.bind(null, taskId, candidate.id)
							: assignTask.bind(null, taskId, candidate.id);

						return (
							<form key={candidate.id} action={action}>
								<button
									type="submit"
									className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-muted"
								>
									<UserAvatar user={candidate} className="size-7" />

									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium">
											{candidate.name ?? candidate.email}
										</p>

										<p className="truncate text-xs text-muted-foreground">
											{candidate.email}
										</p>
									</div>

									{candidate.isOwner && (
										<span className="text-xs text-muted-foreground">Owner</span>
									)}

									{isAssigned && (
										<Check
											className="size-4 shrink-0 text-primary"
											aria-hidden="true"
										/>
									)}
								</button>
							</form>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
