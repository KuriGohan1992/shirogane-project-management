// TODO: Task 4.5 - Design and implement project cards and layouts

/*
TODO: Implementation Notes for Interns:

This component should display:
- Project name and description
- Progress indicator
- Team member count
- Due date
- Status badge
- Actions menu (edit, delete, etc.)

Props interface:
interface ProjectCardProps {
  project: {
    id: string
    name: string
    description?: string
    progress: number
    memberCount: number
    dueDate?: Date
    status: 'active' | 'completed' | 'on-hold'
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

Features to implement:
- Hover effects
- Click to navigate to project board
- Responsive design
- Loading states
- Error states

export function ProjectCard() {
  	return (
    		<div className="bg-card p-6 rounded-lg border border-border">
    			<p className="text-center text-muted-foreground">
    				TODO: Implement ProjectCard component
    			</p>
    		</div>
    	);
    }
    
*/

import { ArrowUpRight, CalendarDays, Clock3 } from "lucide-react";
import Link from "next/link";

import { ProjectActions } from "@/components/project-actions";
import type { Project } from "@/lib/db/schema";
import type { EditableProject } from "@/types/project";

type ProjectCardProps = {
	project: Project;
};

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

function toEditableProject(project: Project): EditableProject {
	return {
		id: project.id,
		name: project.name,
		description: project.description ?? "",
		dueDate: project.dueDate?.toISOString().slice(0, 10) ?? "",
	};
}

export function ProjectCard({ project }: ProjectCardProps) {
	return (
		<article className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
			<div className="mb-4 flex items-center justify-between">
				<ProjectActions project={toEditableProject(project)} compact />
			</div>

			<Link href={`/projects/${project.id}`} className="block">
				<h2 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
					{project.name}
				</h2>

				<p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
					{project.description || "No description yet."}
				</p>
			</Link>

			<div className="mt-5 space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
				<div className="flex items-center gap-2">
					<CalendarDays aria-hidden="true" size={16} />
					<span>
						{project.dueDate
							? `Due ${formatDate(project.dueDate)}`
							: "No due date"}
					</span>
				</div>

				<div className="flex items-center gap-2">
					<Clock3 aria-hidden="true" size={16} />
					<span>Updated {formatDate(project.updatedAt)}</span>
				</div>
			</div>

			<Link
				href={`/projects/${project.id}`}
				className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-brand-hover"
			>
				Open project
				<ArrowUpRight aria-hidden="true" size={15} />
			</Link>
		</article>
	);
}
