import { ProjectCalendar } from "@/components/calendar/project-calendar";
import { CreateProjectButton } from "@/components/create-project-button";
import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { getCalendarProjectsForUser } from "@/lib/db/calendar";

export default async function CalendarPage() {
	const user = await getCurrentDatabaseUser();

	const projects = await getCalendarProjectsForUser(user.id);

	const todayDateKey = new Date().toISOString().slice(0, 10);

	const scheduledProjectCount = projects.filter(
		(project) =>
			!project.completedAt && Boolean(project.startDate || project.dueDate),
	).length;

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Calendar</h1>

					<p className="mt-0.5 text-muted-foreground">
						{scheduledProjectCount === 1
							? "1 scheduled project"
							: `${scheduledProjectCount} scheduled projects`}
					</p>
				</div>

				<CreateProjectButton keyboardShortcutTarget />
			</div>

			<ProjectCalendar projects={projects} todayDateKey={todayDateKey} />
		</div>
	);
}
