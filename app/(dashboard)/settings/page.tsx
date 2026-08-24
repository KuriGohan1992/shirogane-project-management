import { currentUser } from "@clerk/nextjs/server";

import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import type { NotificationPreferences } from "@/lib/constants/notifications";

function splitFallbackName(name: string | null) {
	const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];

	return {
		firstName: parts[0] ?? "",
		lastName: parts.slice(1).join(" "),
	};
}

function SettingsCard({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
			<div className="shrink-0 border-b border-primary bg-primary px-5 py-3 text-primary-foreground">
				<h2 className="text-lg font-bold">{title}</h2>
			</div>

			<div className="min-h-0 flex-1 p-5">{children}</div>
		</section>
	);
}

export default async function SettingsPage() {
	const [databaseUser, clerkUser] = await Promise.all([
		getCurrentDatabaseUser(),
		currentUser(),
	]);

	const fallbackName = splitFallbackName(databaseUser.name);

	const firstName = clerkUser?.firstName?.trim() || fallbackName.firstName;
	const lastName = clerkUser?.lastName?.trim() || fallbackName.lastName;

	const notificationPreferences: NotificationPreferences = {
		notificationsMuted: databaseUser.notificationsMuted,
		mutedCategories: databaseUser.mutedNotificationCategories,
	};

	return (
		<div className="space-y-5 pb-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>

				<p className="mt-1 text-base font-medium text-muted-foreground">
					Account and application preferences.
				</p>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<SettingsCard title="Profile">
					<ProfileSettings
						user={databaseUser}
						firstName={firstName}
						lastName={lastName}
					/>
				</SettingsCard>

				<SettingsCard title="Notifications">
					<NotificationSettings initialPreferences={notificationPreferences} />
				</SettingsCard>

				<SettingsCard title="Security">
					<SecuritySettings email={databaseUser.email} />
				</SettingsCard>

				<SettingsCard title="Appearance">
					<AppearanceSettings />
				</SettingsCard>
			</div>
		</div>
	);
}
