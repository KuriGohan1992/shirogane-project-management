import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard-shell";

type DashboardLayoutProps = Readonly<{
	children: ReactNode;
}>;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<DashboardShell serverTime={new Date().toISOString()}>
			{children}
		</DashboardShell>
	);
}
