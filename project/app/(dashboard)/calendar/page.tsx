import { ProjectCalendar } from "@/components/calendar/project-calendar";
import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { getCalendarProjectsForUser } from "@/lib/db/calendar";

export default async function CalendarPage() {
	const user = await getCurrentDatabaseUser();

	const projects = await getCalendarProjectsForUser(user.id);

	const todayDateKey = new Date().toISOString().slice(0, 10);

	return <ProjectCalendar projects={projects} todayDateKey={todayDateKey} />;
}
