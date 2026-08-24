"use client";

import { useClerk } from "@clerk/nextjs";
import { useActionState } from "react";

import { FormFieldError } from "@/components/form-field-error";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { updateProfileSettings } from "@/lib/actions/settings";
import { cn } from "@/lib/utils";
import type { ProfileSettingsActionState } from "@/types/settings";
import type { UserProfileSummary } from "@/types/user";

type ProfileField = keyof NonNullable<ProfileSettingsActionState["errors"]>;

type ProfileSettingsProps = {
	user: UserProfileSummary;
	firstName: string;
	lastName: string;
};

const initialState: ProfileSettingsActionState = {
	success: false,
};

const inputClassName =
	"h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-50";

export function ProfileSettings({
	user,
	firstName,
	lastName,
}: ProfileSettingsProps) {
	const clerk = useClerk();

	const [state, formAction, pending] = useActionState(
		updateProfileSettings,
		initialState,
	);

	const { getFieldErrors, clearFieldError } = useFieldErrors<ProfileField>(
		state.errors,
	);

	const firstNameErrors = getFieldErrors("firstName");
	const lastNameErrors = getFieldErrors("lastName");
	const jobTitleErrors = getFieldErrors("jobTitle");

	const hasFieldErrors = Object.values(state.errors ?? {}).some((errors) =>
		Boolean(errors?.length),
	);

	return (
		<form action={formAction} className="flex h-full flex-col gap-4" noValidate>
			<div className="flex items-center gap-3">
				<UserAvatar user={user} className="size-11 shrink-0" />

				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-semibold leading-tight text-foreground">
						{user.name?.trim() || user.email}
					</p>

					{user.jobTitle && (
						<p className="truncate text-sm font-medium leading-tight text-muted-foreground">
							{user.jobTitle}
						</p>
					)}

					<p className="mt-1 truncate text-xs text-muted-foreground">
						{user.email}
					</p>
				</div>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="shrink-0 text-muted-foreground hover:text-foreground"
					onClick={() => clerk.openUserProfile()}
				>
					Change avatar
				</Button>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<div>
					<label
						htmlFor="settings-first-name"
						className="mb-1 block text-xs font-medium text-muted-foreground"
					>
						First name
					</label>

					<input
						id="settings-first-name"
						name="firstName"
						type="text"
						required
						maxLength={50}
						defaultValue={firstName}
						disabled={pending}
						onChange={() => clearFieldError("firstName")}
						aria-invalid={Boolean(firstNameErrors)}
						aria-describedby={
							firstNameErrors ? "settings-first-name-error" : undefined
						}
						className={cn(
							inputClassName,
							firstNameErrors && "border-destructive",
						)}
					/>

					<FormFieldError
						id="settings-first-name-error"
						messages={firstNameErrors}
					/>
				</div>

				<div>
					<label
						htmlFor="settings-last-name"
						className="mb-1 block text-xs font-medium text-muted-foreground"
					>
						Last name
					</label>

					<input
						id="settings-last-name"
						name="lastName"
						type="text"
						maxLength={50}
						defaultValue={lastName}
						disabled={pending}
						onChange={() => clearFieldError("lastName")}
						aria-invalid={Boolean(lastNameErrors)}
						aria-describedby={
							lastNameErrors ? "settings-last-name-error" : undefined
						}
						className={cn(
							inputClassName,
							lastNameErrors && "border-destructive",
						)}
					/>

					<FormFieldError
						id="settings-last-name-error"
						messages={lastNameErrors}
					/>
				</div>
			</div>

			<div>
				<label
					htmlFor="settings-job-title"
					className="mb-1 block text-xs font-medium text-muted-foreground"
				>
					Job title
				</label>

				<input
					id="settings-job-title"
					name="jobTitle"
					type="text"
					maxLength={60}
					defaultValue={user.jobTitle ?? ""}
					disabled={pending}
					placeholder="e.g. Software Engineer"
					onChange={() => clearFieldError("jobTitle")}
					aria-invalid={Boolean(jobTitleErrors)}
					aria-describedby={
						jobTitleErrors ? "settings-job-title-error" : undefined
					}
					className={cn(inputClassName, jobTitleErrors && "border-destructive")}
				/>

				<FormFieldError
					id="settings-job-title-error"
					messages={jobTitleErrors}
				/>
			</div>

			<div>
				<label
					htmlFor="settings-email"
					className="mb-1 block text-xs font-medium text-muted-foreground"
				>
					Email
				</label>

				<input
					id="settings-email"
					type="email"
					value={user.email}
					readOnly
					disabled
					className="h-9 w-full cursor-not-allowed rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground"
				/>
			</div>

			<div className="mt-auto flex min-h-8 items-center justify-between gap-3 pt-3">
				<div className="min-w-0">
					{state.message && !hasFieldErrors && (
						<p
							aria-live="polite"
							className={cn(
								"truncate text-xs",
								state.success
									? "text-emerald-600 dark:text-emerald-400"
									: "text-destructive",
							)}
						>
							{state.message}
						</p>
					)}
				</div>

				<Button type="submit" size="sm" disabled={pending}>
					{pending ? "Saving..." : "Save"}
				</Button>
			</div>
		</form>
	);
}
