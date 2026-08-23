import { ProjectCalendar } from "@/components/calendar/project-calendar";
import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { getCalendarProjectsForUser } from "@/lib/db/calendar";

export default async function CalendarPage() {
	const user = await getCurrentDatabaseUser();

	const projects = await getCalendarProjectsForUser(user.id);

	const todayDateKey = new Date().toISOString().slice(0, 10);

	return (
		<div className="space-y-5">
			<div>
				<h1 className="text-3xl font-bold tracking-tight text-foreground">
					Calendar
				</h1>

				<p className="mt-1 text-sm text-muted-foreground">
					Project timelines and your assigned work.
				</p>
			</div>

			<ProjectCalendar projects={projects} todayDateKey={todayDateKey} />
		</div>
	);
}
