import { Clock3, FolderOpen, UserCheck } from "lucide-react";
import Link from "next/link";

import { CreateProjectButton } from "@/components/create-project-button";
import { RecentProjects } from "@/components/recent-projects";
import { TaskPriorityBadge } from "@/components/task-priority-badge";
import { UserAvatar } from "@/components/user-avatar";
import { formatActivityDate, getActivityMessage } from "@/lib/activity-display";
import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { getColorHex } from "@/lib/constants/colors";
import {
	type DashboardActivitySummary,
	type DashboardTaskSummary,
	getDashboardForUser,
} from "@/lib/db/dashboard";
import { getTaskHref } from "@/lib/task-route";

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

function getFirstName(name: string | null) {
	return name?.trim().split(/\s+/)[0] || null;
}

function DashboardMetric({ label, value }: { label: string; value: number }) {
	return (
		<div className="min-w-0">
			<dt className="text-sm font-semibold text-muted-foreground">{label}</dt>

			<dd className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
				{value}
			</dd>
		</div>
	);
}

function DashboardPanelHeader({ id, title }: { id: string; title: string }) {
	return (
		<div className="shrink-0 border-b border-primary bg-primary px-5 py-3 text-primary-foreground">
			<h2 id={id} className="text-lg font-bold">
				{title}
			</h2>
		</div>
	);
}

