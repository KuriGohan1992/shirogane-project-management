import Link from "next/link";

import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { parseAnalyticsPeriod } from "@/lib/analytics";
import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { getAnalyticsForUser } from "@/lib/db/analytics";

export const dynamic = "force-dynamic";

type AnalyticsPageProps = {
	searchParams: Promise<{
		period?: string | string[];
		projectId?: string | string[];
	}>;
};

function getSingleValue(value: string | string[] | undefined) {
	return typeof value === "string" ? value : undefined;
}

export default async function AnalyticsPage({
	searchParams,
}: AnalyticsPageProps) {
	const params = await searchParams;

	const period = parseAnalyticsPeriod(getSingleValue(params.period));

	const projectId = getSingleValue(params.projectId);

	const user = await getCurrentDatabaseUser();

	const analytics = await getAnalyticsForUser(user.id, {
		period,
		projectId,
	});

	if (!analytics.hasProjects) {
		return (
			<div className="flex min-h-[calc(100vh-8rem)] flex-col">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-foreground">
						Analytics
					</h1>

					<p className="mt-1 text-base font-medium text-muted-foreground">
						Track delivery, workload, and collaboration across your projects.
					</p>
				</div>

				<EmptyState
					className="flex-1"
					illustrationSrc="/illustrations/team-goals-rafiki.svg"
					title="No projects to analyze"
					description="Analytics will populate as projects, tasks, and activity are recorded."
					action={
						<Button asChild size="sm">
							<Link href="/projects">Go to projects</Link>
						</Button>
					}
				/>
			</div>
		);
	}

	return <AnalyticsDashboard data={analytics} />;
}
