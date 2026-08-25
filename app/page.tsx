import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
	ArrowRight,
	CalendarDays,
	Check,
	CircleCheckBig,
	Columns3,
	PlayCircle,
	Search,
	ShieldCheck,
	Sparkles,
	UsersRound,
} from "lucide-react";
import Link from "next/link";

import { LandingBoardArt } from "@/components/landing/landing-board-art";
import { LandingBrand } from "@/components/landing/landing-brand";
import { ShiroBrand } from "@/components/shiro-brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const DEMO_VIDEO_URL = "https://www.youtube-nocookie.com/embed/YOUR_VIDEO_ID";

const features = [
	{
		icon: Columns3,
		title: "Work that stays visible",
		description:
			"Move tasks through clear stages, filter the noise, and keep every detail close to the work.",
	},
	{
		icon: UsersRound,
		title: "Collaboration with boundaries",
		description:
			"Assign work, manage project roles, and keep viewers, members, and owners in the right lane.",
	},
	{
		icon: CalendarDays,
		title: "Dates you can actually see",
		description:
			"Plan start dates and deadlines in a calendar built around the projects and tasks you already manage.",
	},
];

const capabilities = [
	"Kanban boards",
	"Multiple assignees",
	"Project roles",
	"Calendar views",
	"Notifications",
	"Task completion",
	"Analytics",
	"Global search",
];

const whyShiroPoints = [
	{
		icon: Search,
		title: "Keep the context together",
		description:
			"Projects, tasks, people, dates, and activity stay connected instead of disappearing into separate workflows.",
	},
	{
		icon: ShieldCheck,
		title: "Make ownership explicit",
		description:
			"Owner, Member, and Viewer roles make access predictable without turning permissions into another project to manage.",
	},
	{
		icon: Sparkles,
		title: "Keep the interface quiet",
		description:
			"Controls appear where they matter while secondary information stays out of the way until you actually need it.",
	},
];

