import { Calendar, MoreHorizontal, Users } from "lucide-react";
import Link from "next/link";

const projects = [
	{
		id: "1",
		name: "Website Redesign",
		description: "Complete overhaul of company website",
		progress: 75,
		members: 5,
		dueDate: "2024-02-15",
		status: "In Progress",
	},
	{
		id: "2",
		name: "Mobile App Development",
		description: "iOS and Android app development",
		progress: 45,
		members: 8,
		dueDate: "2024-03-20",
		status: "In Progress",
	},
	{
		id: "3",
		name: "Marketing Campaign",
		description: "Q1 marketing campaign planning",
		progress: 90,
		members: 3,
		dueDate: "2024-01-30",
		status: "Review",
	},
];

export function RecentProjects() {
	return (
		<div className="bg-card rounded-lg border border-border p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold text-foreground">
					Recent Projects
				</h3>
				<Link
					href="/projects"
					className="text-primary hover:text-brand-hover text-sm font-medium"
				>
					View all
				</Link>
			</div>

			<div className="space-y-4">
				{projects.map((project) => (
					<div key={project.id} className="border border-border rounded-lg p-4">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<h4 className="font-medium text-foreground">{project.name}</h4>
								<p className="text-sm text-muted-foreground mt-1">
									{project.description}
								</p>

								<div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
									<div className="flex items-center">
										<Users size={16} className="mr-1" />
										{project.members}
									</div>
									<div className="flex items-center">
										<Calendar size={16} className="mr-1" />
										{project.dueDate}
									</div>
								</div>

								<div className="mt-3">
									<div className="flex items-center justify-between text-sm mb-1">
										<span className="text-muted-foreground">Progress</span>
										<span className="text-foreground">{project.progress}%</span>
									</div>
									<div className="w-full bg-muted rounded-full h-2">
										<div
											className="bg-primary h-2 rounded-full transition-all duration-300"
											style={{ width: `${project.progress}%` }}
										/>
									</div>
								</div>
							</div>

							<button className="p-1 hover:bg-muted rounded">
								<MoreHorizontal size={16} />
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
