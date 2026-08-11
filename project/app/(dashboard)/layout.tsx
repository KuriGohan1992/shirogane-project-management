"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BarChart3,
	Bell,
	Calendar,
	FolderOpen,
	Home,
	Menu,
	Search,
	Settings,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: Home },
	{ name: "Projects", href: "/projects", icon: FolderOpen },
	{ name: "Team", href: "/team", icon: Users },
	{ name: "Analytics", href: "/analytics", icon: BarChart3 },
	{ name: "Calendar", href: "/calendar", icon: Calendar },
	{ name: "Settings", href: "/settings", icon: Settings },
];

type DashboardLayoutProps = Readonly<{
	children: ReactNode;
}>;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const pathname = usePathname();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="min-h-screen bg-background">
			{sidebarOpen && (
				<button
					type="button"
					aria-label="Close navigation menu"
					className="fixed inset-0 z-40 bg-black/50 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			<aside
				className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform duration-300 ease-in-out lg:translate-x-0 ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex h-16 items-center justify-between border-b border-border px-6">
					<Link href="/" className="text-2xl font-bold text-brand">
						Shiro
					</Link>

					<button
						type="button"
						aria-label="Close navigation menu"
						className="rounded-lg p-2 hover:bg-muted lg:hidden"
						onClick={() => setSidebarOpen(false)}
					>
						<X aria-hidden="true" size={20} />
					</button>
				</div>

				<nav aria-label="Dashboard navigation" className="mt-6 px-3">
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
										className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
											isActive
												? "bg-brand-soft text-primary dark:bg-primary/15"
												: "text-foreground hover:bg-muted"
										}`}
										onClick={() => setSidebarOpen(false)}
									>
										<Icon aria-hidden="true" className="mr-3" size={20} />
										{item.name}
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>
			</aside>

			<div className="lg:pl-64">
				<header className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-border bg-card px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
					<button
						type="button"
						aria-label="Open navigation menu"
						className="rounded-lg p-2 hover:bg-muted lg:hidden"
						onClick={() => setSidebarOpen(true)}
					>
						<Menu aria-hidden="true" size={20} />
					</button>

					<div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
						<div className="flex flex-1 items-center">
							<div className="relative w-full max-w-md">
								<Search
									aria-hidden="true"
									className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
									size={16}
								/>

								<input
									type="search"
									aria-label="Search projects and tasks"
									placeholder="Search projects and tasks..."
									className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
								/>
							</div>
						</div>

						<div className="flex items-center gap-x-4 lg:gap-x-6">
							<button
								type="button"
								aria-label="View notifications"
								className="rounded-lg p-2 hover:bg-muted"
							>
								<Bell aria-hidden="true" size={20} />
							</button>

							<ThemeToggle />

							<UserButton />
						</div>
					</div>
				</header>

				<main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
			</div>
		</div>
	);
}
