import fs from "node:fs";
import path from "node:path";

const beforePath = process.argv[2] ?? "benchmark-results/before.json";
const afterPath = process.argv[3] ?? "benchmark-results/after.json";

function readResult(filePath) {
	return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
}

function improvement(before, after) {
	return ((before - after) / before) * 100;
}

function formatMs(value) {
	return `${value.toFixed(1)} ms`;
}

function formatPercent(value) {
	const sign = value > 0 ? "+" : "";
	return `${sign}${value.toFixed(1)}%`;
}

const before = readResult(beforePath);
const after = readResult(afterPath);
const metrics = Object.keys(before.metrics).filter(
	(name) => after.metrics[name],
);

console.log(`\nBefore: ${before.branch} @ ${before.commit}`);
console.log(`After:  ${after.branch} @ ${after.commit}\n`);
console.log(
	"Metric".padEnd(22) +
		"Before median".padStart(16) +
		"After median".padStart(16) +
		"Median change".padStart(16) +
		"Before p95".padStart(14) +
		"After p95".padStart(14) +
		"P95 change".padStart(14),
);
console.log("-".repeat(112));

for (const name of metrics) {
	const beforeMetric = before.metrics[name];
	const afterMetric = after.metrics[name];
	const medianImprovement = improvement(
		beforeMetric.medianMs,
		afterMetric.medianMs,
	);
	const p95Improvement = improvement(beforeMetric.p95Ms, afterMetric.p95Ms);

	console.log(
		name.padEnd(22) +
			formatMs(beforeMetric.medianMs).padStart(16) +
			formatMs(afterMetric.medianMs).padStart(16) +
			formatPercent(medianImprovement).padStart(16) +
			formatMs(beforeMetric.p95Ms).padStart(14) +
			formatMs(afterMetric.p95Ms).padStart(14) +
			formatPercent(p95Improvement).padStart(14),
	);
}

console.log(
	"\nPositive percentages mean the optimized version was faster; negative percentages mean it was slower.\n",
);
