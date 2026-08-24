import {
	Bell,
	CalendarDays,
	Check,
	CircleCheckBig,
	Clock3,
	MessageSquare,
	MoreHorizontal,
	Search,
	Sparkles,
	UsersRound,
} from "lucide-react";

function MiniAvatar({
	initials,
	className = "",
}: {
	initials: string;
	className?: string;
}) {
	return (
		<span
			className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-semibold text-muted-foreground ${className}`}
		>
			{initials}
		</span>
	);
}

function Label({
	children,
	variant,
}: {
	children: React.ReactNode;
	variant: "blue" | "purple" | "cyan" | "orange";
}) {
	const classes = {
		blue: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
		purple:
			"border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
		cyan: "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300",
		orange:
			"border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300",
	};

	return (
		<span
			className={`rounded-md border px-1.5 py-0.5 text-[9px] font-medium ${classes[variant]}`}
		>
			{children}
		</span>
	);
}

function TaskCard({
	title,
	labels,
	priority,
	completed = false,
}: {
	title: string;
	labels: Array<{
		label: string;
		variant: "blue" | "purple" | "cyan" | "orange";
	}>;
	priority?: "High" | "Medium" | "Low";
	completed?: boolean;
}) {
	return (
		<div className="rounded-lg border border-border bg-card p-3 shadow-sm">
			<div className="flex items-start gap-2">
				<div
					className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
						completed
							? "border-emerald-500 bg-emerald-500 text-white"
							: "border-muted-foreground/70"
					}`}
				>
					{completed && <Check aria-hidden="true" className="size-2.5" />}
				</div>

				<p
					className={`min-w-0 flex-1 text-[11px] font-semibold leading-4 text-foreground ${
						completed ? "text-muted-foreground line-through" : ""
					}`}
				>
					{title}
				</p>

				<MoreHorizontal
					aria-hidden="true"
					className="size-3.5 shrink-0 text-muted-foreground"
				/>
			</div>

			<div className="mt-3 flex flex-wrap gap-1">
				{labels.map((label) => (
					<Label key={label.label} variant={label.variant}>
						{label.label}
					</Label>
				))}
			</div>

			<div className="mt-3 flex items-center border-t border-border pt-2">
				<div className="flex -space-x-1.5">
					<MiniAvatar initials="CM" />
					<MiniAvatar initials="AC" />
				</div>

				{priority && (
					<span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
						{priority}
					</span>
				)}

				<MessageSquare
					aria-hidden="true"
					className="ml-2 size-3 text-muted-foreground"
				/>
			</div>
		</div>
	);
}

function StageColumn({
	title,
	count,
	children,
}: {
	title: string;
	count: number;
	children: React.ReactNode;
}) {
	return (
		<div className="min-w-0 overflow-hidden rounded-xl border border-border bg-muted/50">
			<div className="flex h-9 items-center bg-primary px-3 text-primary-foreground">
				<p className="text-[10px] font-bold">{title}</p>

				<span className="ml-2 rounded bg-primary-foreground/15 px-1.5 py-0.5 text-[8px] font-semibold">
					{count}
				</span>
			</div>

			<div className="space-y-2 p-2">{children}</div>
		</div>
	);
}

