import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { getUnreadNotificationCount } from "@/lib/db/notifications";

type DashboardLayoutProps = Readonly<{
	children: ReactNode;
}>;

export default async function DashboardLayout({
	children,
}: DashboardLayoutProps) {
	const user = await getCurrentDatabaseUser();

	const initialNotificationCount = await getUnreadNotificationCount(user.id);

	return (
		<DashboardShell
			serverTime={new Date().toISOString()}
			initialNotificationCount={initialNotificationCount}
		>
			{children}
		</DashboardShell>
	);
}
