import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const WARMUP_RUNS = 3;
const MEASURED_RUNS = 20;

const metricNames = [
	"dashboard",
	"projects",
	"team",
	"project-detail",
	"task-open",
	"activity-open",
	"archived-open",
	"assignee-open",
	"notifications-open",
] as const;

type MetricName = (typeof metricNames)[number];

type Summary = {
	medianMs: number;
	p95Ms: number;
	meanMs: number;
	minMs: number;
	maxMs: number;
	samplesMs: number[];
};

function round(value: number) {
	return Math.round(value * 10) / 10;
}

function median(values: number[]) {
	const sorted = [...values].sort((left, right) => left - right);
	const middle = Math.floor(sorted.length / 2);

	if (sorted.length % 2 === 0) {
		return (sorted[middle - 1] + sorted[middle]) / 2;
	}

	return sorted[middle];
}

function percentile(values: number[], percentileValue: number) {
	const sorted = [...values].sort((left, right) => left - right);
	const index = Math.max(
		0,
		Math.ceil((percentileValue / 100) * sorted.length) - 1,
	);

	return sorted[index];
}

function summarize(values: number[]): Summary {
	const mean =
		values.reduce((total, value) => total + value, 0) / values.length;

	return {
		medianMs: round(median(values)),
		p95Ms: round(percentile(values, 95)),
		meanMs: round(mean),
		minMs: round(Math.min(...values)),
		maxMs: round(Math.max(...values)),
		samplesMs: values.map(round),
	};
}

async function time(operation: () => Promise<void>) {
	const start = performance.now();

	await operation();

	return performance.now() - start;
}

async function measure(
	name: MetricName,
	operation: () => Promise<void>,
	results: Record<MetricName, number[]>,
) {
	for (let run = 0; run < WARMUP_RUNS; run++) {
		await operation();
	}

	for (let run = 0; run < MEASURED_RUNS; run++) {
		const elapsed = await time(operation);

		results[name].push(elapsed);
	}
}

async function waitForPageHeading(page: Page, heading: string) {
	await expect(
		page.getByRole("heading", {
			name: heading,
			level: 1,
			exact: true,
		}),
	).toBeVisible();
}

function git(command: string) {
	try {
		return execSync(command, { encoding: "utf8" }).trim();
	} catch {
		return "unknown";
	}
}

