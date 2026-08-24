import { Check } from "lucide-react";
import { Fragment, type ReactNode } from "react";

import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import type { AssignmentCandidate } from "@/types/member";

type AssigneeCandidateListProps = {
	candidates: AssignmentCandidate[];
	renderCandidate: (candidate: AssignmentCandidate) => ReactNode;
	emptyMessage?: string;
};

export function AssigneeCandidateList({
	candidates,
	renderCandidate,
	emptyMessage = "No assignable collaborators.",
}: AssigneeCandidateListProps) {
	const projectCandidates = candidates.filter(
		(candidate) => candidate.source === "project",
	);

	const teamCandidates = candidates.filter(
		(candidate) => candidate.source === "team",
	);

	if (candidates.length === 0) {
		return (
			<p className="px-2 py-4 text-center text-sm text-muted-foreground">
				{emptyMessage}
			</p>
		);
	}

	return (
		<div className="max-h-72 overflow-y-auto">
			{projectCandidates.length > 0 && (
				<div>
					<p className="px-2 pb-1 pt-1 text-xs font-semibold text-muted-foreground">
						Eligible collaborators
					</p>

					<div className="space-y-1">
						{projectCandidates.map((candidate) => (
							<Fragment key={candidate.id}>
								{renderCandidate(candidate)}
							</Fragment>
						))}
					</div>
				</div>
			)}

			{teamCandidates.length > 0 && (
				<div
					className={cn(
						projectCandidates.length > 0 && "mt-2 border-t border-border pt-2",
					)}
				>
					<div className="px-2 pb-1">
						<p className="text-xs font-semibold text-muted-foreground">
							Your team
						</p>

						<p className="mt-0.5 text-xs leading-4 text-muted-foreground">
							Assigning someone from your team adds them to this project as a
							Member.
						</p>
					</div>

					<div className="space-y-1">
						{teamCandidates.map((candidate) => (
							<Fragment key={candidate.id}>
								{renderCandidate(candidate)}
							</Fragment>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

type AssigneeCandidateIdentityProps = {
	candidate: AssignmentCandidate;
	selected?: boolean;
	compact?: boolean;
	showEmail?: boolean;
};

export function AssigneeCandidateIdentity({
	candidate,
	selected = false,
	compact = false,
	showEmail = true,
}: AssigneeCandidateIdentityProps) {
	return (
		<>
			<UserAvatar
				user={candidate}
				className={cn("shrink-0", compact ? "size-7" : "size-9")}
			/>

			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-foreground">
					{candidate.name ?? candidate.email}
				</p>

				{candidate.jobTitle && (
					<p
						className={cn(
							"truncate text-xs text-muted-foreground",
							!compact && "font-medium",
						)}
					>
						{candidate.jobTitle}
					</p>
				)}

				{showEmail && (
					<p className="truncate text-xs text-muted-foreground">
						{candidate.email}
					</p>
				)}
			</div>

			{candidate.isOwner && (
				<span className="shrink-0 text-xs text-muted-foreground">Owner</span>
			)}

			{selected && (
				<Check aria-hidden="true" className="size-4 shrink-0 text-primary" />
			)}
		</>
	);
}
