"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BarChart3,
	Calendar,
	ChevronLeft,
	ChevronRight,
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
import { NotificationCenter } from "./notification-center";

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
	initialNotificationCount: number;
};
function formatServerTime(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
		timeZone: "UTC",
		timeZoneName: "short",
	}).format(date);
}

function isEditableTarget(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) {
		return false;
	}

	return (
		target instanceof HTMLInputElement ||
		target instanceof HTMLTextAreaElement ||
		target instanceof HTMLSelectElement ||
		target.isContentEditable
	);
}

export function DashboardShell({
	children,
	serverTime,
	initialNotificationCount,
}: DashboardShellProps) {
	const pathname = usePathname();

	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	const [serverNow, setServerNow] = useState(() => new Date(serverTime));

	/*
	 * Keep the displayed server time moving without asking
	 * the server for a new value every few seconds.
	 */
	useEffect(() => {
		const serverStart = new Date(serverTime).getTime();
		const clientStart = Date.now();

		const updateServerTime = () => {
			setServerNow(new Date(serverStart + (Date.now() - clientStart)));
		};

		const interval = window.setInterval(updateServerTime, 30_000);

		return () => {
			window.clearInterval(interval);
		};
	}, [serverTime]);

	/*
	 * Cmd/Ctrl + B toggles the desktop sidebar.
	 *
	 * We intentionally ignore the shortcut while typing in
	 * inputs, textareas, selects, or contenteditable elements.
	 */
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (
				event.key.toLowerCase() !== "b" ||
				(!event.metaKey && !event.ctrlKey) ||
				event.altKey ||
				event.shiftKey
			) {
				return;
			}

			if (isEditableTarget(event.target)) {
				return;
			}

			event.preventDefault();

			setSidebarCollapsed((current) => !current);
		}

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	return (
		<div className="min-h-screen bg-background text-foreground">
			<DashboardKeyboardShortcuts />

			{/* Mobile backdrop */}
			{sidebarOpen && (
				<button
					type="button"
					aria-label="Close navigation menu"
					className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px] lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				id="dashboard-sidebar"
				className={cn(
					"fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-[transform,width] duration-200 ease-out lg:translate-x-0",
					sidebarOpen ? "translate-x-0" : "-translate-x-full",
					sidebarCollapsed ? "lg:w-20" : "lg:w-64",
				)}
			>
				{/* Brand */}
				<div
					className={cn(
						"flex h-16 items-center justify-between border-b border-border px-6",
						sidebarCollapsed && "lg:justify-center lg:px-0",
					)}
				>
					<ShiroBrand
						priority
						className={cn(sidebarCollapsed && "lg:gap-0 lg:[&>span]:hidden")}
					/>

					{/* Mobile close button */}
					<button
						type="button"
						aria-label="Close navigation menu"
						className="inline-flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
						onClick={() => setSidebarOpen(false)}
					>
						<X aria-hidden="true" size={19} />
					</button>
				</div>

				<button
					type="button"
					aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					title={
						sidebarCollapsed
							? "Expand sidebar — Ctrl/⌘ + B"
							: "Collapse sidebar — Ctrl/⌘ + B"
					}
					aria-expanded={!sidebarCollapsed}
					aria-controls="dashboard-sidebar"
					onClick={() => setSidebarCollapsed((current) => !current)}
					className="group absolute left-full top-8 z-10 hidden h-9 w-6 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-border bg-card text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex"
				>
					{sidebarCollapsed ? (
						<ChevronRight
							aria-hidden="true"
							size={18}
							strokeWidth={3}
							className="transition-[transform,stroke-width] duration-150 group-hover:scale-110 group-hover:[stroke-width:3.5]"
						/>
					) : (
						<ChevronLeft
							aria-hidden="true"
							size={18}
							strokeWidth={3}
							className="transition-[transform,stroke-width] duration-150 group-hover:scale-110 group-hover:[stroke-width:3.5]"
						/>
					)}
				</button>

				{/* Navigation */}
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
										aria-label={sidebarCollapsed ? item.name : undefined}
										title={sidebarCollapsed ? item.name : undefined}
										className={cn(
											"flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-[background-color,color] duration-150",
											isActive
												? "bg-primary text-primary-foreground"
												: "text-muted-foreground hover:bg-muted hover:text-foreground",
											sidebarCollapsed && "lg:justify-center lg:px-0",
										)}
										onClick={() => setSidebarOpen(false)}
									>
										<Icon
											aria-hidden="true"
											size={19}
											className={cn(
												"shrink-0",
												sidebarCollapsed ? "lg:mr-0" : "mr-3",
											)}
										/>

										<span
											className={cn(
												"whitespace-nowrap",
												sidebarCollapsed && "lg:hidden",
											)}
										>
											{item.name}
										</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>
			</aside>

			{/* Page area */}
			<div
				className={cn(
					"min-w-0 transition-[padding] duration-200 ease-out",
					sidebarCollapsed ? "lg:pl-20" : "lg:pl-64",
				)}
			>
				<header className="sticky top-0 z-30 h-16 border-b border-border bg-card/95 backdrop-blur-md">
					<div className="mx-auto flex h-full w-full max-w-[1600px] items-center gap-x-2 px-3 sm:gap-x-4 sm:px-6 lg:px-8">
						{/* Mobile menu only */}
						<button
							type="button"
							aria-label="Open navigation menu"
							className="group inline-flex size-9 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
							onClick={() => setSidebarOpen(true)}
						>
							<Menu
								aria-hidden="true"
								size={20}
								className="transition-transform duration-150 group-hover:scale-110"
							/>
						</button>

						<div className="flex min-w-0 flex-1 gap-x-2 self-stretch sm:gap-x-4 lg:gap-x-6">
							<div className="flex min-w-0 flex-1 items-center">
								<GlobalSearch />
							</div>

							<div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
								<div className="flex items-center gap-1">
									<NotificationCenter
										initialUnreadCount={initialNotificationCount}
									/>

									<ThemeToggle />
								</div>

								<UserButton />
							</div>
						</div>
					</div>
				</header>

				<main className="mx-auto w-full min-w-0 max-w-[1600px] overflow-x-clip px-4 pb-8 pt-5 sm:px-6 lg:px-8">
					{children}
				</main>
			</div>

			<time
				dateTime={serverNow.toISOString()}
				title="Server-synchronized UTC time"
				className="pointer-events-none fixed bottom-0 right-0 z-[60] border-l border-t border-border bg-card/95 px-2.5 py-1 text-[11px] font-medium backdrop-blur"
			>
				Server time {formatServerTime(serverNow)}
			</time>
		</div>
	);
}
