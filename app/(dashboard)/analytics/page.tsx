import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

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

	return <AnalyticsDashboard data={analytics} />;
}
