import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { getNotificationCenterDataForUser } from "@/lib/db/notifications";

type DashboardLayoutProps = Readonly<{
	children: ReactNode;
}>;

export default async function DashboardLayout({
	children,
}: DashboardLayoutProps) {
	const user = await getCurrentDatabaseUser();

	const initialNotifications = await getNotificationCenterDataForUser(user.id);

	return (
		<DashboardShell
			serverTime={new Date().toISOString()}
			initialNotifications={initialNotifications}
		>
			{children}
		</DashboardShell>
	);
}
