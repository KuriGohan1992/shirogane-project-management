import { createHash } from "node:crypto";

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { ilike, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import type { ActivityMetadata } from "../lib/constants/activity";
import type { ColorValue } from "../lib/constants/colors";
import * as schema from "../lib/db/schema";
import {
	activityLogs,
	projectLabels,
	projectMembers,
	projects,
	stages,
	taskAssignees,
	taskComments,
	taskLabels,
	tasks,
	users,
	type NewActivityLog,
	type NewProject,
	type NewProjectLabel,
	type NewProjectMember,
	type NewStage,
	type NewTask,
	type NewTaskAssignee,
	type NewTaskComment,
	type NewTaskLabel,
	type NewUser,
} from "../lib/db/schema";

config({ path: ".env.local" });
config();

function getRequiredEnv(name: string) {
	const value = process.env[name]?.trim();

	if (!value) {
		throw new Error(`${name} is missing or empty.`);
	}

	return value;
}

const databaseUrl = getRequiredEnv("DATABASE_URL");
const seedUserEmail = getRequiredEnv("SEED_USER_EMAIL");

if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
	throw new Error(
		"Refusing to seed while NODE_ENV=production. If this is intentional, set ALLOW_PRODUCTION_SEED=true.",
	);
}

const sqlClient = neon(databaseUrl);
const db = drizzle({
	client: sqlClient,
	schema,
});

const SEED_NAMESPACE = "shiro-dev-seed-v1";
const DAY_MS = 24 * 60 * 60 * 1000;

const now = new Date();
const BASE_DATE = new Date(
	Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0),
);

