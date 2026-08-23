import { Skeleton } from "@/components/ui/skeleton";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const FILTER_SKELETONS = [
	{
		id: "access",
		widthClassName: "w-24",
	},
	{
		id: "status",
		widthClassName: "w-24",
	},
	{
		id: "color",
		widthClassName: "w-24",
	},
] as const;

type Bar = {
	id: string;
	start: number;
	span: number;
	lane?: number;
};

type Week = {
	id: string;
	dimLeadingDays?: boolean;
	bars: Bar[];
};

const WEEKS: Week[] = [
	{
		id: "week-1",
		dimLeadingDays: true,
		bars: [],
	},
	{
		id: "week-2",
		bars: [],
	},
	{
		id: "week-3",
		bars: [
			{
				id: "week-3-bar-1",
				start: 2,
				span: 4,
			},
		],
	},
	{
		id: "week-4",
		bars: [
			{
				id: "week-4-bar-1",
				start: 1,
				span: 5,
			},
			{
				id: "week-4-bar-2",
				start: 4,
				span: 3,
				lane: 1,
			},
		],
	},
	{
		id: "week-5",
		bars: [
			{
				id: "week-5-bar-1",
				start: 1,
				span: 4,
			},
			{
				id: "week-5-bar-2",
				start: 5,
				span: 2,
			},
		],
	},
	{
		id: "week-6",
		bars: [
			{
				id: "week-6-bar-1",
				start: 2,
				span: 4,
			},
		],
	},
];

function CalendarWeekSkeleton({
	bars,
	dimLeadingDays = false,
}: {
	bars: Bar[];
	dimLeadingDays?: boolean;
}) {
	return (
		<div className="relative h-24 border-b border-border last:border-b-0">
			<div className="absolute inset-0 grid grid-cols-7">
				{WEEKDAYS.map((day, dayIndex) => (
					<div key={day} className="border-r border-border p-3 last:border-r-0">
						<Skeleton
							className={
								dimLeadingDays && dayIndex < 6 ? "size-5 opacity-50" : "size-5"
							}
						/>
					</div>
				))}
			</div>

			{bars.length > 0 && (
				<div className="pointer-events-none absolute inset-x-0 top-10 grid grid-cols-7 px-1">
					{bars.map((bar) => (
						<Skeleton
							key={bar.id}
							className="h-7 rounded-md"
							style={{
								gridColumn: `${bar.start} / span ${bar.span}`,

								gridRow: 1,

								transform: `translateY(${(bar.lane ?? 0) * 32}px)`,
							}}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default function CalendarLoading() {
	return (
		<div className="space-y-4">
			{/* Page heading */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<Skeleton className="h-9 w-36" />

					<Skeleton className="mt-1.5 h-5 w-36" />
				</div>

				<Skeleton className="h-10 w-32" />
			</div>

			{/* Filters + calendar controls */}
			<div className="flex flex-col gap-3 xl:flex-row xl:items-center">
				<Skeleton className="h-9 w-full xl:flex-1" />

				<div className="flex flex-wrap items-center gap-2">
					{FILTER_SKELETONS.map((filter) => (
						<Skeleton
							key={filter.id}
							className={`h-8 ${filter.widthClassName}`}
						/>
					))}
				</div>

				<div className="flex items-center gap-2 border-t border-border pt-3 xl:ml-1 xl:border-l xl:border-t-0 xl:pl-3 xl:pt-0">
					<Skeleton className="h-8 w-24" />

					<Skeleton className="h-8 w-24" />
				</div>
			</div>

			{/* Calendar */}
			<section className="overflow-hidden rounded-xl border border-border bg-card">
				{/* Month navigation only */}
				<div className="flex items-center justify-center bg-primary px-4 py-3">
					<div className="flex items-center gap-3">
						<Skeleton className="size-6 bg-primary-foreground/20" />

						<Skeleton className="h-6 w-32 bg-primary-foreground/20" />

						<Skeleton className="size-6 bg-primary-foreground/20" />
					</div>
				</div>

				<div className="overflow-x-auto">
					<div className="min-w-[900px]">
						<div className="grid grid-cols-7 border-b border-border bg-muted/35">
							{WEEKDAYS.map((day) => (
								<div
									key={day}
									className="border-r border-border px-3 py-2 last:border-r-0"
								>
									<Skeleton className="h-3 w-8" />
								</div>
							))}
						</div>

						{WEEKS.map((week) => (
							<CalendarWeekSkeleton
								key={week.id}
								bars={week.bars}
								dimLeadingDays={week.dimLeadingDays}
							/>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
