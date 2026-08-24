import type { AnalyticsPeriod } from "@/lib/analytics";
import type { ColorValue } from "@/lib/constants/colors";
import type { UserProfileSummary } from "@/types/user";

export type AnalyticsMetric = {
	current: number | null;
	previous: number | null;
	deltaPercent: number | null;
};

export type AnalyticsTrendPoint = {
	key: string;
	label: string;
	created: number;
	completed: number;
};

export type AnalyticsTaskHealth = {
	total: number;
	completed: number;
	open: number;
	overdue: number;
};

export type AnalyticsPriority = "urgent" | "high" | "medium" | "low" | "none";

export type AnalyticsPriorityRow = {
	priority: AnalyticsPriority;
	count: number;
};

export type AnalyticsProjectProgress = {
	id: string;
	name: string;
	color: ColorValue;
	totalTasks: number;
	completedTasks: number;
	openTasks: number;
	overdueTasks: number;
	completionRate: number;
};

export type AnalyticsContributor = {
	user: UserProfileSummary;
	activityCount: number;
	completedCount: number;
};

export type AnalyticsProjectOption = {
	id: string;
	name: string;
	color: ColorValue;
};

export type AnalyticsData = {
	hasProjects: boolean;

	filters: {
		period: AnalyticsPeriod;
		periodLabel: string;
		selectedProjectId: string | null;
	};

	projectOptions: AnalyticsProjectOption[];

	overview: {
		completedTasks: AnalyticsMetric;
		avgCompletionDays: AnalyticsMetric;

		onTimeRate: AnalyticsMetric & {
			sampleSize: number;
		};

		activeCollaborators: AnalyticsMetric;
	};

	trend: AnalyticsTrendPoint[];

	taskHealth: AnalyticsTaskHealth;

	priorityDistribution: AnalyticsPriorityRow[];

	projectProgress: AnalyticsProjectProgress[];

	contributors: AnalyticsContributor[];
};
