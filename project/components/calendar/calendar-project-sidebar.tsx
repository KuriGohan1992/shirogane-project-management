import { CalendarRange, Clock3, FolderOpen, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CalendarProjectTaskRow } from "@/components/calendar/calendar-project-task-row";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { UserAvatar } from "@/components/user-avatar";
import {
	formatActivityDate,
	formatCalendarProjectSchedule,
} from "@/lib/calendar-dates";
import { getColorHex } from "@/lib/constants/colors";
import type { CalendarProjectSummary } from "@/types/calendar";

type CalendarProjectSidebarProps = {
	project: CalendarProjectSummary | null;
	onOpenChange: (open: boolean) => void;
};

type CalendarTaskFilter = "open" | "all" | "completed";

export function CalendarProjectSidebar({
	project,
	onOpenChange,
}: CalendarProjectSidebarProps) {
	const [taskFilter, setTaskFilter] = useState<CalendarTaskFilter>("all");

	const visibleTasks =
		project?.myTasks.filter((task) => {
			if (taskFilter === "all") {
				return true;
			}

			return taskFilter === "completed"
				? task.completedAt !== null
				: task.completedAt === null;
		}) ?? [];

	const emptyTaskMessage =
		taskFilter === "completed"
			? "No completed tasks"
			: taskFilter === "all"
				? "No tasks assigned to you"
				: "No open tasks";
	return (
		<Sheet open={project !== null} onOpenChange={onOpenChange}>
			{project && (
				<SheetContent className="border-l-0 sm:max-w-lg">
					<SheetHeader className="relative overflow-hidden bg-card pl-5 pr-6 pt-8 pb-6">
						<div
							aria-hidden="true"
							className="absolute inset-x-0 top-0 h-4"
							style={{
								backgroundColor: getColorHex(project.color),
							}}
						/>

						<div className="flex min-w-0 items-center gap-2">
							<SheetTitle
								title={project.name}
								className="min-w-0 truncate text-xl font-bold"
							>
								{project.name}
							</SheetTitle>

							{project.completedAt && (
								<span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
									Completed
								</span>
							)}
						</div>

						<SheetDescription className="mt-2 line-clamp-3 leading-5">
							{project.description || "No description yet."}
						</SheetDescription>
					</SheetHeader>

					<div className="border-b border-border px-5 py-4">
						<div className="space-y-3 text-sm">
							<div className="flex items-center gap-3">
								<span className="flex size-7 shrink-0 items-center justify-center">
									<CalendarRange
										aria-hidden="true"
										className="size-5 text-muted-foreground"
									/>
								</span>

								<div className="min-w-0">
									<p className="text-xs font-medium text-muted-foreground">
										Schedule
									</p>

									<p className="mt-0.5 truncate font-medium text-foreground">
										{formatCalendarProjectSchedule(project)}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<span className="flex size-7 shrink-0 items-center justify-center">
									<Clock3
										aria-hidden="true"
										className="size-5 text-muted-foreground"
									/>
								</span>

								<div className="min-w-0">
									<p className="text-xs font-medium text-muted-foreground">
										Last activity
									</p>

									<p className="mt-0.5 truncate font-medium text-foreground">
										{formatActivityDate(project.lastActivityAt)}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<span className="flex size-7 shrink-0 items-center justify-center">
									<ShieldCheck
										aria-hidden="true"
										className="size-5 text-muted-foreground"
									/>
								</span>

								<div className="min-w-0">
									<p className="text-xs font-medium text-muted-foreground">
										Your role
									</p>

									<p className="mt-0.5 truncate font-medium capitalize text-foreground">
										{project.accessRole}
									</p>
								</div>
							</div>

							{project.accessRole !== "owner" && (
								<div className="flex items-center gap-3">
									<UserAvatar
										user={project.owner}
										className="size-7 shrink-0"
									/>

									<div className="min-w-0">
										<p className="text-xs font-medium text-muted-foreground">
											Owner
										</p>

										<p className="mt-0.5 truncate font-medium text-foreground">
											{project.owner.name ?? project.owner.email}
										</p>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="flex min-h-0 flex-1 flex-col px-5 py-5">
						<Button asChild className="w-full">
							<Link href={`/projects/${project.id}`}>
								<FolderOpen aria-hidden="true" />
								Open project
							</Link>
						</Button>

						<div className="mt-5 flex min-h-0 flex-1 flex-col">
							<div className="flex items-center gap-2">
								<h3 className="font-bold text-foreground">Your tasks</h3>

								<span className="text-md font-semibold text-muted-foreground">
									{visibleTasks.length}
								</span>

								<Select
									value={taskFilter}
									onValueChange={(value) =>
										setTaskFilter(value as CalendarTaskFilter)
									}
								>
									<SelectTrigger
										size="sm"
										aria-label="Filter your calendar tasks"
										className="ml-auto w-32 bg-background"
									>
										<SelectValue />
									</SelectTrigger>

									<SelectContent position="popper" align="end">
										<SelectItem value="open">Open</SelectItem>
										<SelectItem value="all">All</SelectItem>
										<SelectItem value="completed">Completed</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{visibleTasks.length === 0 ? (
								<div className="mt-3 rounded-lg border border-dashed border-border px-4 py-9 text-center">
									<p className="text-sm font-medium text-foreground">
										{emptyTaskMessage}
									</p>
								</div>
							) : (
								<div className="scrollbar-thin mt-3 space-y-2.5 overflow-y-auto pr-1">
									{visibleTasks.map((task) => (
										<CalendarProjectTaskRow
											key={task.id}
											project={project}
											task={task}
										/>
									))}
								</div>
							)}
						</div>
					</div>
				</SheetContent>
			)}
		</Sheet>
	);
}
