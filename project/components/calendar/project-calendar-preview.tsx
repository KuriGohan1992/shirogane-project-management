import { ProjectCard } from "@/components/project-card";
import type { CalendarProjectSummary } from "@/types/calendar";

type ProjectCalendarPreviewProps = {
	project: CalendarProjectSummary;
};

export function ProjectCalendarPreview({
	project,
}: ProjectCalendarPreviewProps) {
	return <ProjectCard project={project} variant="preview" />;
}