export function LandingBoardArt() {
	return (
		<div className="relative mx-auto w-full max-w-[690px]">
			<div className="absolute -inset-5 rounded-[2.25rem] bg-primary/[0.06] dark:bg-primary/[0.08]" />

			<div className="absolute -left-4 top-14 z-20 hidden -rotate-6 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-lg sm:flex">
				<div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<Sparkles aria-hidden="true" className="size-4" />
				</div>

				<div>
					<p className="text-[10px] font-semibold text-foreground">
						Clear priorities
					</p>
					<p className="text-[9px] text-muted-foreground">No guessing</p>
				</div>
			</div>

			<div className="absolute -right-3 bottom-14 z-20 hidden rotate-3 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-lg sm:flex">
				<CircleCheckBig
					aria-hidden="true"
					className="size-5 text-emerald-500"
				/>

				<div>
					<p className="text-[10px] font-semibold text-foreground">Shipped</p>
					<p className="text-[9px] text-muted-foreground">3 tasks today</p>
				</div>
			</div>

			<div className="absolute -right-1 -top-4 z-20 hidden rotate-6 rounded-full border border-primary/20 bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground shadow-lg md:block">
				Live workspace
			</div>

			<div className="relative overflow-hidden rounded-[1.6rem] border border-border bg-card shadow-2xl">
				<div className="flex h-12 items-center border-b border-border bg-card px-4">
					<div className="flex items-center gap-1.5">
						<span className="size-2 rounded-full bg-muted-foreground/30" />
						<span className="size-2 rounded-full bg-muted-foreground/20" />
						<span className="size-2 rounded-full bg-muted-foreground/15" />
					</div>

					<div className="mx-auto flex h-7 w-48 items-center gap-2 rounded-md border border-border bg-background px-2 text-[9px] text-muted-foreground">
						<Search aria-hidden="true" className="size-3" />
						Search projects and tasks...
					</div>

					<div className="flex items-center gap-2">
						<Bell
							aria-hidden="true"
							className="size-3.5 text-muted-foreground"
						/>
						<MiniAvatar initials="CM" />
					</div>
				</div>

				<div className="grid grid-cols-[3rem_minmax(0,1fr)]">
					<aside className="border-r border-border bg-card p-2">
						<div className="mx-auto mb-3 size-6 rounded-md bg-primary" />

						<div className="space-y-2">
							{["one", "two", "three", "four"].map((item, index) => (
								<div
									key={item}
									className={`mx-auto size-6 rounded-md ${
										index === 1 ? "bg-primary/12" : "bg-muted"
									}`}
								/>
							))}
						</div>
					</aside>

					<div className="min-w-0 bg-background p-4">
						<div className="flex items-start justify-between gap-4">
							<div>
								<div className="flex items-center gap-2">
									<span className="size-2 rounded-full bg-cyan-500" />

									<p className="text-xs font-bold text-foreground">
										Shiro Mobile Companion
									</p>
								</div>

								<p className="mt-1 text-[9px] text-muted-foreground">
									12 tasks · 6 collaborators
								</p>
							</div>

							<div className="flex items-center gap-1.5">
								<div className="flex -space-x-1.5">
									<MiniAvatar initials="CM" />
									<MiniAvatar initials="MR" />
									<MiniAvatar initials="+4" />
								</div>

								<div className="flex h-6 items-center gap-1 rounded-md border border-border bg-card px-2 text-[9px] text-muted-foreground">
									<CalendarDays aria-hidden="true" className="size-3" />
									Aug 24
								</div>
							</div>
						</div>

						<div className="mt-4 grid grid-cols-3 gap-2">
							<StageColumn title="Backlog" count={4}>
								<TaskCard
									title="Plan analytics filters"
									labels={[
										{ label: "Design", variant: "purple" },
										{ label: "Frontend", variant: "cyan" },
									]}
									priority="Medium"
								/>

								<TaskCard
									title="Write onboarding docs"
									labels={[{ label: "Backend", variant: "blue" }]}
									priority="Low"
								/>
							</StageColumn>

							<StageColumn title="In Progress" count={3}>
								<TaskCard
									title="Build calendar views"
									labels={[
										{ label: "Frontend", variant: "cyan" },
										{ label: "Research", variant: "orange" },
									]}
									priority="High"
								/>

								<TaskCard
									title="Refine task details"
									labels={[{ label: "Design", variant: "purple" }]}
								/>
							</StageColumn>

							<StageColumn title="Review" count={2}>
								<TaskCard
									title="Permission recovery"
									labels={[
										{ label: "Backend", variant: "blue" },
										{ label: "Frontend", variant: "cyan" },
									]}
									priority="High"
								/>

								<TaskCard
									title="Responsive navigation"
									labels={[{ label: "Design", variant: "purple" }]}
									completed
								/>
							</StageColumn>
						</div>

						<div className="mt-3 grid grid-cols-3 gap-2">
							<div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2">
								<Clock3 aria-hidden="true" className="size-3.5 text-primary" />
								<div>
									<p className="text-[8px] text-muted-foreground">Due soon</p>
									<p className="text-[10px] font-semibold text-foreground">4</p>
								</div>
							</div>

							<div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2">
								<UsersRound
									aria-hidden="true"
									className="size-3.5 text-primary"
								/>
								<div>
									<p className="text-[8px] text-muted-foreground">Team</p>
									<p className="text-[10px] font-semibold text-foreground">6</p>
								</div>
							</div>

							<div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2">
								<CircleCheckBig
									aria-hidden="true"
									className="size-3.5 text-emerald-500"
								/>
								<div>
									<p className="text-[8px] text-muted-foreground">Completed</p>
									<p className="text-[10px] font-semibold text-foreground">
										18
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
