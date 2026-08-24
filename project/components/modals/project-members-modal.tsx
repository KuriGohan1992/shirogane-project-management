import {
	useActionState,
	useEffect,
	useRef,
	useState,
	useTransition,
} from "react";

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/user-avatar";
import { useFieldErrors } from "@/hooks/use-field-errors";
import {
	addProjectMember,
	removeProjectMember,
	updateProjectMemberRole,
} from "@/lib/actions/members";
import type { ProjectMemberRoleValue } from "@/lib/constants/project-roles";
import {
	PROJECT_MEMBER_ROLE_LABELS,
	PROJECT_MEMBER_ROLE_VALUES,
} from "@/lib/constants/project-roles";
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
	canManageMembers: boolean;
};

type MemberField = keyof NonNullable<ProjectMemberActionState["errors"]>;

type RoleDrafts = Record<string, ProjectMemberRoleValue>;

type RoleSaveFeedback =
	| {
			type: "success" | "error";
			message: string;
	  }
	| undefined;

const initialState: ProjectMemberActionState = {
	success: false,
};

function createRoleDrafts(members: ProjectMemberWithUser[]): RoleDrafts {
	return Object.fromEntries(
		members.map((member) => [member.userId, member.role]),
	) as RoleDrafts;
}

export function ProjectMembersModal({
	projectId,
	owner,
	members,
	open,
	onOpenChange,
	canManageMembers,
}: ProjectMembersModalProps) {
	const addMemberAction = addProjectMember.bind(null, projectId);

	const [state, formAction, pending] = useActionState(
		addMemberAction,
		initialState,
	);

	const [roleDrafts, setRoleDrafts] = useState<RoleDrafts>(() =>
		createRoleDrafts(members),
	);

	const [roleSaveFeedback, setRoleSaveFeedback] = useState<RoleSaveFeedback>();

	const [isSavingRoles, startRoleSaveTransition] = useTransition();

	const addMemberFormRef = useRef<HTMLFormElement>(null);

	const emailErrorId = "project-member-email-error";

	const { getFieldErrors, clearFieldError } = useFieldErrors<MemberField>(
		state.errors,
	);

	const emailErrors = getFieldErrors("email");

	const hasFieldErrors = Object.values(state.errors ?? {}).some((fieldErrors) =>
		Boolean(fieldErrors?.length),
	);

	const hasRoleChanges = members.some(
		(member) => (roleDrafts[member.userId] ?? member.role) !== member.role,
	);

	useEffect(() => {
		if (state.success) {
			addMemberFormRef.current?.reset();
		}
	}, [state]);

	useEffect(() => {
		setRoleDrafts((current) => {
			const next: RoleDrafts = {};

			for (const member of members) {
				next[member.userId] = current[member.userId] ?? member.role;
			}

			return next;
		});
	}, [members]);

	function handleRoleChange(userId: string, role: ProjectMemberRoleValue) {
		setRoleDrafts((current) => ({
			...current,
			[userId]: role,
		}));

		setRoleSaveFeedback(undefined);
	}

	function handleSaveRoleChanges() {
		const changedMembers = members.filter(
			(member) => (roleDrafts[member.userId] ?? member.role) !== member.role,
		);

		if (changedMembers.length === 0) {
			return;
		}

		setRoleSaveFeedback(undefined);

		startRoleSaveTransition(async () => {
			try {
				for (const member of changedMembers) {
					const role = roleDrafts[member.userId];

					if (!role) {
						continue;
					}

					const formData = new FormData();

					formData.set("role", role);

					await updateProjectMemberRole(projectId, member.userId, formData);
				}

				setRoleSaveFeedback({
					type: "success",
					message: "Collaborator roles updated.",
				});

				onOpenChange(false);
			} catch {
				setRoleSaveFeedback({
					type: "error",
					message: "Could not save collaborator role changes.",
				});
			}
		});
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="min-w-0 sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Project collaborators</DialogTitle>

					<DialogDescription>
						{canManageMembers
							? "Add existing Shiro users and manage their roles in this project."
							: "View the people collaborating on this project."}
					</DialogDescription>
				</DialogHeader>

				{/* Add collaborator */}
				{canManageMembers && (
					<form
						ref={addMemberFormRef}
						action={formAction}
						className="min-w-0 space-y-2"
						noValidate
					>
						<label
							htmlFor="project-member-email"
							className="block text-sm font-medium"
						>
							Add collaborator by email
						</label>

						<div className="flex min-w-0 items-start gap-2">
							<div className="min-w-0 flex-1">
								<input
									id="project-member-email"
									name="email"
									type="email"
									required
									disabled={pending}
									autoComplete="email"
									placeholder="collaborator@example.com"
									onChange={() => clearFieldError("email")}
									aria-invalid={Boolean(emailErrors)}
									aria-describedby={emailErrors ? emailErrorId : undefined}
									className={cn(
										"h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
										emailErrors && "border-destructive",
									)}
								/>

								<FormFieldError id={emailErrorId} messages={emailErrors} />
							</div>

							<Button
								type="submit"
								disabled={pending}
								className="h-9 shrink-0 px-5"
							>
								{pending ? "Adding..." : "Add collaborator"}
							</Button>
						</div>

						{state.message && !state.success && !hasFieldErrors && (
							<p aria-live="polite" className="text-sm text-destructive">
								{state.message}
							</p>
						)}

						{state.message && state.success && (
							<p
								aria-live="polite"
								className="text-sm text-emerald-600 dark:text-emerald-400"
							>
								{state.message}
							</p>
						)}
					</form>
				)}

				{/* Current collaborators */}
				<div
					className={cn(
						"min-w-0 space-y-3",
						canManageMembers && "border-t border-border pt-4",
					)}
				>
					<p className="text-sm font-medium">Current collaborators</p>

					<div className="max-h-64 min-w-0 space-y-2 overflow-y-auto pr-1">
						{/* Owner */}
						<div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border p-3">
							<UserAvatar user={owner} />

							<div className="min-w-0">
								<p className="truncate text-sm font-medium">
									{owner.name ?? owner.email}
								</p>

								<p className="mt-0.5 truncate text-xs text-muted-foreground">
									{owner.email}
								</p>
							</div>

							<span className="shrink-0 text-sm text-muted-foreground">
								Owner
							</span>
						</div>

						{/* Collaborators */}
						{members.map((member) => {
							const removeAction = removeProjectMember.bind(
								null,
								projectId,
								member.userId,
							);

							const selectedRole = roleDrafts[member.userId] ?? member.role;

							return (
								<div
									key={member.userId}
									className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border p-3"
								>
									<UserAvatar user={member.user} />

									<div className="min-w-0">
										<p className="truncate text-sm font-medium">
											{member.user.name ?? member.user.email}
										</p>

										<p className="mt-0.5 truncate text-xs text-muted-foreground">
											{member.user.email}
										</p>
									</div>

									{canManageMembers ? (
										<div className="flex shrink-0 items-center gap-2">
											<Select
												value={selectedRole}
												onValueChange={(value) =>
													handleRoleChange(
														member.userId,
														value as ProjectMemberRoleValue,
													)
												}
											>
												<SelectTrigger
													className="h-8 w-28"
													aria-label={`Role for ${
														member.user.name ?? member.user.email
													}`}
												>
													<SelectValue />
												</SelectTrigger>

												<SelectContent>
													{PROJECT_MEMBER_ROLE_VALUES.map((role) => (
														<SelectItem key={role} value={role}>
															{PROJECT_MEMBER_ROLE_LABELS[role]}
														</SelectItem>
													))}
												</SelectContent>
											</Select>

											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="h-8 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
															They will lose access to this project, and their
															task assignments in this project will be removed.
														</AlertDialogDescription>
													</AlertDialogHeader>

													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>

														<form action={removeAction}>
															<Button type="submit" variant="destructive">
																Remove collaborator
															</Button>
														</form>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									) : (
										<span className="shrink-0 text-sm text-muted-foreground">
											{PROJECT_MEMBER_ROLE_LABELS[member.role]}
										</span>
									)}
								</div>
							);
						})}

						{members.length === 0 && (
							<p className="px-1 py-2 text-sm text-muted-foreground">
								No collaborators have been added yet.
							</p>
						)}
					</div>

					{/* Save role changes */}
					{canManageMembers && (
						<div className="flex min-w-0 items-center justify-between gap-4 pt-1">
							<div className="min-w-0 flex-1">
								{roleSaveFeedback && (
									<p
										aria-live="polite"
										className={cn(
											"truncate text-sm",
											roleSaveFeedback.type === "success"
												? "text-emerald-600 dark:text-emerald-400"
												: "text-destructive",
										)}
									>
										{roleSaveFeedback.message}
									</p>
								)}
							</div>

							<Button
								type="button"
								className="shrink-0 px-5"
								disabled={!hasRoleChanges || isSavingRoles}
								onClick={handleSaveRoleChanges}
							>
								{isSavingRoles ? "Saving..." : "Save changes"}
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
