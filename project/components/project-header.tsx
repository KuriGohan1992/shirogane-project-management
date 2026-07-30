import { Calendar, MoreHorizontal, Settings, Users } from "lucide-react";

export function ProjectHeader({ projectId }: { projectId: string }) {
	return (
		<div className="bg-card rounded-lg border border-border p-6">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="flex items-center space-x-3 mb-2">
						<div className="w-3 h-3 bg-primary rounded-full" />
						<h1 className="text-2xl font-bold text-foreground">
							Website Redesign
						</h1>
					</div>

					<p className="text-muted-foreground mb-4">
						Complete overhaul of company website with modern design and improved
						user experience
					</p>

					<div className="flex items-center space-x-6 text-sm text-muted-foreground">
						<div className="flex items-center">
							<Users size={16} className="mr-2" />5 members
						</div>
						<div className="flex items-center">
							<Calendar size={16} className="mr-2" />
							Due Feb 15, 2024
						</div>
						<div className="flex items-center">
							<div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
							75% complete
						</div>
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<button className="p-2 hover:bg-muted rounded-lg transition-colors">
						<Settings size={20} />
					</button>
					<button className="p-2 hover:bg-muted rounded-lg transition-colors">
						<MoreHorizontal size={20} />
					</button>
				</div>
			</div>
		</div>
	);
}
