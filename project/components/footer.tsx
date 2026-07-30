import Link from "next/link";

export function Footer() {
	return (
		<footer className="bg-slate-950 py-12 text-slate-100">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					<div>
						<h3 className="text-2xl font-bold text-brand mb-4">Shiro</h3>
						<p className="text-slate-400">
							The modern project management platform that helps teams
							collaborate and deliver results.
						</p>
					</div>

					<div>
						<h4 className="font-semibold mb-4">Product</h4>
						<ul className="space-y-2">
							<li>
								<Link
									href="#"
									className="text-slate-400 hover:text-white transition-colors"
								>
									Features
								</Link>
							</li>
							<li>
								<Link
									href="#"
									className="text-slate-400 hover:text-white transition-colors"
								>
									Pricing
								</Link>
							</li>
							<li>
								<Link
									href="#"
									className="text-slate-400 hover:text-white transition-colors"
								>
									Security
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="font-semibold mb-4">Company</h4>
						<ul className="space-y-2">
							<li>
								<Link
									href="#"
									className="text-slate-400 hover:text-white transition-colors"
								>
									About
								</Link>
							</li>
							<li>
								<Link
									href="#"
									className="text-slate-400 hover:text-white transition-colors"
								>
									Blog
								</Link>
							</li>
							<li>
								<Link
									href="#"
									className="text-slate-400 hover:text-white transition-colors"
								>
									Careers
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="font-semibold mb-4">Support</h4>
						<ul className="space-y-2">
							<li>
								<Link
									href="#"
									className="text-slate-400 hover:text-white transition-colors"
								>
									Help Center
								</Link>
							</li>
							<li>
								<Link
									href="#"
									className="text-slate-400 hover:text-white transition-colors"
								>
									Contact
								</Link>
							</li>
							<li>
								<Link
									href="#"
									className="text-slate-400 hover:text-white transition-colors"
								>
									API Docs
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="border-t border-slate-800 mt-8 pt-8 text-center">
					<p className="text-slate-400">© 2026 Shiro. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
