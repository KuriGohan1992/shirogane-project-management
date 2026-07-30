// TODO: Task 2.3 - Create sign-in and sign-up pages
export default function SignInPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-foreground mb-2">
						Welcome Back
					</h1>
					<p className="text-muted-foreground">
						Sign in to your project management account
					</p>
				</div>

				{/* TODO: Task 2.3 - Replace with actual Clerk SignIn component */}
				<div className="bg-card p-8 rounded-lg border border-border">
					<div className="text-center text-muted-foreground">
						<p className="mb-4">
							🔐 Clerk Authentication Component Placeholder
						</p>
						<p className="text-sm">TODO: Implement Clerk SignIn component</p>
						<div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
							<p className="text-sm text-yellow-800 dark:text-yellow-200">
								📋 <strong>For Interns:</strong> Replace this with{" "}
								{`<SignIn />`} from @clerk/nextjs
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/*
TODO: Task 2.3 Implementation Notes:
- Import SignIn from @clerk/nextjs
- Configure sign-in redirects
- Style to match design system
- Add proper error handling
*/