test.describe("Shiro performance benchmark", () => {
	test("measures the primary server-data paths", async ({ page }) => {
		test.setTimeout(20 * 60_000);

		const results: Record<MetricName, number[]> = {
			dashboard: [],
			projects: [],
			team: [],
			"project-detail": [],
			"task-open": [],
			"activity-open": [],
			"archived-open": [],
			"assignee-open": [],
			"notifications-open": [],
		};

		// Discover stable seeded routes before timing anything.
		await page.goto("/projects");
		await waitForPageHeading(page, "Projects");

		const shiroCard = page.locator("article").filter({
			has: page.getByRole("heading", { name: "Shiro", level: 2, exact: true }),
		});

		await expect(shiroCard.first()).toBeVisible();

		const projectHref = await shiroCard
			.first()
			.getByRole("link")
			.getAttribute("href");

		if (!projectHref) {
			throw new Error(
				'The benchmark needs the seeded "Shiro" project, but its project URL could not be resolved.',
			);
		}

		await page.goto(projectHref);
		await waitForPageHeading(page, "Shiro");

		const firstTaskLink = page.locator('a[aria-label^="Open "]').first();

		await expect(firstTaskLink).toBeVisible();

		const taskAriaLabel = await firstTaskLink.getAttribute("aria-label");
		const taskHref = await firstTaskLink.getAttribute("href");

		if (!taskAriaLabel || !taskHref) {
			throw new Error(
				'The benchmark needs at least one task in the seeded "Shiro" project.',
			);
		}

		const taskTitle = taskAriaLabel.replace(/^Open /, "");

		await measure(
			"dashboard",
			async () => {
				await page.goto("/dashboard");
				await waitForPageHeading(page, "Dashboard");
			},
			results,
		);

		await measure(
			"projects",
			async () => {
				await page.goto("/projects");
				await waitForPageHeading(page, "Projects");
				await expect(
					page.getByRole("heading", { name: "Shiro", level: 2, exact: true }),
				).toBeVisible();
			},
			results,
		);

		await measure(
			"team",
			async () => {
				await page.goto("/team");
				await waitForPageHeading(page, "Team");
			},
			results,
		);

		await measure(
			"project-detail",
			async () => {
				await page.goto(projectHref);
				await waitForPageHeading(page, "Shiro");
				await expect(
					page.locator('a[aria-label^="Open "]').first(),
				).toBeVisible();
			},
			results,
		);

		await measure(
			"task-open",
			async () => {
				await page.goto(projectHref);
				await waitForPageHeading(page, "Shiro");

				const link = page.locator(`a[href="${taskHref}"]`).first();
				await expect(link).toBeVisible();
				await link.click();

				await expect(
					page.getByRole("heading", { name: taskTitle, level: 1 }),
				).toBeVisible();
				await expect(
					page.getByText("Task details", { exact: true }),
				).toBeVisible();
			},
			results,
		);

		await measure(
			"activity-open",
			async () => {
				await page.goto(projectHref);
				await waitForPageHeading(page, "Shiro");

				await page
					.getByRole("button", { name: "View project activity" })
					.click();
				await expect(
					page.getByRole("heading", { name: "Project activity" }),
				).toBeVisible();
				await expect(
					page.getByText("Loading activity...", { exact: true }),
				).toBeHidden();
			},
			results,
		);

		await measure(
			"archived-open",
			async () => {
				await page.goto(projectHref);
				await waitForPageHeading(page, "Shiro");

				await page.getByRole("button", { name: /^Archived tasks \(/ }).click();
				await expect(
					page.getByRole("heading", { name: "Archived tasks" }),
				).toBeVisible();
				await expect(
					page.getByText("Loading archived tasks...", { exact: true }),
				).toBeHidden();
			},
			results,
		);

		await measure(
			"assignee-open",
			async () => {
				await page.goto(projectHref);
				await waitForPageHeading(page, "Shiro");

				const assigneeButton = page
					.getByRole("button", { name: "Manage task assignees" })
					.first();

				await expect(assigneeButton).toBeVisible();
				await assigneeButton.click();
				await expect(
					page.getByText("Your team", { exact: true }),
				).toBeVisible();
			},
			results,
		);

		await measure(
			"notifications-open",
			async () => {
				await page.goto("/dashboard");
				await waitForPageHeading(page, "Dashboard");

				await page.getByRole("button", { name: /^Notifications/ }).click();
				await expect(
					page.getByRole("heading", { name: "Notifications", level: 2 }),
				).toBeVisible();
				await expect(
					page.getByText("Loading notifications...", { exact: true }),
				).toBeHidden();
			},
			results,
		);

		const summaries = Object.fromEntries(
			metricNames.map((name) => [name, summarize(results[name])]),
		) as Record<MetricName, Summary>;

		const label = process.env.BENCHMARK_LABEL ?? "benchmark";
		const outputDirectory = path.join(process.cwd(), "benchmark-results");
		const outputPath = path.join(outputDirectory, `${label}.json`);

		fs.mkdirSync(outputDirectory, { recursive: true });

		fs.writeFileSync(
			outputPath,
			`${JSON.stringify(
				{
					label,
					branch: git("git branch --show-current"),
					commit: git("git rev-parse --short HEAD"),
					warmupRuns: WARMUP_RUNS,
					measuredRuns: MEASURED_RUNS,
					createdAt: new Date().toISOString(),
					metrics: summaries,
				},
				null,
				2,
			)}\n`,
		);

		console.log(`\nShiro performance benchmark: ${label}`);
		console.log(`Branch: ${git("git branch --show-current")}`);
		console.log(`Commit: ${git("git rev-parse --short HEAD")}\n`);

		for (const name of metricNames) {
			const summary = summaries[name];

			console.log(
				`${name.padEnd(20)} median ${summary.medianMs.toFixed(1).padStart(8)} ms | p95 ${summary.p95Ms.toFixed(1).padStart(8)} ms`,
			);
		}

		console.log(`\nSaved: ${outputPath}\n`);
	});
});