function DashboardTaskList({ tasks }: { tasks: DashboardTaskSummary[] }) {
	if (tasks.length === 0) {
		return (
			<div className="flex min-h-48 flex-1 flex-col items-center justify-center px-6 text-center">
				<UserCheck
					aria-hidden="true"
					className="size-6 text-muted-foreground"
				/>

				<p className="mt-3 text-sm font-semibold">
					No active tasks assigned to you
				</p>
			</div>
		);
	}

	return (
		<div className="divide-y divide-border">
			{tasks.map((task) => (
				<Link
					key={task.id}
					href={getTaskHref(task.projectId, task.id, task.title)}
					className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted"
				>
					<div
						aria-hidden="true"
						className="h-10 w-[3px] shrink-0 rounded-sm"
						style={{
							backgroundColor: getColorHex(task.projectColor),
						}}
					/>

					<div className="min-w-0 flex-1">
						<div className="flex min-w-0 items-center gap-2">
							<p className="truncate text-sm font-bold text-foreground">
								{task.title}
							</p>

							{task.priority && (
								<TaskPriorityBadge
									priority={task.priority}
									className="shrink-0"
								/>
							)}
						</div>

						<div className="mt-1 flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
							<span className="truncate">{task.projectName}</span>

							<span
								aria-hidden="true"
								className="h-3 w-px shrink-0 bg-border"
							/>

							<span className="truncate">{task.stageName}</span>
						</div>
					</div>

					<p className="shrink-0 text-xs font-medium text-muted-foreground">
						{task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date"}
					</p>
				</Link>
			))}
		</div>
	);
}

function DashboardActivityList({
	activities,
}: {
	activities: DashboardActivitySummary[];
}) {
	if (activities.length === 0) {
		return (
			<div className="flex min-h-48 flex-1 flex-col items-center justify-center px-6 text-center">
				<Clock3 aria-hidden="true" className="size-6 text-muted-foreground" />

				<p className="mt-3 text-sm font-semibold">No recent activity</p>
			</div>
		);
	}

	return (
		<div className="divide-y divide-border">
			{activities.map((activity) => {
				const actorName =
					activity.actor?.name ?? activity.actor?.email ?? "Former member";

				return (
					<div key={activity.id} className="flex gap-3 px-4 py-3">
						{activity.actor ? (
							<UserAvatar user={activity.actor} className="size-8 shrink-0" />
						) : (
							<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
								?
							</div>
						)}

						<div className="min-w-0 flex-1">
							<p className="text-sm leading-5 text-foreground/90">
								<span className="font-bold text-foreground">{actorName}</span>{" "}
								{getActivityMessage(activity)}
							</p>

							<div className="mt-1 flex min-w-0 items-center gap-4 text-xs">
								<Link
									href={`/projects/${activity.project.id}`}
									title={activity.project.name}
									className="min-w-0 truncate font-semibold text-brand transition-opacity hover:opacity-80"
								>
									{activity.project.name}
								</Link>

								<time
									dateTime={activity.createdAt.toISOString()}
									className="ml-auto shrink-0 text-right text-muted-foreground"
								>
									{formatActivityDate(activity.createdAt)}
								</time>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default async function DashboardPage() {
	const user = await getCurrentDatabaseUser();

	const dashboard = await getDashboardForUser(user.id);

	const firstName = getFirstName(user.name);

	if (!dashboard.hasProjects) {
		return (
			<div className="flex min-h-[calc(100vh-8rem)] flex-col">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

					<p className="mt-1 text-base font-medium text-muted-foreground">
						{firstName ? `Welcome, ${firstName}.` : "Welcome to Shiro."}
					</p>
				</div>

				<div className="flex flex-1 flex-col items-center justify-center text-center">
					<FolderOpen
						aria-hidden="true"
						className="size-9 text-muted-foreground"
					/>

					<h2 className="mt-4 text-xl font-bold">Create your first project</h2>

					<p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
						Projects organize your stages, tasks, members, labels, and activity.
					</p>

					<div className="mt-5">
						<CreateProjectButton />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-[calc(100vh-8rem)] flex-col gap-5 xl:h-[calc(100vh-8rem)] xl:min-h-0 xl:overflow-hidden">
			<div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(25rem,0.88fr)]">
				<div className="flex min-h-0 flex-col">
					<div className="flex shrink-0 items-start justify-between gap-6">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

							<p className="mt-1 text-base font-medium text-muted-foreground">
								{firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
							</p>
						</div>

						<CreateProjectButton />
					</div>

					<dl className="mt-4 flex shrink-0 flex-wrap items-start gap-x-8 gap-y-3">
						<DashboardMetric
							label="Active projects"
							value={dashboard.stats.activeProjectCount}
						/>

						<DashboardMetric
							label="Your tasks"
							value={dashboard.stats.assignedTaskCount}
						/>

						<DashboardMetric
							label="Urgent tasks"
							value={dashboard.stats.urgentTaskCount}
						/>
					</dl>

					<section
						aria-labelledby="dashboard-my-tasks-heading"
						className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card"
					>
						<DashboardPanelHeader
							id="dashboard-my-tasks-heading"
							title="My tasks"
						/>

						<div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
							<DashboardTaskList tasks={dashboard.myTasks} />
						</div>
					</section>
				</div>

				<section
					aria-labelledby="dashboard-recent-activity-heading"
					className="flex min-h-[28rem] flex-col overflow-hidden rounded-xl border border-border bg-card xl:min-h-0"
				>
					<DashboardPanelHeader
						id="dashboard-recent-activity-heading"
						title="Recent activity"
					/>

					<div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
						<DashboardActivityList activities={dashboard.recentActivity} />
					</div>
				</section>
			</div>

			<section
				aria-labelledby="dashboard-recent-projects-heading"
				className="flex h-64 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card"
			>
				<div className="flex shrink-0 items-center justify-between gap-4 border-b border-primary bg-primary px-5 py-3 text-primary-foreground">
					<h2
						id="dashboard-recent-projects-heading"
						className="text-lg font-bold"
					>
						Recent projects
					</h2>

					<Link
						href="/projects"
						className="text-xs font-bold text-primary-foreground/75 transition-colors hover:text-primary-foreground"
					>
						View all
					</Link>
				</div>

				<div className="min-h-0 flex-1">
					<RecentProjects projects={dashboard.recentProjects} />
				</div>
			</section>
		</div>
	);
}
