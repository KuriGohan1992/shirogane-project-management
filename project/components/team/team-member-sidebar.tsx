import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { UserAvatar } from "@/components/user-avatar";
import { getColorHex } from "@/lib/constants/colors";
import { getTaskHref } from "@/lib/task-route";
import type { TeamCollaborator } from "@/types/team";

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
					<SheetHeader className="bg-card px-5 pb-4 pt-6">
						<div className="flex min-w-0 items-start gap-3">
							<UserAvatar user={collaborator} className="size-11 shrink-0" />

							<div className="min-w-0">
								<SheetTitle className="truncate font-semibold leading-tight">
									{collaborator.name?.trim() || collaborator.email}
								</SheetTitle>

								{collaborator.jobTitle && (
									<p className="truncate text-sm font-medium leading-tight text-muted-foreground">
										{collaborator.jobTitle}
									</p>
								)}

								<SheetDescription className="mt-1 truncate text-xs">
									{collaborator.email}
								</SheetDescription>
							</div>
						</div>
					</SheetHeader>

					<div className="flex min-h-0 flex-1 flex-col px-5 py-3">
						<div className="flex items-center gap-2">
							<h3 className="font-bold text-foreground">Shared projects</h3>

							<span className="text-sm font-semibold text-muted-foreground">
								{collaborator.projects.length}
							</span>
						</div>

						<div className="scrollbar-thin mt-3 space-y-3 overflow-y-auto pr-1">
							{collaborator.projects.map((project) => (
								<div
									key={project.id}
									className="relative overflow-hidden rounded-xl border border-border bg-background px-4 pb-4 pt-5 transition-colors hover:border-foreground/25"
								>
									<div
										aria-hidden="true"
										className="absolute inset-x-0 top-0 h-4"
										style={{
											backgroundColor: getColorHex(project.color),
										}}
									/>

									{/* Project heading */}
									<Link
										key={project.id}
										href={`/projects/${project.id}`}
										onClick={() => onOpenChange(false)}
										className="group relative block overflow-hidden rounded-xl bg-background pt-2 transition-colors hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										style={
											{
												"--project-color": getColorHex(project.color),
											} as CSSProperties
										}
									>
										<div className="min-w-0 flex-1">
											<div className="flex min-w-0 items-center gap-2">
												<h4 className="truncate text-lg font-semibold text-foreground transition-colors group-hover:text-[var(--project-color)]">
													{project.name}
												</h4>

												{project.completedAt && (
													<span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
														Completed
													</span>
												)}
											</div>
										</div>
									</Link>

									{/* Project roles */}
									<div className="grid grid-cols-2 gap-x-4 pt-2 text-sm">


										<div className="flex min-w-0 items-center gap-1.5 text-foreground">
											<ShieldCheck
												aria-hidden="true"
												className="size-4 shrink-0"
											/>

											<span className="min-w-0 truncate">
												Their role:{" "}
												<span className="font-medium capitalize text-foreground">
													{project.role}
												</span>
											</span>
										</div>
                                        										<div className="flex min-w-0 items-center gap-1.5 text-foreground">
											<ShieldCheck
												aria-hidden="true"
												className="size-4 shrink-0"
											/>

											<span className="min-w-0 truncate">
												Your role:{" "}
												<span className="font-medium capitalize text-foreground">
													{project.yourRole}
												</span>
											</span>
										</div>
									</div>

									{/* Assigned tasks */}
									<div className="mt-3.5 border-t border-border pt-3.5">
										<div className="flex items-center gap-2">
											<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
												Assigned tasks
											</p>

											<span className="text-xs font-semibold text-muted-foreground">
												{project.tasks.length}
											</span>
										</div>

										{project.tasks.length === 0 ? (
											<p className="mt-2 text-xs text-muted-foreground">
												No tasks assigned in this project.
											</p>
										) : (
											<div className="mt-1 space-y-1">
												{project.tasks.map((task) => (
													<Link
														key={task.id}
														href={getTaskHref(project.id, task.id, task.title)}
														onClick={() => onOpenChange(false)}
														className="-mx-2 flex min-w-0 items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
													>
														<span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
															{task.title}
														</span>

														<span className="max-w-28 shrink-0 truncate text-xs text-muted-foreground">
															{task.stageName}
														</span>
													</Link>
												))}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</SheetContent>
			)}
		</Sheet>
	);
}
