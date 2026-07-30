import { Calendar, MoreHorizontal, Users } from "lucide-react";

const projects = [
	{
		id: "1",
		name: "Website Redesign",
		description:
			"Complete overhaul of company website with modern design and improved UX",
		progress: 75,
		members: 5,
		dueDate: "2024-02-15",
		status: "In Progress",
		color: "bg-primary",
	},
	{
		id: "2",
		name: "Mobile App Development",
		description: "iOS and Android app development for customer portal",
		progress: 45,
		members: 8,
		dueDate: "2024-03-20",
		status: "In Progress",
		color: "bg-green-500",
	},
	{
		id: "3",
		name: "Marketing Campaign",
		description: "Q1 marketing campaign planning and execution",
		progress: 90,
		members: 3,
		dueDate: "2024-01-30",
		status: "Review",
		color: "bg-purple-500",
	},
	{
		id: "4",
		name: "Database Migration",
		description: "Migrate legacy database to new cloud infrastructure",
		progress: 30,
		members: 4,
		dueDate: "2024-04-10",
		status: "Planning",
		color: "bg-orange-500",
	},
	{
		id: "5",
		name: "Security Audit",
		description: "Comprehensive security audit and vulnerability assessment",
		progress: 60,
		members: 2,
		dueDate: "2024-02-28",
		status: "In Progress",
		color: "bg-red-500",
	},
	{
		id: "6",
		name: "API Documentation",
		description: "Create comprehensive API documentation for developers",
		progress: 85,
		members: 3,
		dueDate: "2024-02-05",
		status: "Review",
		color: "bg-indigo-500",
	},
];

export function ProjectGrid() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{projects.map((project) => (
				<div
					key={project.id}
					className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer"
				>
					<div className="flex items-start justify-between mb-4">
						<div className={`w-3 h-3 rounded-full ${project.color}`} />
						<button className="p-1 hover:bg-muted rounded">
							<MoreHorizontal size={16} />
						</button>
					</div>

					<h3 className="text-lg font-semibold text-foreground mb-2">
						{project.name}
					</h3>

					<p className="text-sm text-muted-foreground mb-4 line-clamp-2">
						{project.description}
					</p>

					<div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
						<div className="flex items-center">
							<Users size={16} className="mr-1" />
							{project.members} members
						</div>
						<div className="flex items-center">
							<Calendar size={16} className="mr-1" />
							{project.dueDate}
						</div>
					</div>

					<div className="mb-4">
						<div className="flex items-center justify-between text-sm mb-2">
							<span className="text-muted-foreground">Progress</span>
							<span className="text-foreground font-medium">
								{project.progress}%
							</span>
						</div>
						<div className="w-full bg-muted rounded-full h-2">
							<div
								className={`h-2 rounded-full transition-all duration-300 ${project.color}`}
								style={{ width: `${project.progress}%` }}
							/>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<span
							className={`px-2 py-1 text-xs font-medium rounded-full ${
								project.status === "In Progress"
									? "bg-brand-soft text-primary dark:bg-primary/15"
									: project.status === "Review"
										? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
										: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
							}`}
						>
							{project.status}
						</span>
					</div>
				</div>
			))}
		</div>
	);
}