function deterministicUuid(key: string) {
	const hex = createHash("sha256")
		.update(`${SEED_NAMESPACE}:${key}`)
		.digest("hex")
		.slice(0, 32)
		.split("");

	// UUID v4-style version/variant bits, while keeping the value deterministic.
	hex[12] = "4";
	hex[16] = "8";

	const value = hex.join("");

	return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

function hashNumber(value: string) {
	const hash = createHash("sha256").update(value).digest();
	return hash.readUInt32LE(0);
}

function createRandom(seed: string) {
	let state = hashNumber(`${SEED_NAMESPACE}:${seed}`) >>> 0;

	return () => {
		state += 0x6d2b79f5;
		let result = state;
		result = Math.imul(result ^ (result >>> 15), result | 1);
		result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
		return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
	};
}

function pick<T>(values: readonly T[], random: () => number): T {
	return values[Math.floor(random() * values.length)] as T;
}

function unique<T>(values: T[]) {
	return [...new Set(values)];
}

function dateFromNow(days: number, hour = 12) {
	const date = new Date(BASE_DATE.getTime() + days * DAY_MS);
	date.setUTCHours(hour, 0, 0, 0);
	return date;
}

function addMinutes(date: Date, minutes: number) {
	return new Date(date.getTime() + minutes * 60 * 1000);
}

function normalizeLabelName(value: string) {
	return value.trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

type SeedPerson = {
	key: string;
	name: string;
	email: string;
	imageUrl: string | null;
};

const PEOPLE: SeedPerson[] = [
	{
		key: "avery-chen",
		name: "Avery Chen",
		email: "seed.avery.chen@shiro.local",
		imageUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Avery%20Chen",
	},
	{
		key: "maya-rodriguez",
		name: "Maya Rodriguez",
		email: "seed.maya.rodriguez@shiro.local",
		imageUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Maya%20Rodriguez",
	},
	{
		key: "noah-williams",
		name: "Noah Williams",
		email: "seed.noah.williams@shiro.local",
		imageUrl: null,
	},
	{
		key: "sofia-patel",
		name: "Sofia Patel",
		email: "seed.sofia.patel@shiro.local",
		imageUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Sofia%20Patel",
	},
	{
		key: "liam-nguyen",
		name: "Liam Nguyen",
		email: "seed.liam.nguyen@shiro.local",
		imageUrl: null,
	},
	{
		key: "isabella-rossi",
		name: "Isabella Rossi",
		email: "seed.isabella.rossi@shiro.local",
		imageUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Isabella%20Rossi",
	},
	{
		key: "ethan-kim",
		name: "Ethan Kim",
		email: "seed.ethan.kim@shiro.local",
		imageUrl: null,
	},
	{
		key: "amara-okafor",
		name: "Amara Okafor",
		email: "seed.amara.okafor@shiro.local",
		imageUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Amara%20Okafor",
	},
	{
		key: "lucas-martin",
		name: "Lucas Martin",
		email: "seed.lucas.martin@shiro.local",
		imageUrl: null,
	},
	{
		key: "zoe-santos",
		name: "Zoe Santos",
		email: "seed.zoe.santos@shiro.local",
		imageUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Zoe%20Santos",
	},
	{
		key: "daniel-garcia",
		name: "Daniel Garcia",
		email: "seed.daniel.garcia@shiro.local",
		imageUrl: null,
	},
	{
		key: "priya-shah",
		name: "Priya Shah",
		email: "seed.priya.shah@shiro.local",
		imageUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Priya%20Shah",
	},
	{
		key: "mateo-cruz",
		name: "Mateo Cruz",
		email: "seed.mateo.cruz@shiro.local",
		imageUrl: null,
	},
	{
		key: "nina-park",
		name: "Nina Park",
		email: "seed.nina.park@shiro.local",
		imageUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Nina%20Park",
	},
];

type SeedRole = "member" | "viewer";

type ProjectScenario = {
	key: string;
	name: string;
	description: string | null;
	color: ColorValue;
	ownerSeedIndex: number | null;
	currentUserRole?: SeedRole;
	createdOffset: number;
	startOffset?: number | null;
	dueOffset?: number | null;
	completedOffset?: number | null;
	lastActivityOffset: number;
	stageTemplate: number;
	taskCount: number;
	extraMemberCount: number;
};

/*
 * The project dates are intentionally spread across several years.
 *
 * The first seed version clustered almost every active schedule around the
 * current month. That was useful as a calendar stress test, but it was not a
 * believable everyday dataset. This version keeps only a handful of active
 * projects around "now", while older completed work and future work live
 * months or years away.
 */
const PROJECT_SCENARIOS: ProjectScenario[] = [
	{
		key: "shiro-mobile",
		name: "Shiro Mobile Companion",
		description:
			"A responsive mobile companion for quickly checking projects, assigned work, deadlines, and recent activity while away from a desktop.",
		color: "cyan",
		ownerSeedIndex: null,
		createdOffset: -95,
		startOffset: -22,
		dueOffset: 48,
		lastActivityOffset: -1,
		stageTemplate: 0,
		taskCount: 24,
		extraMemberCount: 7,
	},
	{
		key: "campus-events",
		name: "Campus Event Platform",
		description:
			"Centralize student organization events, RSVPs, venue information, reminders, and organizer workflows.",
		color: "blue",
		ownerSeedIndex: null,
		createdOffset: -430,
		startOffset: -390,
		dueOffset: -315,
		completedOffset: -309,
		lastActivityOffset: -309,
		stageTemplate: 1,
		taskCount: 19,
		extraMemberCount: 5,
	},
	{
		key: "capstone-launch",
		name: "Capstone Launch",
		description:
			"Plan the final capstone release, technical documentation, presentation rehearsal, QA, and deployment checklist.",
		color: "violet",
		ownerSeedIndex: null,
		createdOffset: -760,
		startOffset: -720,
		dueOffset: -640,
		completedOffset: -635,
		lastActivityOffset: -635,
		stageTemplate: 2,
		taskCount: 28,
		extraMemberCount: 6,
	},
	{
		key: "design-system",
		name: "Design System Refresh",
		description:
			"Unify typography, spacing, component states, light and dark mode tokens, and accessibility behavior across the product.",
		color: "rose",
		ownerSeedIndex: null,
		createdOffset: -120,
		startOffset: -42,
		dueOffset: 19,
		lastActivityOffset: -2,
		stageTemplate: 3,
		taskCount: 18,
		extraMemberCount: 4,
	},
	{
		key: "api-migration",
		name: "API Migration",
		description:
			"Move legacy endpoints to the new API layer while preserving compatibility, observability, and rollback options.",
		color: "orange",
		ownerSeedIndex: null,
		createdOffset: -585,
		startOffset: -545,
		dueOffset: -485,
		completedOffset: -479,
		lastActivityOffset: -479,
		stageTemplate: 4,
		taskCount: 17,
		extraMemberCount: 4,
	},
	{
		key: "accessibility-audit",
		name: "Accessibility Audit",
		description:
			"Audit keyboard navigation, focus behavior, semantic markup, color contrast, motion, and screen-reader support.",
		color: "emerald",
		ownerSeedIndex: null,
		createdOffset: -48,
		startOffset: -6,
		dueOffset: 24,
		lastActivityOffset: -1,
		stageTemplate: 0,
		taskCount: 15,
		extraMemberCount: 3,
	},
	{
		key: "docs-overhaul",
		name: "Documentation Overhaul",
		description:
			"Rewrite developer onboarding, architecture notes, user guides, and operational runbooks.",
		color: "yellow",
		ownerSeedIndex: null,
		createdOffset: -270,
		startOffset: null,
		dueOffset: null,
		lastActivityOffset: -12,
		stageTemplate: 5,
		taskCount: 14,
		extraMemberCount: 5,
	},
	{
		key: "research-tracker",
		name: "Research Tracker",
		description:
			"Organize papers, experiments, interview notes, findings, and follow-up work for a semester-long research project.",
		color: "slate",
		ownerSeedIndex: 0,
		currentUserRole: "member",
		createdOffset: -65,
		startOffset: 18,
		dueOffset: 118,
		lastActivityOffset: -3,
		stageTemplate: 2,
		taskCount: 21,
		extraMemberCount: 5,
	},
	{
		key: "student-marketplace",
		name: "Student Marketplace",
		description:
			"Build a safe campus marketplace for listings, messaging, moderation, reporting, and pickup coordination.",
		color: "cyan",
		ownerSeedIndex: 1,
		currentUserRole: "member",
		createdOffset: -265,
		startOffset: -225,
		dueOffset: -155,
		completedOffset: -149,
		lastActivityOffset: -149,
		stageTemplate: 1,
		taskCount: 25,
		extraMemberCount: 7,
	},
	{
		key: "hackathon-command",
		name: "Hackathon Command Center",
		description:
			"Coordinate the hackathon build, demo milestones, blockers, judging requirements, and last-minute polish.",
		color: "violet",
		ownerSeedIndex: 2,
		currentUserRole: "member",
		createdOffset: -24,
		startOffset: 7,
		dueOffset: 13,
		lastActivityOffset: -1,
		stageTemplate: 3,
		taskCount: 20,
		extraMemberCount: 6,
	},
	{
		key: "realtime-collab",
		name: "Realtime Collaboration Prototype",
		description:
			"Prototype live presence, synchronized board changes, optimistic updates, and conflict handling.",
		color: "rose",
		ownerSeedIndex: 3,
		currentUserRole: "member",
		createdOffset: -18,
		startOffset: 132,
		dueOffset: 205,
		lastActivityOffset: -4,
		stageTemplate: 4,
		taskCount: 22,
		extraMemberCount: 5,
	},
	{
		key: "internship-hub",
		name: "Internship Application Hub",
		description:
			"Track companies, deadlines, interviews, follow-ups, portfolio changes, and application status.",
		color: "orange",
		ownerSeedIndex: 4,
		currentUserRole: "member",
		createdOffset: -210,
		startOffset: null,
		dueOffset: 172,
		lastActivityOffset: -6,
		stageTemplate: 5,
		taskCount: 16,
		extraMemberCount: 4,
	},
	{
		key: "open-source-sprint",
		name: "Open Source Sprint",
		description:
			"A short contribution sprint covering issue triage, documentation, bug fixes, reviews, and release preparation.",
		color: "emerald",
		ownerSeedIndex: 5,
		currentUserRole: "viewer",
		createdOffset: -930,
		startOffset: -890,
		dueOffset: -868,
		completedOffset: -865,
		lastActivityOffset: -865,
		stageTemplate: 0,
		taskCount: 18,
		extraMemberCount: 6,
	},
	{
		key: "study-group",
		name: "Study Group Scheduler",
		description:
			"Coordinate recurring study sessions, shared topics, resources, availability, and review assignments.",
		color: "yellow",
		ownerSeedIndex: 6,
		currentUserRole: "viewer",
		createdOffset: -340,
		startOffset: null,
		dueOffset: null,
		lastActivityOffset: -44,
		stageTemplate: 5,
		taskCount: 13,
		extraMemberCount: 4,
	},
	{
		key: "personal-finance",
		name: "Personal Finance Dashboard",
		description:
			"A completed budgeting and spending dashboard with recurring expenses, category insights, and monthly summaries.",
		color: "blue",
		ownerSeedIndex: 7,
		currentUserRole: "viewer",
		createdOffset: -1050,
		startOffset: -1010,
		dueOffset: -950,
		completedOffset: -944,
		lastActivityOffset: -944,
		stageTemplate: 1,
		taskCount: 17,
		extraMemberCount: 3,
	},
	{
		key: "portfolio-redesign",
		name: "Portfolio Redesign",
		description:
			"Refresh the personal portfolio with stronger case studies, responsive layouts, project storytelling, and performance improvements.",
		color: "rose",
		ownerSeedIndex: 8,
		currentUserRole: "member",
		createdOffset: -240,
		startOffset: -165,
		dueOffset: null,
		lastActivityOffset: -18,
		stageTemplate: 3,
		taskCount: 14,
		extraMemberCount: 5,
	},
	{
		key: "learning-analytics",
		name: "Learning Analytics Portal",
		description:
			"Explore student progress, engagement signals, activity trends, and instructor-facing insights.",
		color: "slate",
		ownerSeedIndex: 9,
		currentUserRole: "viewer",
		createdOffset: -8,
		startOffset: 225,
		dueOffset: 312,
		lastActivityOffset: -2,
		stageTemplate: 2,
		taskCount: 23,
		extraMemberCount: 7,
	},
	{
		key: "volunteer-board",
		name: "Community Volunteer Board",
		description:
			"Coordinate volunteer opportunities, organizer responsibilities, schedules, and follow-up tasks for community events.",
		color: "cyan",
		ownerSeedIndex: 10,
		currentUserRole: "member",
		createdOffset: -210,
		startOffset: -184,
		dueOffset: -126,
		completedOffset: -121,
		lastActivityOffset: -121,
		stageTemplate: 4,
		taskCount: 19,
		extraMemberCount: 6,
	},
];

const STAGE_TEMPLATES = [
	["Backlog", "In Progress", "Review", "Done"],
	["Ideas", "Planned", "Design", "Build", "QA", "Launch"],
	["Inbox", "Ready", "In Progress", "Blocked", "Review", "Done"],
	["To do", "Design", "Implementation", "Polish", "Done"],
	["Backlog", "Ready", "Development", "Testing", "Release"],
	["Inbox", "Research", "Draft", "Review", "Published"],
] as const;

const LABEL_LIBRARY: ReadonlyArray<{ name: string; color: ColorValue }> = [
	{ name: "Frontend", color: "cyan" },
	{ name: "Backend", color: "blue" },
	{ name: "Design", color: "violet" },
	{ name: "Bug", color: "rose" },
	{ name: "Research", color: "orange" },
	{ name: "Documentation", color: "emerald" },
	{ name: "QA", color: "yellow" },
	{ name: "Infrastructure", color: "slate" },
];

const TASK_TITLES = [
	"Define success metrics",
	"Audit the current workflow",
	"Design responsive navigation",
	"Implement authentication flow",
	"Build project filter controls",
	"Add empty and loading states",
	"Review database indexes",
	"Write onboarding documentation",
	"Fix mobile overflow regression",
	"Improve keyboard navigation",
	"Add project member permissions",
	"Refactor duplicated date helpers",
	"Implement optimistic task movement",
	"Create analytics query prototype",
	"Review accessibility contrast",
	"Add activity feed pagination",
	"Handle long project names without breaking layout",
	"Create reusable form validation",
	"Test error and retry states",
	"Prepare release checklist",
	"Investigate slow dashboard query",
	"Document API behavior",
	"Clean up inconsistent spacing",
	"Add assignee overflow preview",
	"Verify dark mode tokens",
	"Polish calendar timeline interactions",
	"Add project search indexing",
	"Review notification requirements",
	"Validate permission boundaries",
	"Prepare demo data and screenshots",
] as const;

const TASK_DESCRIPTIONS = [
	"Capture the expected behavior, edge cases, and acceptance criteria before implementation starts.",
	"Keep the implementation small and reusable. Avoid introducing a second source of truth.",
	"Test this in both light and dark mode and verify narrow as well as wide desktop layouts.",
	"Make sure keyboard and pointer interactions behave consistently and do not interfere with each other.",
	"This task intentionally has a longer description so truncation and full-detail views can be exercised with realistic content. Include error states, empty states, loading behavior, permissions, and responsive considerations.",
	null,
	null,
] as const;

const COMMENT_TEMPLATES = [
	"I pushed the first pass. The main flow works, but I still want to verify the edge cases.",
	"Can we keep this consistent with the existing project UI instead of introducing another pattern?",
	"I tested this on a narrow viewport and found one overflow issue near the action controls.",
	"This looks good to me. I would keep the implementation simple and avoid adding another dependency.",
	"There is still a permission edge case here when the current user is only a viewer.",
	"I updated the copy and spacing. Please check the dark-mode state before we call this finished.",
	"The query is correct now, but we should add a regression test when the test suite is introduced.",
] as const;

const PRIORITIES = [null, "low", "medium", "medium", "high", "urgent"] as const;

function makeActivity(
	key: string,
	input: Omit<NewActivityLog, "id"> & { metadata: ActivityMetadata },
): NewActivityLog {
	return {
		id: deterministicUuid(`activity:${key}`),
		...input,
	};
}

async function main() {
	console.log(`\nSeeding Shiro around ${seedUserEmail}...\n`);

	const [currentUser] = await db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
		})
		.from(users)
		.where(ilike(users.email, seedUserEmail))
		.limit(1);

	if (!currentUser) {
		throw new Error(
			`No database user exists for ${seedUserEmail}. Sign in to Shiro once first so the Clerk user is synchronized into the users table.`,
		);
	}

	const syntheticUsers: NewUser[] = PEOPLE.map((person, index) => ({
		id: deterministicUuid(`user:${person.key}`),
		clerkId: `seed_clerk_${person.key}`,
		email: person.email,
		name: person.name,
		imageUrl: person.imageUrl,
		createdAt: dateFromNow(-980 + index * 41),
		updatedAt: dateFromNow(-120 + (index % 11) * 9),
	}));

	await db.insert(users).values(syntheticUsers).onConflictDoNothing();

	const syntheticNameById = new Map(
		syntheticUsers.map((user) => [user.id as string, user.name ?? user.email]),
	);

	const projectIds = PROJECT_SCENARIOS.map((project) =>
		deterministicUuid(`project:${project.key}`),
	);

	// This is what makes the seed safely rerunnable: only deterministic seed projects
	// are deleted. Your hand-created projects and account are not touched.
	await db.delete(projects).where(inArray(projects.id, projectIds));

	const projectRows: NewProject[] = [];
	const memberRows: NewProjectMember[] = [];
	const stageRows: NewStage[] = [];
	const labelRows: NewProjectLabel[] = [];
	const taskRows: NewTask[] = [];
	const assigneeRows: NewTaskAssignee[] = [];
	const taskLabelRows: NewTaskLabel[] = [];
	const commentRows: NewTaskComment[] = [];
	const activityRows: NewActivityLog[] = [];

	for (const [projectIndex, scenario] of PROJECT_SCENARIOS.entries()) {
		const random = createRandom(`project:${scenario.key}`);
		const projectId = deterministicUuid(`project:${scenario.key}`);
		const ownerId =
			scenario.ownerSeedIndex === null
				? currentUser.id
				: (syntheticUsers[scenario.ownerSeedIndex]?.id as string);

		if (!ownerId) {
			throw new Error(`Missing synthetic owner for ${scenario.name}.`);
		}

		const createdAt = dateFromNow(
			scenario.createdOffset,
			9 + (projectIndex % 5),
		);
		const startDate =
			scenario.startOffset === undefined || scenario.startOffset === null
				? null
				: dateFromNow(scenario.startOffset);
		const dueDate =
			scenario.dueOffset === undefined || scenario.dueOffset === null
				? null
				: dateFromNow(scenario.dueOffset);
		const completedAt =
			scenario.completedOffset === undefined || scenario.completedOffset === null
				? null
				: dateFromNow(scenario.completedOffset, 16);
		const updatedAt = dateFromNow(scenario.lastActivityOffset, 16);

		projectRows.push({
			id: projectId,
			ownerId,
			name: scenario.name,
			description: scenario.description,
			color: scenario.color,
			startDate,
			dueDate,
			completedAt,
			createdAt,
			updatedAt,
		});

		const memberIds: string[] = [];
		const roleByUserId = new Map<string, SeedRole>();

		if (ownerId !== currentUser.id) {
			const currentRole = scenario.currentUserRole ?? "member";
			memberRows.push({
				projectId,
				userId: currentUser.id,
				role: currentRole,
				joinedAt: addMinutes(createdAt, 120),
			});
			memberIds.push(currentUser.id);
			roleByUserId.set(currentUser.id, currentRole);
		}

		for (let memberOffset = 0; memberOffset < scenario.extraMemberCount; memberOffset += 1) {
			const candidateIndex =
				(projectIndex * 3 + memberOffset * 2 + 1) % syntheticUsers.length;
			const candidateId = syntheticUsers[candidateIndex]?.id as string;

			if (!candidateId || candidateId === ownerId || memberIds.includes(candidateId)) {
				continue;
			}

			const role: SeedRole = memberOffset % 4 === 3 ? "viewer" : "member";
			memberRows.push({
				projectId,
				userId: candidateId,
				role,
				joinedAt: addMinutes(createdAt, 180 + memberOffset * 90),
			});
			memberIds.push(candidateId);
			roleByUserId.set(candidateId, role);
		}

		const accessUserIds = unique([ownerId, ...memberIds]);
		const accessUserNames = new Map<string, string>();
		accessUserNames.set(
			currentUser.id,
			currentUser.name?.trim() || currentUser.email,
		);
		for (const [userId, name] of syntheticNameById) {
			accessUserNames.set(userId, name as string);
		}

		activityRows.push(
			makeActivity(`${scenario.key}:project-created`, {
				projectId,
				taskId: null,
				actorId: ownerId,
				action: "project_created",
				metadata: { projectName: scenario.name },
				createdAt,
			}),
		);

		for (const memberId of memberIds) {
			activityRows.push(
				makeActivity(`${scenario.key}:member-added:${memberId}`, {
					projectId,
					taskId: null,
					actorId: ownerId,
					action: "member_added",
					metadata: {
						memberName: accessUserNames.get(memberId) ?? "Project member",
						memberRole: roleByUserId.get(memberId) ?? "member",
					},
					createdAt: addMinutes(createdAt, 180 + memberIds.indexOf(memberId) * 60),
				}),
			);
		}

		const stageNames = STAGE_TEMPLATES[scenario.stageTemplate] ?? STAGE_TEMPLATES[0];
		const projectStageIds: string[] = [];

		for (const [stageIndex, stageName] of stageNames.entries()) {
			const stageId = deterministicUuid(`stage:${scenario.key}:${stageIndex}`);
			const stageCreatedAt = addMinutes(createdAt, 60 + stageIndex * 20);
			projectStageIds.push(stageId);
			stageRows.push({
				id: stageId,
				projectId,
				name: stageName,
				position: stageIndex,
				createdAt: stageCreatedAt,
				updatedAt: stageCreatedAt,
			});
			activityRows.push(
				makeActivity(`${scenario.key}:stage-created:${stageIndex}`, {
					projectId,
					taskId: null,
					actorId: ownerId,
					action: "stage_created",
					metadata: { stageName },
					createdAt: stageCreatedAt,
				}),
			);
		}

		const projectLabelIds: string[] = [];
		const projectLabelNames = new Map<string, string>();
		const labelCount = 5 + (projectIndex % 3);

		for (let labelIndex = 0; labelIndex < labelCount; labelIndex += 1) {
			const libraryLabel =
				LABEL_LIBRARY[(projectIndex + labelIndex) % LABEL_LIBRARY.length] ?? LABEL_LIBRARY[0];
			const labelId = deterministicUuid(`label:${scenario.key}:${libraryLabel.name}`);
			projectLabelIds.push(labelId);
			projectLabelNames.set(labelId, libraryLabel.name);
			labelRows.push({
				id: labelId,
				projectId,
				name: libraryLabel.name,
				normalizedName: normalizeLabelName(libraryLabel.name),
				color: libraryLabel.color,
				createdAt: addMinutes(createdAt, 240 + labelIndex * 15),
				updatedAt: addMinutes(createdAt, 240 + labelIndex * 15),
			});
		}

		const positionsByStage = new Map<string, number>();

		for (let taskIndex = 0; taskIndex < scenario.taskCount; taskIndex += 1) {
			const taskId = deterministicUuid(`task:${scenario.key}:${taskIndex}`);
			const stageIndex = Math.min(
				projectStageIds.length - 1,
				Math.floor(random() * projectStageIds.length),
			);
			const stageId = projectStageIds[stageIndex] as string;
			const stageName = stageNames[stageIndex] as string;
			const position = positionsByStage.get(stageId) ?? 0;
			positionsByStage.set(stageId, position + 1);

			const baseTitle = TASK_TITLES[(projectIndex * 5 + taskIndex) % TASK_TITLES.length] as string;
			const title =
				taskIndex % 11 === 0
					? `${baseTitle} for ${scenario.name}`
					: baseTitle;
			const description = pick(TASK_DESCRIPTIONS, random);
			const priority = pick(PRIORITIES, random);

			/*
			 * Task creation/activity dates follow the lifetime of their project instead
			 * of every task pretending to have been created during the last two months.
			 */
			const creationStartOffset = scenario.createdOffset + 2;
			const creationEndOffset = Math.max(
				creationStartOffset,
				scenario.lastActivityOffset - 1,
			);
			const creationSpan = creationEndOffset - creationStartOffset;
			const taskCreatedOffset =
				creationStartOffset + Math.floor(random() * (creationSpan + 1));
			const taskCreatedAt = dateFromNow(
				taskCreatedOffset,
				8 + (taskIndex % 9),
			);

			let startDate: Date | null = null;
			let dueDate: Date | null = null;
			const dateMode = taskIndex % 8;

			const scheduleStartOffset =
				scenario.startOffset ??
				Math.max(scenario.createdOffset + 14, scenario.lastActivityOffset - 75);
			const scheduleEndOffset =
				scenario.dueOffset ??
				Math.max(scheduleStartOffset + 30, scenario.lastActivityOffset + 35);
			const latestTaskDateOffset =
				scenario.completedOffset ?? scheduleEndOffset + 21;
			const scheduleSpan = Math.max(1, scheduleEndOffset - scheduleStartOffset);
			const taskAnchorOffset =
				scheduleStartOffset + Math.floor(random() * (scheduleSpan + 1));

			if (dateMode === 1) {
				dueDate = dateFromNow(taskAnchorOffset);
			} else if (dateMode === 2) {
				startDate = dateFromNow(taskAnchorOffset - 2);
				dueDate = dateFromNow(Math.min(scheduleEndOffset, taskAnchorOffset + 5));
			} else if (dateMode === 3) {
				startDate = dateFromNow(taskAnchorOffset);
			} else if (dateMode === 4) {
				dueDate = dateFromNow(
					Math.min(latestTaskDateOffset, scheduleEndOffset + 10, taskAnchorOffset + 10),
				);
			} else if (dateMode === 5) {
				startDate = dateFromNow(Math.max(scheduleStartOffset, taskAnchorOffset - 8));
				dueDate = dateFromNow(Math.min(scheduleEndOffset, taskAnchorOffset + 2));
			} else if (dateMode === 6) {
				startDate = dateFromNow(taskAnchorOffset);
				dueDate = dateFromNow(Math.min(latestTaskDateOffset, scheduleEndOffset + 21, taskAnchorOffset + 16));
			} else if (dateMode === 7 && scenario.completedOffset === undefined) {
				/* Intentionally leave some active tasks entirely unscheduled. */
				startDate = null;
				dueDate = null;
			}

			const canArchive = scenario.completedOffset === undefined || scenario.completedOffset === null;
			const archivedAt =
				canArchive && taskIndex % 13 === 0
					? dateFromNow(
						Math.min(-1, scenario.lastActivityOffset - (taskIndex % 9)),
						17,
					)
					: null;
			const updatedAt =
				archivedAt ??
				dateFromNow(
					Math.max(taskCreatedOffset, scenario.lastActivityOffset - (taskIndex % 12)),
					17,
				);

			taskRows.push({
				id: taskId,
				stageId,
				title,
				description,
				position,
				priority,
				startDate,
				dueDate,
				archivedAt,
				createdAt: taskCreatedAt,
				updatedAt,
			});


			const actorId = pick(accessUserIds, random);
			activityRows.push(
				makeActivity(`${scenario.key}:task-created:${taskIndex}`, {
					projectId,
					taskId,
					actorId,
					action: "task_created",
					metadata: { taskTitle: title, stageName },
					createdAt: taskCreatedAt,
				}),
			);

			if (stageIndex > 0 && taskIndex % 4 === 0) {
				const previousStageName = stageNames[stageIndex - 1] as string;
				activityRows.push(
					makeActivity(`${scenario.key}:task-moved:${taskIndex}`, {
						projectId,
						taskId,
						actorId,
						action: "task_moved",
						metadata: {
							taskTitle: title,
							previousStageName,
							fromStage: previousStageName,
							toStage: stageName,
							stageName,
						},
						createdAt: addMinutes(taskCreatedAt, 360 + taskIndex * 7),
					}),
				);
			}

			if (archivedAt) {
				activityRows.push(
					makeActivity(`${scenario.key}:task-archived:${taskIndex}`, {
						projectId,
						taskId,
						actorId,
						action: "task_archived",
						metadata: { taskTitle: title },
						createdAt: archivedAt,
					}),
				);
			}

			const assigneeCount =
				taskIndex % 6 === 0
					? Math.min(3, accessUserIds.length)
					: taskIndex % 3 === 0
						? Math.min(2, accessUserIds.length)
						: taskIndex % 5 === 0
							? 0
							: 1;
			const shuffledAccessUsers = [...accessUserIds].sort(
				(a, b) => hashNumber(`${taskId}:${a}`) - hashNumber(`${taskId}:${b}`),
			);
			const selectedAssignees = shuffledAccessUsers.slice(0, assigneeCount);

			for (const assigneeId of selectedAssignees) {
				const assignedAt = addMinutes(taskCreatedAt, 45 + selectedAssignees.indexOf(assigneeId) * 20);
				assigneeRows.push({
					taskId,
					userId: assigneeId,
					assignedAt,
				});
				activityRows.push(
					makeActivity(`${scenario.key}:assignee-added:${taskIndex}:${assigneeId}`, {
						projectId,
						taskId,
						actorId,
						action: "assignee_added",
						metadata: {
							taskTitle: title,
							assigneeName: accessUserNames.get(assigneeId) ?? "Project member",
						},
						createdAt: assignedAt,
					}),
				);
			}

			const taskLabelCount = taskIndex % 5 === 0 ? 0 : 1 + (taskIndex % 3);
			const selectedLabelIds = projectLabelIds
				.filter((_, labelIndex) => (labelIndex + taskIndex) % 2 === 0)
				.slice(0, taskLabelCount);

			for (const labelId of selectedLabelIds) {
				taskLabelRows.push({ taskId, labelId });
			}

			if (selectedLabelIds[0]) {
				activityRows.push(
					makeActivity(`${scenario.key}:label-added:${taskIndex}`, {
						projectId,
						taskId,
						actorId,
						action: "label_added",
						metadata: {
							taskTitle: title,
							labelName: projectLabelNames.get(selectedLabelIds[0]) ?? "Label",
						},
						createdAt: addMinutes(taskCreatedAt, 120),
					}),
				);
			}

			const commentCount =
				taskIndex % 7 === 0 ? 3 : taskIndex % 4 === 0 ? 2 : taskIndex % 3 === 0 ? 1 : 0;

			for (let commentIndex = 0; commentIndex < commentCount; commentIndex += 1) {
				const commentId = deterministicUuid(
					`comment:${scenario.key}:${taskIndex}:${commentIndex}`,
				);
				const authorId = accessUserIds[(taskIndex + commentIndex) % accessUserIds.length] as string;
				const commentCreatedAt = addMinutes(taskCreatedAt, 240 + commentIndex * 180);
				commentRows.push({
					id: commentId,
					taskId,
					authorId,
					content: COMMENT_TEMPLATES[(taskIndex + commentIndex) % COMMENT_TEMPLATES.length] as string,
					createdAt: commentCreatedAt,
					updatedAt: commentCreatedAt,
				});
				activityRows.push(
					makeActivity(`${scenario.key}:comment-added:${taskIndex}:${commentIndex}`, {
						projectId,
						taskId,
						actorId: authorId,
						action: "comment_added",
						metadata: { taskTitle: title },
						createdAt: commentCreatedAt,
					}),
				);
			}
		}

		activityRows.push(
			makeActivity(`${scenario.key}:project-updated`, {
				projectId,
				taskId: null,
				actorId: ownerId,
				action: "project_updated",
				metadata: {
					projectName: scenario.name,
					changedFields: "description, schedule",
				},
				createdAt: dateFromNow(scenario.lastActivityOffset, 15),
			}),
		);

		if (completedAt) {
			activityRows.push(
				makeActivity(`${scenario.key}:project-completed`, {
					projectId,
					taskId: null,
					actorId: ownerId,
					action: "project_completed",
					metadata: { projectName: scenario.name },
					createdAt: completedAt,
				}),
			);
		}
	}

	console.log("Reset seeded projects. Inserting fresh deterministic dataset...");

	await db.insert(projects).values(projectRows);
	await db.insert(projectMembers).values(memberRows);
	await db.insert(stages).values(stageRows);
	await db.insert(projectLabels).values(labelRows);
	await db.insert(tasks).values(taskRows);

	if (assigneeRows.length > 0) {
		await db.insert(taskAssignees).values(assigneeRows);
	}

	if (taskLabelRows.length > 0) {
		await db.insert(taskLabels).values(taskLabelRows);
	}

	if (commentRows.length > 0) {
		await db.insert(taskComments).values(commentRows);
	}

	if (activityRows.length > 0) {
		await db.insert(activityLogs).values(activityRows);
	}

	const currentUserAssignments = assigneeRows.filter(
		(assignment) => assignment.userId === currentUser.id,
	).length;
	const ownedProjects = projectRows.filter(
		(project) => project.ownerId === currentUser.id,
	).length;
	const memberProjects = memberRows.filter(
		(member) => member.userId === currentUser.id && member.role === "member",
	).length;
	const viewerProjects = memberRows.filter(
		(member) => member.userId === currentUser.id && member.role === "viewer",
	).length;

	console.log("\nSeed complete.\n");
	console.table({
		"Synthetic users": syntheticUsers.length,
		Projects: projectRows.length,
		"Projects you own": ownedProjects,
		"Projects where you are a member": memberProjects,
		"Projects where you are a viewer": viewerProjects,
		Memberships: memberRows.length,
		Stages: stageRows.length,
		Tasks: taskRows.length,
		"Your task assignments": currentUserAssignments,
		"Task assignments": assigneeRows.length,
		"Project labels": labelRows.length,
		"Task-label links": taskLabelRows.length,
		Comments: commentRows.length,
		"Activity logs": activityRows.length,
	});

	console.log(
		`\nThe seeded project IDs are deterministic. Running the command again resets only these ${projectRows.length} seed projects and recreates them; your manually-created projects are not deleted.`,
	);
}

main().catch((error) => {
	console.error("\nShiro seed failed:\n", error);
	process.exitCode = 1;
});
