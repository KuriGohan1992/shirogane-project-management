"use client";

import { Users } from "lucide-react";
import { useState } from "react";

import { ProjectMembersModal } from "@/components/modals/project-members-modal";
import { Button } from "@/components/ui/button";
import type { ProjectMemberWithUser } from "@/types/member";
import type { UserSummary } from "@/types/user";

type ProjectMembersButtonProps = {
	projectId: string;
	owner: UserSummary;
	members: ProjectMemberWithUser[];
};

export function ProjectMembersButton({
	projectId,
	owner,
	members,
}: ProjectMembersButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	const memberCount = members.length + 1;

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => setIsOpen(true)}
			>
				<Users aria-hidden="true" />
				{memberCount} {memberCount === 1 ? "member" : "members"}
			</Button>

			{isOpen && (
				<ProjectMembersModal
					projectId={projectId}
					owner={owner}
					members={members}
					open={isOpen}
					onOpenChange={setIsOpen}
				/>
			)}
		</>
	);
}
