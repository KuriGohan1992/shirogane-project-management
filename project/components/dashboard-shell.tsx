"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BarChart3,
	Bell,
	Calendar,
	FolderOpen,
	Home,
	Menu,
	Settings,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { DashboardKeyboardShortcuts } from "@/components/dashboard-keyboard-shortcuts";
import { GlobalSearch } from "@/components/global-search";
import { ShiroBrand } from "@/components/shiro-brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navigation = [
	{
		name: "Dashboard",
		href: "/dashboard",
		icon: Home,
	},
	{
		name: "Projects",
		href: "/projects",
		icon: FolderOpen,
	},
	{
		name: "Team",
		href: "/team",
		icon: Users,
	},
	{
		name: "Analytics",
		href: "/analytics",
		icon: BarChart3,
	},
	{
		name: "Calendar",
		href: "/calendar",
		icon: Calendar,
	},
	{
		name: "Settings",
		href: "/settings",
		icon: Settings,
	},
];

type DashboardShellProps = {
	children: ReactNode;
	serverTime: string;
};

function formatServerTime(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
		timeZone: "UTC",
		timeZoneName: "short",
	}).format(date);
}

export function DashboardShell({ children, serverTime }: DashboardShellProps) {
	const pathname = usePathname();

	const [sidebarOpen, setSidebarOpen] = useState(false);

	const [serverNow, setServerNow] = useState(() => new Date(serverTime));

	useEffect(() => {
		const serverStart = new Date(serverTime).getTime();
		const clientStart = Date.now();

		const updateServerTime = () => {
			setServerNow(new Date(serverStart + (Date.now() - clientStart)));
		};

		const interval = window.setInterval(updateServerTime, 30_000);

		return () => window.clearInterval(interval);
	}, [serverTime]);

	return (
		<div className="min-h-screen bg-background text-foreground">
			<DashboardKeyboardShortcuts />

			{sidebarOpen && (
				<button
					type="button"
					aria-label="Close navigation menu"
					className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px] lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform duration-300 ease-in-out lg:translate-x-0",
					sidebarOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<div className="flex h-16 items-center justify-between border-b border-border px-6">
					<ShiroBrand priority />

					<button
						type="button"
						aria-label="Close navigation menu"
						className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
						onClick={() => setSidebarOpen(false)}
					>
						<X aria-hidden="true" size={19} />
					</button>
				</div>

				<nav aria-label="Dashboard navigation" className="mt-5 px-3">
					<ul className="space-y-1">
						{navigation.map((item) => {
							const isActive =
								item.href === "/dashboard"
									? pathname === "/dashboard"
									: pathname === item.href ||
										pathname.startsWith(`${item.href}/`);

							const Icon = item.icon;

							return (
								<li key={item.href}>
									<Link
										href={item.href}
										aria-current={isActive ? "page" : undefined}
										className={cn(
											"flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
											isActive
												? "bg-primary text-primary-foreground shadow-sm"
												: "text-muted-foreground hover:bg-muted hover:text-foreground",
										)}
										onClick={() => setSidebarOpen(false)}
									>
										<Icon aria-hidden="true" className="mr-3" size={19} />

										{item.name}
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>
			</aside>

			<div className="lg:pl-64">
				<header className="sticky top-0 z-30 h-16 border-b border-border bg-card/95 backdrop-blur-md">
					<div className="mx-auto flex h-full w-full max-w-[1600px] items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
						<button
							type="button"
							aria-label="Open navigation menu"
							className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
							onClick={() => setSidebarOpen(true)}
						>
							<Menu aria-hidden="true" size={20} />
						</button>

						<div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
							<div className="flex flex-1 items-center">
								<GlobalSearch />
							</div>

							<div className="flex items-center gap-x-3">
								<button
									type="button"
									aria-label="View notifications"
									className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
								>
									<Bell aria-hidden="true" size={19} />
								</button>

								<ThemeToggle />

								<UserButton />
							</div>
						</div>
					</div>
				</header>

				<main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
					{children}
				</main>
			</div>

			<time
				dateTime={serverNow.toISOString()}
				title="Server-synchronized UTC time"
				className="pointer-events-none fixed bottom-0 right-0 z-[60] border-l border-t border-border bg-card/95 px-2.5 py-1 text-[11px] font-medium shadow-sm backdrop-blur"
			>
				Server time {formatServerTime(serverNow)}
			</time>
		</div>
	);
}
