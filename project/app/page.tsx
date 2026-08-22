import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ArrowRight, CheckCircle, Kanban, Users } from "lucide-react";
import Link from "next/link";
import { ShiroBrand } from "@/components/shiro-brand";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b border-border bg-background/80 backdrop-blur-xs">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<ShiroBrand priority />

						<div className="flex items-center gap-4">
							<Show when="signed-in">
								<Link
									href="/dashboard"
									className="font-medium text-foreground hover:text-primary"
								>
									Dashboard
								</Link>

								<Link
									href="/projects"
									className="font-medium text-foreground hover:text-primary"
								>
									Projects
								</Link>
							</Show>

							<ThemeToggle />

							<Show when="signed-out">
								<SignInButton>
									<button
										type="button"
										className="font-medium text-foreground hover:text-primary"
									>
										Sign In
									</button>
								</SignInButton>

								<SignUpButton>
									<button
										type="button"
										className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-brand-hover"
									>
										Sign Up
									</button>
								</SignUpButton>
							</Show>

							<Show when="signed-in">
								<UserButton />
							</Show>
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="py-20 px-4 sm:px-6 lg:px-8">
				<div className="container mx-auto text-center">
					<h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
						Manage Projects with
						<span className="text-primary"> Kanban Boards</span>
					</h1>

					<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
						Organize tasks, collaborate with teams, and track progress with our
						intuitive drag-and-drop project management platform.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
						<Link
							href="/dashboard"
							className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-lg hover:bg-brand-hover text-lg font-semibold"
						>
							Start Managing Projects
							<ArrowRight className="ml-2" size={20} />
						</Link>
						<Link
							href="/projects"
							className="inline-flex items-center px-8 py-4 border-2 border-primary text-primary rounded-lg hover:bg-brand-soft dark:hover:bg-primary/15 text-lg font-semibold"
						>
							View Projects
						</Link>
					</div>

					{/* Feature highlights */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
						<div className="flex items-center justify-center space-x-2 text-foreground">
							<Kanban className="text-primary" size={20} />
							<span>Drag & Drop Boards</span>
						</div>
						<div className="flex items-center justify-center space-x-2 text-foreground">
							<Users className="text-primary" size={20} />
							<span>Team Collaboration</span>
						</div>
						<div className="flex items-center justify-center space-x-2 text-foreground">
							<CheckCircle className="text-primary" size={20} />
							<span>Task Management</span>
						</div>
					</div>
				</div>
			</section>

			{/* Navigation Demo Section */}
			<section className="py-16 px-4 sm:px-6 lg:px-8 bg-background/50">
				<div className="container mx-auto text-center">
					<h2 className="text-3xl font-bold text-foreground mb-8">
						🚀 Navigate the Mock Site
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
						<Link
							href="/dashboard"
							className="p-4 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow"
						>
							<h3 className="font-semibold text-foreground mb-2">Dashboard</h3>
							<p className="text-sm text-muted-foreground">
								Main dashboard view
							</p>
						</Link>

						<Link
							href="/projects"
							className="p-4 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow"
						>
							<h3 className="font-semibold text-foreground mb-2">Projects</h3>
							<p className="text-sm text-muted-foreground">
								Projects listing page
							</p>
						</Link>

						<Link
							href="/projects/1"
							className="p-4 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow"
						>
							<h3 className="font-semibold text-foreground mb-2">
								Kanban Board
							</h3>
							<p className="text-sm text-muted-foreground">
								Project board view
							</p>
						</Link>

						<Link
							href="/sign-in"
							className="p-4 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow"
						>
							<h3 className="font-semibold text-foreground mb-2">Auth Pages</h3>
							<p className="text-sm text-muted-foreground">
								Sign in/up placeholders
							</p>
						</Link>
					</div>
				</div>
			</section>

			{/* Task Implementation Status */}
			<section className="py-16 px-4 sm:px-6 lg:px-8">
				<div className="container mx-auto">
					<h2 className="text-3xl font-bold text-center text-foreground mb-12">
						Implementation Roadmap
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{[
							{
								phase: "1.0",
								title: "Project Setup",
								status: "pending",
								tasks: 6,
							},
							{
								phase: "2.0",
								title: "Authentication",
								status: "pending",
								tasks: 6,
							},
							{
								phase: "3.0",
								title: "Database Setup",
								status: "pending",
								tasks: 6,
							},
							{
								phase: "4.0",
								title: "Core Features",
								status: "pending",
								tasks: 6,
							},
							{
								phase: "5.0",
								title: "Kanban Board",
								status: "pending",
								tasks: 6,
							},
							{
								phase: "6.0",
								title: "Advanced Features",
								status: "pending",
								tasks: 6,
							},
							{ phase: "7.0", title: "Testing", status: "pending", tasks: 6 },
							{
								phase: "8.0",
								title: "Deployment",
								status: "pending",
								tasks: 6,
							},
						].map((item) => (
							<div
								key={item.phase}
								className="bg-card p-6 rounded-lg border border-border"
							>
								<div className="text-sm text-primary font-semibold mb-2">
									Phase {item.phase}
								</div>
								<h3 className="font-semibold text-foreground mb-2">
									{item.title}
								</h3>
								<div className="text-sm text-muted-foreground mb-3">
									{item.tasks} tasks
								</div>
								<div className="flex items-center">
									<div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
									<span className="text-sm text-muted-foreground capitalize">
										{item.status}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
