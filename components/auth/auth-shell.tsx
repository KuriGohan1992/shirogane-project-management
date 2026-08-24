import {
	BarChart3,
	CalendarDays,
	Check,
	CircleCheckBig,
	Columns3,
	Sparkles,
	UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";

import { ShiroBrand } from "@/components/shiro-brand";
import { ThemeToggle } from "@/components/theme-toggle";

type AuthShellProps = {
	children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
	return (
		<main className="relative min-h-screen overflow-hidden bg-background">
			<div aria-hidden="true" className="pointer-events-none absolute inset-0">
				<div className="absolute -left-48 top-1/4 size-[30rem] rounded-full bg-primary/[0.06] blur-3xl" />
				<div className="absolute -right-48 bottom-1/4 size-[30rem] rounded-full bg-primary/[0.05] blur-3xl" />
			</div>

			<header className="absolute inset-x-0 top-0 z-20 flex h-20 items-center justify-between px-6 sm:px-10">
				<ShiroBrand priority />
				<ThemeToggle />
			</header>

			<div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-28">
				<div className="w-full max-w-md">{children}</div>
			</div>

			<div
				aria-hidden="true"
				className="pointer-events-none absolute bottom-0 left-0 hidden h-[22rem] w-[26rem] lg:block"
			>
				<div className="absolute bottom-5 left-8 w-64 -rotate-3 rounded-2xl border border-border bg-card p-4 shadow-xl">
					<div className="mb-3 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
								<Columns3 className="size-4" />
							</div>

							<div>
								<div className="h-2 w-20 rounded-full bg-foreground/20" />
								<div className="mt-1.5 h-1.5 w-12 rounded-full bg-muted-foreground/20" />
							</div>
						</div>

						<span className="rounded-md bg-primary/10 px-2 py-1 text-[9px] font-bold text-primary">
							BOARD
						</span>
					</div>

					<div className="grid grid-cols-3 gap-2">
						{["Backlog", "Doing", "Review"].map((stage) => (
							<div
								key={stage}
								className="overflow-hidden rounded-lg border border-border bg-background"
							>
								<div className="bg-primary px-2 py-1.5 text-[8px] font-bold text-primary-foreground">
									{stage}
								</div>

								<div className="space-y-1.5 p-2">
									<div className="rounded border border-border bg-card p-1.5">
										<div className="h-1.5 w-4/5 rounded-full bg-muted" />
										<div className="mt-1.5 h-1 w-1/2 rounded-full bg-primary/25" />
									</div>

									<div className="rounded border border-border bg-card p-1.5">
										<div className="h-1.5 w-3/5 rounded-full bg-muted" />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="absolute bottom-44 left-8 rotate-[-10deg] rounded-xl border border-primary/20 bg-primary px-3 py-2 text-primary-foreground shadow-lg">
					<div className="flex items-center gap-2">
						<Sparkles className="size-4" />
						<span className="text-xs font-bold">Stay focused</span>
					</div>
				</div>

				<div className="absolute bottom-4 left-72 rotate-6 rounded-full border border-border bg-card p-3 shadow-lg">
					<CircleCheckBig className="size-6 text-emerald-500" />
				</div>
			</div>

			<div
				aria-hidden="true"
				className="pointer-events-none absolute bottom-0 right-0 hidden h-[22rem] w-[27rem] lg:block"
			>
				<div className="absolute bottom-6 right-8 w-52 rotate-3 rounded-2xl border border-border bg-card p-4 shadow-xl">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<CalendarDays className="size-4 text-primary" />
							<span className="text-xs font-bold text-foreground">August</span>
						</div>

						<span className="text-[9px] font-semibold text-muted-foreground">
							2026
						</span>
					</div>

					<div className="mt-4 grid grid-cols-7 gap-1">
						{[
							"cal-1",
							"cal-2",
							"cal-3",
							"cal-4",
							"cal-5",
							"cal-6",
							"cal-7",
							"cal-8",
							"cal-9",
							"cal-10",
							"cal-11",
							"cal-12",
							"cal-13",
							"cal-14",
							"cal-15",
							"cal-16",
							"cal-17",
							"cal-18",
							"cal-19",
							"cal-20",
							"cal-21",
						].map((id) => (
							<div
								key={id}
								className={`aspect-square rounded ${
									id === "cal-17"
										? "bg-primary"
										: id === "cal-18" || id === "cal-19"
											? "bg-primary/20"
											: "bg-muted"
								}`}
							/>
						))}
					</div>
				</div>

				<div className="absolute bottom-48 right-10 -rotate-6 rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
					<div className="flex items-center gap-2">
						<UsersRound className="size-4 text-primary" />

						<div>
							<p className="text-[10px] font-bold text-foreground">
								6 collaborators
							</p>
							<p className="text-[9px] text-muted-foreground">
								Working together
							</p>
						</div>
					</div>
				</div>

				<div className="absolute bottom-9 right-64 -rotate-6 rounded-xl border border-border bg-card p-3 shadow-lg">
					<div className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
							<BarChart3 className="size-4 text-primary" />
						</div>

						<div>
							<p className="text-[9px] text-muted-foreground">
								Project progress
							</p>

							<div className="mt-1 flex items-center gap-1">
								<p className="text-sm font-bold text-foreground">78%</p>
								<Check className="size-3 text-emerald-500" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
