"use client";

import { Users } from "lucide-react";
import { useState } from "react";

import { ProjectMembersModal } from "@/components/modals/project-members-modal";
import { Button } from "@/components/ui/button";
import type { ProjectMemberWithUser } from "@/types/member";
import type { UserProfileSummary } from "@/types/user";

type ProjectMembersButtonProps = {
	projectId: string;
	owner: UserProfileSummary;
	members: ProjectMemberWithUser[];
	canManageMembers: boolean;
};

export function ProjectMembersButton({
	projectId,
	owner,
	members,
	canManageMembers,
}: ProjectMembersButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	const collaboratorCount = members.length + 1;

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="h-9 gap-2 bg-card"
				onClick={() => setIsOpen(true)}
			>
				<Users aria-hidden="true" className="size-4" />

				<span>Collaborators</span>

				<span className="inline-flex min-w-5 items-center justify-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
					{collaboratorCount}
				</span>
			</Button>
			{isOpen && (
				<ProjectMembersModal
					projectId={projectId}
					owner={owner}
					members={members}
					open={isOpen}
					onOpenChange={setIsOpen}
					canManageMembers={canManageMembers}
				/>
			)}
		</>
	);
}
