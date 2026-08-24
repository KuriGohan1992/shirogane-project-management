"use client";

import { useClerk } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

type SecuritySettingsProps = {
	email: string;
};

export function SecuritySettings({ email }: SecuritySettingsProps) {
	const clerk = useClerk();

	return (
		<div className="flex h-full items-center gap-4">
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-foreground">
					{email}
				</p>

				<p className="mt-0.5 text-xs text-muted-foreground">
					Email, password, sign-in methods, and account security.
				</p>
			</div>

			<Button
				type="button"
				variant="outline"
				size="sm"
				className="shrink-0"
				onClick={() => clerk.openUserProfile()}
			>
				Manage account
			</Button>
		</div>
	);
}