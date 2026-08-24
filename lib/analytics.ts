export const ANALYTICS_PERIOD_OPTIONS = [
	{
		value: "7d",
		label: "Last 7 days",
		days: 7,
		bucket: "day",
	},
	{
		value: "30d",
		label: "Last 30 days",
		days: 30,
		bucket: "day",
	},
	{
		value: "90d",
		label: "Last 90 days",
		days: 90,
		bucket: "week",
	},
	{
		value: "12m",
		label: "Last 12 months",
		days: 365,
		bucket: "month",
	},
] as const;

export type AnalyticsPeriod =
	(typeof ANALYTICS_PERIOD_OPTIONS)[number]["value"];

export type AnalyticsBucket =
	(typeof ANALYTICS_PERIOD_OPTIONS)[number]["bucket"];

export type AnalyticsRanges = {
	currentStart: Date;
	currentEnd: Date;
	previousStart: Date;
	previousEnd: Date;
};

export const DEFAULT_ANALYTICS_PERIOD: AnalyticsPeriod = "30d";

export function parseAnalyticsPeriod(value?: string): AnalyticsPeriod {
	return ANALYTICS_PERIOD_OPTIONS.some((option) => option.value === value)
		? (value as AnalyticsPeriod)
		: DEFAULT_ANALYTICS_PERIOD;
}

export function getAnalyticsPeriodOption(period: AnalyticsPeriod) {
	return (
		ANALYTICS_PERIOD_OPTIONS.find((option) => option.value === period) ??
		ANALYTICS_PERIOD_OPTIONS[0]
	);
}

function startOfUtcDay(date: Date) {
	return new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);
}

export function getAnalyticsRanges(
	period: AnalyticsPeriod,
	now = new Date(),
): AnalyticsRanges {
	const { days } = getAnalyticsPeriodOption(period);

	const currentEnd = startOfUtcDay(now);

	currentEnd.setUTCDate(currentEnd.getUTCDate() + 1);

	const currentStart = new Date(currentEnd);

	currentStart.setUTCDate(currentStart.getUTCDate() - days);

	const previousEnd = new Date(currentStart);

	const previousStart = new Date(previousEnd);

	previousStart.setUTCDate(previousStart.getUTCDate() - days);

	return {
		currentStart,
		currentEnd,
		previousStart,
		previousEnd,
	};
}
