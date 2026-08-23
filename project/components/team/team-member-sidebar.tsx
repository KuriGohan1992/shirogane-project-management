import { ArrowUpRight, Clock3, ShieldCheck } from "lucide-react";
import Link from "next/link";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { UserAvatar } from "@/components/user-avatar";
import { getColorHex } from "@/lib/constants/colors";
import type { TeamCollaborator } from "@/types/team";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
	timeZone: "UTC",
});

type TeamMemberSidebarProps = {
	collaborator: TeamCollaborator | null;
	onOpenChange: (open: boolean) => void;
};

export function TeamMemberSidebar({
	collaborator,
	onOpenChange,
}: TeamMemberSidebarProps) {
	return (
		<Sheet open={collaborator !== null} onOpenChange={onOpenChange}>
			{collaborator && (
				<SheetContent className="border-l-0 sm:max-w-lg">
					<SheetHeader className="bg-card px-5 py-6">
						<div className="flex min-w-0 items-center gap-3">
							<UserAvatar user={collaborator} className="size-12 shrink-0" />

							<div className="min-w-0">
								<SheetTitle className="truncate text-xl font-bold">
									{collaborator.name?.trim() || collaborator.email}
								</SheetTitle>

								<SheetDescription className="mt-0.5 truncate">
									{collaborator.name
										? collaborator.email
										: `${collaborator.projects.length} shared ${
												collaborator.projects.length === 1
													? "project"
													: "projects"
											}`}
								</SheetDescription>
							</div>
						</div>
					</SheetHeader>

					<div className="flex min-h-0 flex-1 flex-col px-5 py-5">
						<div className="flex items-center gap-2">
							<h3 className="font-bold text-foreground">Shared projects</h3>

							<span className="text-sm font-semibold text-muted-foreground">
								{collaborator.projects.length}
							</span>
						</div>

						<div className="scrollbar-thin mt-3 space-y-3 overflow-y-auto pr-1">
							{collaborator.projects.map((project) => (
								<Link
									key={project.id}
									href={`/projects/${project.id}`}
									onClick={() => onOpenChange(false)}
									className="group relative block overflow-hidden rounded-xl border border-border bg-background px-4 pb-4 pt-5 transition-colors hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								>
									<div
										aria-hidden="true"
										className="absolute inset-x-0 top-0 h-2"
										style={{
											backgroundColor: getColorHex(project.color),
										}}
									/>

									<div className="flex min-w-0 items-start gap-3">
										<div className="min-w-0 flex-1">
											<div className="flex min-w-0 items-center gap-2">
												<h4 className="truncate font-semibold text-foreground">
													{project.name}
												</h4>

												{project.completedAt && (
													<span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
														Completed
													</span>
												)}
											</div>

											<div className="mt-3 space-y-2 text-sm text-muted-foreground">
												<div className="flex items-center gap-2">
													<ShieldCheck
														aria-hidden="true"
														className="size-4 shrink-0"
													/>

													<span>
														Role:{" "}
														<span className="capitalize">{project.role}</span>
													</span>
												</div>

												<div className="flex items-center gap-2">
													<Clock3
														aria-hidden="true"
														className="size-4 shrink-0"
													/>

													<span>
														Last activity{" "}
														{dateFormatter.format(project.lastActivityAt)}
													</span>
												</div>
											</div>
										</div>

										<ArrowUpRight
											aria-hidden="true"
											className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
										/>
									</div>
								</Link>
							))}
						</div>
					</div>
				</SheetContent>
			)}
		</Sheet>
	);
}