export default function HomePage() {
	return (
		<div className="min-h-screen overflow-x-clip bg-background text-foreground">
			<header className="sticky top-0 z-50 h-16 border-b border-border bg-card/95 backdrop-blur-md">
				<div className="mx-auto flex h-full w-full max-w-[1600px] items-center px-5 sm:px-8 lg:px-10">
					<LandingBrand />

					<nav
						aria-label="Landing page navigation"
						className="ml-8 hidden items-center gap-7 lg:flex"
					>
						<a
							href="#product"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							Product
						</a>

						<a
							href="#why-shiro"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							Why Shiro
						</a>

						<a
							href="#demo"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							Demo
						</a>
					</nav>

					<div className="ml-auto flex items-center gap-2 sm:gap-3">
						<Show when="signed-in">
							<Link
								href="/dashboard"
								className="hidden pr-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
							>
								Dashboard
							</Link>

							<Link
								href="/projects"
								className="hidden pr-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
							>
								Projects
							</Link>
						</Show>

						<ThemeToggle />

						<Show when="signed-out">
							<SignInButton>
								<button
									type="button"
									className="hidden h-9 items-center px-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
								>
									Sign in
								</button>
							</SignInButton>

							<SignUpButton>
								<button
									type="button"
									className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
								>
									Get started
								</button>
							</SignUpButton>
						</Show>

						<Show when="signed-in">
							<UserButton />
						</Show>
					</div>
				</div>
			</header>

			<main>
				<section className="relative">
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 overflow-hidden"
					>
						<div className="absolute -right-40 -top-28 size-[34rem] rounded-full bg-primary/[0.07] blur-3xl" />
						<div className="absolute -left-48 top-80 size-[28rem] rounded-full bg-cyan-500/[0.05] blur-3xl" />
					</div>

					<div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1500px] items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:px-10 lg:py-20 xl:gap-20">
						<div className="max-w-2xl">
							<h1 className="text-5xl font-bold tracking-[-0.045em] text-foreground sm:text-6xl lg:text-[4.35rem] lg:leading-[1.02]">
								Keep projects moving{" "}
								<span className="text-primary">
									without losing the details.
								</span>
							</h1>

							<p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
								Shiro brings tasks, teammates, deadlines, and project progress
								into one focused workspace—so everyone knows what is moving and
								what needs attention.
							</p>

							<div className="mt-8 flex flex-wrap items-center gap-3">
								<Show when="signed-out">
									<SignUpButton>
										<button
											type="button"
											className="group inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-brand-hover"
										>
											Start using Shiro
											<ArrowRight
												aria-hidden="true"
												className="size-4 transition-transform group-hover:translate-x-0.5"
											/>
										</button>
									</SignUpButton>

									<SignInButton>
										<button
											type="button"
											className="inline-flex h-12 items-center rounded-lg border border-border bg-card px-5 text-sm font-bold text-foreground transition-colors hover:bg-muted"
										>
											Sign in
										</button>
									</SignInButton>
								</Show>

								<Show when="signed-in">
									<Link
										href="/dashboard"
										className="group inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-brand-hover"
									>
										Open dashboard
										<ArrowRight
											aria-hidden="true"
											className="size-4 transition-transform group-hover:translate-x-0.5"
										/>
									</Link>

									<Link
										href="/projects"
										className="inline-flex h-12 items-center rounded-lg border border-border bg-card px-5 text-sm font-bold text-foreground transition-colors hover:bg-muted"
									>
										View projects
									</Link>
								</Show>
							</div>

							<div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
								<div className="flex items-center gap-1.5">
									<Check
										aria-hidden="true"
										className="size-4 text-emerald-500"
									/>
									Kanban-first
								</div>

								<div className="flex items-center gap-1.5">
									<Check
										aria-hidden="true"
										className="size-4 text-emerald-500"
									/>
									Team-ready
								</div>

								<div className="flex items-center gap-1.5">
									<Check
										aria-hidden="true"
										className="size-4 text-emerald-500"
									/>
									Built for focus
								</div>
							</div>
						</div>

						<div className="lg:pl-4">
							<LandingBoardArt />
						</div>
					</div>
				</section>

				<section className="border-y border-border bg-card">
					<div className="mx-auto grid w-full max-w-[1500px] gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
						{[
							{
								value: "Board",
								label: "Drag work through stages",
							},
							{
								value: "Calendar",
								label: "See schedules at a glance",
							},
							{
								value: "Team",
								label: "Keep ownership visible",
							},
							{
								value: "Analytics",
								label: "Measure what actually ships",
							},
						].map((item) => (
							<div key={item.value} className="bg-card px-6 py-5 sm:px-8">
								<p className="text-sm font-bold text-foreground">
									{item.value}
								</p>

								<p className="mt-1 text-sm text-muted-foreground">
									{item.label}
								</p>
							</div>
						))}
					</div>
				</section>

				<section
					id="product"
					className="scroll-mt-24 mx-auto w-full max-w-[1500px] px-5 py-24 sm:px-8 lg:px-10"
				>
					<div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
						<div className="max-w-md">
							<p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
								Product
							</p>

							<h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
								Everything around the work, in one place.
							</h2>

							<p className="mt-5 text-base leading-7 text-muted-foreground">
								Shiro connects the board, deadlines, collaborators, and progress
								instead of making each one feel like a separate tool.
							</p>

							<div className="mt-8 flex flex-wrap gap-2">
								{capabilities.map((capability) => (
									<span
										key={capability}
										className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground"
									>
										{capability}
									</span>
								))}
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							{features.map((feature, index) => {
								const Icon = feature.icon;

								return (
									<article
										key={feature.title}
										className={`relative overflow-hidden rounded-2xl border border-border bg-card p-6 ${
											index === 0 ? "sm:col-span-2" : ""
										}`}
									>
										<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
											<Icon aria-hidden="true" className="size-5" />
										</div>

										<h3 className="mt-5 text-lg font-bold text-foreground">
											{feature.title}
										</h3>

										<p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
											{feature.description}
										</p>

										{index === 0 && (
											<div className="mt-7 grid gap-2 sm:grid-cols-3">
												{[
													{
														title: "Backlog",
														count: "04",
														width: "w-3/5",
													},
													{
														title: "In Progress",
														count: "03",
														width: "w-4/5",
													},
													{
														title: "Review",
														count: "02",
														width: "w-2/5",
													},
												].map((stage) => (
													<div
														key={stage.title}
														className="overflow-hidden rounded-xl border border-border bg-muted/40"
													>
														<div className="flex items-center bg-primary px-3 py-2 text-primary-foreground">
															<span className="text-xs font-bold">
																{stage.title}
															</span>

															<span className="ml-auto text-[10px] opacity-75">
																{stage.count}
															</span>
														</div>

														<div className="space-y-2 p-3">
															<div className="rounded-lg border border-border bg-card p-3">
																<div
																	className={`h-2 rounded-full bg-muted ${stage.width}`}
																/>

																<div className="mt-2 h-2 w-2/5 rounded-full bg-primary/20" />
															</div>

															<div className="rounded-lg border border-border bg-card p-3">
																<div className="h-2 w-4/5 rounded-full bg-muted" />
															</div>
														</div>
													</div>
												))}
											</div>
										)}

										{index === 1 && (
											<div className="mt-7 rounded-xl border border-border bg-background p-4">
												<div className="grid grid-cols-7 gap-1.5">
													{[
														["mon", "M"],
														["tue", "T"],
														["wed", "W"],
														["thu", "T"],
														["fri", "F"],
														["sat", "S"],
														["sun", "S"],
													].map(([id, day]) => (
														<span
															key={id}
															className="text-center text-[9px] font-semibold text-muted-foreground"
														>
															{day}
														</span>
													))}
												</div>

												<div className="mt-2 grid grid-cols-7 gap-1.5">
													{[
														"date-1",
														"date-2",
														"date-3",
														"date-4",
														"date-5",
														"date-6",
														"date-7",
														"date-8",
														"date-9",
														"date-10",
														"date-11",
														"date-12",
														"date-13",
														"date-14",
													].map((id) => (
														<div
															key={id}
															className={cn(
																"aspect-square rounded-md",
																id === "date-10"
																	? "bg-primary"
																	: id === "date-11" || id === "date-12"
																		? "bg-primary/15"
																		: "bg-muted",
															)}
														/>
													))}
												</div>
											</div>
										)}

										{index === 2 && (
											<div className="mt-7 space-y-3 rounded-xl border border-border bg-background p-4">
												{[
													["Completed", "72%", "w-[72%]"],
													["In progress", "46%", "w-[46%]"],
													["Due soon", "24%", "w-[24%]"],
												].map(([label, value, width]) => (
													<div key={label}>
														<div className="flex justify-between text-[10px]">
															<span className="text-muted-foreground">
																{label}
															</span>

															<span className="font-semibold text-foreground">
																{value}
															</span>
														</div>

														<div className="mt-1.5 h-1.5 rounded-full bg-muted">
															<div
																className={`h-full rounded-full bg-primary ${width}`}
															/>
														</div>
													</div>
												))}
											</div>
										)}
									</article>
								);
							})}
						</div>
					</div>
				</section>

				<section
					id="why-shiro"
					className="scroll-mt-24 border-y border-border bg-card"
				>
					<div className="mx-auto w-full max-w-[1500px] px-5 py-24 sm:px-8 lg:px-10">
						<div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
							<div className="max-w-lg">
								<p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
									Why Shiro
								</p>

								<h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
									Less time managing the tool. More time moving the work.
								</h2>

								<p className="mt-5 text-base leading-7 text-muted-foreground">
									Shiro is built around a small number of connected ideas: clear
									ownership, visible progress, focused collaboration, and
									predictable workflows.
								</p>
							</div>

							<div className="grid gap-4 sm:grid-cols-3">
								{whyShiroPoints.map((point) => {
									const Icon = point.icon;

									return (
										<article
											key={point.title}
											className="rounded-2xl border border-border bg-background p-6"
										>
											<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
												<Icon aria-hidden="true" className="size-5" />
											</div>

											<h3 className="mt-5 text-lg font-bold text-foreground">
												{point.title}
											</h3>

											<p className="mt-2 text-sm leading-6 text-muted-foreground">
												{point.description}
											</p>
										</article>
									);
								})}
							</div>
						</div>
					</div>
				</section>

				<section id="demo" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10">
					<div className="mx-auto w-full max-w-[1280px]">
						<div className="mx-auto max-w-2xl text-center">
							<div className="flex items-center justify-center gap-2 text-primary">
								<PlayCircle aria-hidden="true" className="size-5" />

								<p className="text-sm font-bold uppercase tracking-[0.16em]">
									Demo
								</p>
							</div>

							<h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
								See Shiro in action.
							</h2>

							<p className="mt-5 text-base leading-7 text-muted-foreground">
								Walk through the core Shiro workflow—from organizing projects
								and Kanban tasks to collaboration, calendar planning, and
								analytics.
							</p>
						</div>

						<div className="relative mt-12">
							<div
								aria-hidden="true"
								className="absolute -inset-5 -z-10 rounded-[2rem] bg-primary/[0.06]"
							/>

							<div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
								<div className="aspect-video bg-muted">
									<iframe
										src={DEMO_VIDEO_URL}
										title="Shiro product demonstration"
										className="h-full w-full"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
										referrerPolicy="strict-origin-when-cross-origin"
										allowFullScreen
									/>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="px-5 pb-24 sm:px-8 lg:px-10">
					<div className="relative mx-auto max-w-[1420px] overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-10 lg:px-14 lg:py-14">
						<div
							aria-hidden="true"
							className="absolute -right-16 -top-28 size-72 rounded-full bg-white/10"
						/>

						<div
							aria-hidden="true"
							className="absolute -bottom-32 right-40 size-64 rounded-full border-[36px] border-white/[0.07]"
						/>

						<div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
							<div className="max-w-2xl">
								<div className="flex items-center gap-2 text-primary-foreground/75">
									<CircleCheckBig aria-hidden="true" className="size-5" />

									<span className="text-sm font-semibold">
										Ready when the work is
									</span>
								</div>

								<h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
									Give every project a clearer next step.
								</h2>

								<p className="mt-3 max-w-xl text-base leading-7 text-primary-foreground/75">
									Bring the board, the people, the dates, and the progress into
									one place.
								</p>
							</div>

							<Show when="signed-out">
								<SignUpButton>
									<button
										type="button"
										className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-blue-700 transition-transform hover:scale-[1.02]"
									>
										Get started
										<ArrowRight
											aria-hidden="true"
											className="size-4 transition-transform group-hover:translate-x-0.5"
										/>
									</button>
								</SignUpButton>
							</Show>

							<Show when="signed-in">
								<Link
									href="/dashboard"
									className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-blue-700 transition-transform hover:scale-[1.02]"
								>
									Open Shiro
									<ArrowRight
										aria-hidden="true"
										className="size-4 transition-transform group-hover:translate-x-0.5"
									/>
								</Link>
							</Show>
						</div>
					</div>
				</section>
			</main>

			<footer className="border-t border-border bg-card">
				<div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
					<ShiroBrand />

					<p className="text-sm text-muted-foreground">
						Project management without the clutter.
					</p>

					<p className="text-xs text-muted-foreground">© 2026 Shiro</p>
				</div>
			</footer>
		</div>
	);
}
