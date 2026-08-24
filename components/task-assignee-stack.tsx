"use client";

import { useState } from "react";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import type { UserSummary } from "@/types/user";

type TaskAssigneeStackProps = {
	users: UserSummary[];
	maxVisible?: number;
	size?: "small" | "large";
};

export function TaskAssigneeStack({
	users,
	maxVisible = 5,
	size = "small",
}: TaskAssigneeStackProps) {
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);

	const visibleUsers = users.slice(0, maxVisible);

	const hiddenUserCount = users.length - visibleUsers.length;

	const isLarge = size === "large";

	if (users.length === 0) {
		return null;
	}

	return (
		<Popover open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label={`View ${users.length} ${
						users.length === 1 ? "assignee" : "assignees"
					}`}
					onMouseEnter={() => setIsPreviewOpen(true)}
					onMouseLeave={() => setIsPreviewOpen(false)}
					onFocus={() => setIsPreviewOpen(true)}
					onBlur={() => setIsPreviewOpen(false)}
					className="flex shrink-0 items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<div className="flex -space-x-1.5">
						{visibleUsers.map((user) => (
							<UserAvatar
								key={user.id}
								user={user}
								className={cn(
									"border-2 border-card",
									isLarge ? "size-8" : "size-6",
								)}
							/>
						))}
					</div>

					{hiddenUserCount > 0 && (
						<span
							className={cn(
								"ml-1 inline-flex items-center justify-center rounded-full border border-border bg-muted font-semibold text-muted-foreground",
								isLarge
									? "h-8 min-w-8 px-1.5 text-xs"
									: "h-6 min-w-6 px-1 text-[10px]",
							)}
						>
							+{hiddenUserCount}
						</span>
					)}
				</button>
			</PopoverTrigger>

			<PopoverContent
				side="top"
				align="start"
				sideOffset={6}
				className="w-60 p-2"
				onOpenAutoFocus={(event) => event.preventDefault()}
				onCloseAutoFocus={(event) => event.preventDefault()}
			>
				<div className="max-h-64 space-y-1 overflow-y-auto">
					{users.map((user) => (
						<div
							key={user.id}
							className="flex items-center gap-2 rounded-md px-2 py-1.5"
						>
							<UserAvatar user={user} className="size-6 shrink-0" />

							<span className="min-w-0 truncate text-sm">
								{user.name ?? user.email}
							</span>
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
