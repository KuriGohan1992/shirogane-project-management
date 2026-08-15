import { useActionState, useEffect } from "react";

import { FormFieldError } from "@/components/form-field-error";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/user-avatar";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { addProjectMember, removeProjectMember } from "@/lib/actions/members";
import { cn } from "@/lib/utils";
import type {
	ProjectMemberActionState,
	ProjectMemberWithUser,
} from "@/types/member";
import type { UserSummary } from "@/types/user";

type ProjectMembersModalProps = {
	projectId: string;
	owner: UserSummary;
	members: ProjectMemberWithUser[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type MemberField = keyof NonNullable<ProjectMemberActionState["errors"]>;

const initialState: ProjectMemberActionState = {
	success: false,
};

export function ProjectMembersModal({
	projectId,
	owner,
	members,
	open,
	onOpenChange,
}: ProjectMembersModalProps) {
	const addMemberAction = addProjectMember.bind(null, projectId);

	const [state, formAction, pending] = useActionState(
		addMemberAction,
		initialState,
	);

	const emailErrorId = "project-member-email-error";

	const { getFieldErrors, clearFieldError } = useFieldErrors<MemberField>(
		state.errors,
	);

	const emailErrors = getFieldErrors("email");

	const hasFieldErrors = Object.values(state.errors ?? {}).some((fieldErrors) =>
		Boolean(fieldErrors?.length),
	);

	useEffect(() => {
		if (state.success) {
			onOpenChange(false);
		}
	}, [state.success, onOpenChange]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Project members</DialogTitle>

					<DialogDescription>
						Add existing Shiro users and manage who belongs to this project.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3">
					<p className="text-sm font-medium">Current members</p>

					<div className="max-h-64 space-y-2 overflow-y-auto pr-1">
						<div className="flex items-center gap-3 rounded-lg border border-border p-3">
							<UserAvatar user={owner} />

							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium">
									{owner.name ?? owner.email}
								</p>

								<p className="truncate text-xs text-muted-foreground">
									{owner.email}
								</p>
							</div>

							<span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
								Owner
							</span>
						</div>

						{members.map((member) => {
							const removeAction = removeProjectMember.bind(
								null,
								projectId,
								member.userId,
							);

							return (
								<div
									key={member.userId}
									className="flex items-center gap-3 rounded-lg border border-border p-3"
								>
									<UserAvatar user={member.user} />

									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium">
											{member.user.name ?? member.user.email}
										</p>

										<p className="truncate text-xs text-muted-foreground">
											{member.user.email}
										</p>
									</div>

									<span className="text-xs capitalize text-muted-foreground">
										{member.role}
									</span>

									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="text-muted-foreground hover:text-destructive"
											>
												Remove
											</Button>
										</AlertDialogTrigger>

										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													Remove {member.user.name ?? member.user.email}?
												</AlertDialogTitle>

												<AlertDialogDescription>
													They will lose their project membership, and their
													task assignments in this project will be removed.
												</AlertDialogDescription>
											</AlertDialogHeader>

											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>

												<form action={removeAction}>
													<Button type="submit" variant="destructive">
														Remove member
													</Button>
												</form>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							);
						})}

						{members.length === 0 && (
							<p className="px-1 py-2 text-sm text-muted-foreground">
								No collaborators have been added yet.
							</p>
						)}
					</div>
				</div>

				<form
					action={formAction}
					className="space-y-4 border-t border-border pt-4"
					noValidate
				>
					<div>
						<label
							htmlFor="project-member-email"
							className="mb-2 block text-sm font-medium"
						>
							Add member by email
						</label>

						<input
							id="project-member-email"
							name="email"
							type="email"
							required
							disabled={pending}
							autoComplete="email"
							placeholder="member@example.com"
							onChange={() => clearFieldError("email")}
							aria-invalid={Boolean(emailErrors)}
							aria-describedby={emailErrors ? emailErrorId : undefined}
							className={cn(
								"w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
								emailErrors && "border-destructive",
							)}
						/>

						<FormFieldError id={emailErrorId} messages={emailErrors} />
					</div>

					{state.message && !state.success && !hasFieldErrors && (
						<p aria-live="polite" className="text-sm text-destructive">
							{state.message}
						</p>
					)}

					<Button type="submit" disabled={pending} className="w-full">
						{pending ? "Adding..." : "Add member"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
