import { Bell, Palette, Shield, User } from "lucide-react";

export default function SettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-foreground">Settings</h1>
				<p className="text-muted-foreground mt-2">
					Manage your account and application preferences
				</p>
			</div>

			{/* Implementation Tasks Banner */}
			<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
				<h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
					⚙️ Settings Implementation Tasks
				</h3>
				<ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
					<li>• Task 2.4: Implement user session management</li>
					<li>
						• Task 6.4: Implement project member management and permissions
					</li>
				</ul>
			</div>

			{/* Settings Sections */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Settings Navigation */}
				<div className="bg-card rounded-lg border border-border p-6">
					<h3 className="text-lg font-semibold text-foreground mb-4">
						Settings
					</h3>
					<nav className="space-y-2">
						{[
							{ name: "Profile", icon: User, active: true },
							{ name: "Notifications", icon: Bell, active: false },
							{ name: "Security", icon: Shield, active: false },
							{ name: "Appearance", icon: Palette, active: false },
						].map((item) => (
							<button
								key={item.name}
								className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
									item.active
										? "bg-brand-soft dark:bg-primary/15 text-primary"
										: "text-foreground hover:bg-muted"
								}`}
							>
								<item.icon className="mr-3" size={16} />
								{item.name}
							</button>
						))}
					</nav>
				</div>

				{/* Settings Content */}
				<div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
					<h3 className="text-lg font-semibold text-foreground mb-6">
						Profile Settings
					</h3>

					<div className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-foreground mb-2">
								Full Name
							</label>
							<input
								type="text"
								defaultValue="John Doe"
								className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-foreground mb-2">
								Email Address
							</label>
							<input
								type="email"
								defaultValue="john@example.com"
								className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-foreground mb-2">
								Role
							</label>
							<select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary">
								<option>Project Manager</option>
								<option>Developer</option>
								<option>Designer</option>
								<option>QA Engineer</option>
							</select>
						</div>

						<div className="flex justify-end space-x-3 pt-4">
							<button className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
								Cancel
							</button>
							<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-brand-hover transition-colors">
								Save Changes
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
