import { createHash } from "node:crypto";

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { eq, ilike, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import type { ActivityMetadata } from "../lib/constants/activity";
import type { ColorValue } from "../lib/constants/colors";
import * as schema from "../lib/db/schema";
import {
	activityLogs,
	type NewActivityLog,
	type NewProjectLabel,
	type NewProjectMember,
	type NewStage,
	type NewTask,
	type NewTaskAssignee,
	type NewTaskComment,
	type NewTaskLabel,
	type NewUser,
	projectLabels,
	projectMembers,
	projects,
	stages,
	taskAssignees,
	taskComments,
	taskLabels,
	tasks,
	users,
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

if (
	process.env.NODE_ENV === "production" &&
	process.env.ALLOW_PRODUCTION_SEED !== "true"
) {
	throw new Error(
		"Refusing to seed Shiro while NODE_ENV=production. Set ALLOW_PRODUCTION_SEED=true only when this is intentional.",
	);
}

const sqlClient = neon(databaseUrl);
const db = drizzle({
	client: sqlClient,
	schema,
});

const SEED_NAMESPACE = "shiro-capstone-project-seed-v1";
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

	hex[12] = "4";
	hex[16] = "8";

	const value = hex.join("");

	return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
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

function makeActivity(
	key: string,
	input: Omit<NewActivityLog, "id"> & { metadata: ActivityMetadata },
): NewActivityLog {
	return {
		id: deterministicUuid(`activity:${key}`),
		...input,
	};
}

type CollaboratorKey = "avery" | "maya" | "noah" | "liam";
type AssigneeKey = "current" | CollaboratorKey;
type StageName = "Backlog" | "To Do" | "In Progress" | "Review" | "Done";

type ShiroTaskBlueprint = {
	key: string;
	title: string;
	description: string;
	stage: StageName;
	priority: NewTask["priority"];
	createdOffset: number;
	startOffset?: number | null;
	dueOffset?: number | null;
	completedOffset?: number | null;
	labels: string[];
	assignees: AssigneeKey[];
	comments?: Array<{
		author: AssigneeKey;
		offset: number;
		content: string;
	}>;
};

const SHIRO_STAGES: StageName[] = [
	"Backlog",
	"To Do",
	"In Progress",
	"Review",
	"Done",
];

const SHIRO_LABELS: Array<{ name: string; color: ColorValue }> = [
	{ name: "Architecture", color: "slate" },
	{ name: "Frontend", color: "cyan" },
	{ name: "Backend", color: "blue" },
	{ name: "Database", color: "orange" },
	{ name: "Auth", color: "violet" },
	{ name: "UX/UI", color: "rose" },
	{ name: "Accessibility", color: "emerald" },
	{ name: "Testing", color: "yellow" },
];

const COLLABORATORS: Array<{
	key: CollaboratorKey;
	name: string;
	email: string;
	jobTitle: string;
	role: "member" | "viewer";
}> = [
	{
		key: "avery",
		name: "Avery Chen",
		email: "avery.chen@shiro.local",
		jobTitle: "Software Engineer",
		role: "member",
	},
	{
		key: "maya",
		name: "Maya Rodriguez",
		email: "maya.rodriguez@shiro.local",
		jobTitle: "Product Designer",
		role: "member",
	},
	{
		key: "noah",
		name: "Noah Williams",
		email: "noah.williams@shiro.local",
		jobTitle: "QA Engineer",
		role: "member",
	},
	{
		key: "liam",
		name: "Liam Nguyen",
		email: "liam.nguyen@shiro.local",
		jobTitle: "Frontend Developer",
		role: "viewer",
	},
];

const SHIRO_TASKS: ShiroTaskBlueprint[] = [
	{
		key: "repo-foundation",
		title: "Fork and initialize the capstone repository",
		description:
			"Establish the Next.js capstone baseline, verify the starter project, configure package scripts, and confirm a clean local build before feature work begins.",
		stage: "Done",
		priority: "high",
		createdOffset: -36,
		completedOffset: -35,
		labels: ["Architecture"],
		assignees: ["current", "avery"],
	},
	{
		key: "tailwind-v4",
		title: "Upgrade the project to Tailwind CSS v4",
		description:
			"Migrate the starter styling setup to Tailwind v4 and verify the generated utility changes across the existing application.",
		stage: "Done",
		priority: "medium",
		createdOffset: -35,
		completedOffset: -34,
		labels: ["Frontend", "Architecture"],
		assignees: ["current"],
		comments: [
			{
				author: "current",
				offset: -34,
				content:
					"Tailwind v4 migration is stable. I verified the app still builds before continuing with the design pass.",
			},
		],
	},
	{
		key: "branding",
		title: "Define the Shiro brand and reusable visual system",
		description:
			"Rename the product to Shiro, establish the blue brand identity, semantic design tokens, spacing, typography, and the golden Kanban visual direction.",
		stage: "Done",
		priority: "high",
		createdOffset: -34,
		completedOffset: -32,
		labels: ["UX/UI", "Frontend"],
		assignees: ["current", "maya"],
		comments: [
			{
				author: "maya",
				offset: -33,
				content:
					"Keep the visual hierarchy restrained and reuse tonal layers instead of adding decorative depth everywhere.",
			},
		],
	},
	{
		key: "database-foundation",
		title: "Build the Drizzle and PostgreSQL data model",
		description:
			"Define users, projects, memberships, stages, tasks, assignees, labels, comments, activity, constraints, indexes, and migration history.",
		stage: "Done",
		priority: "urgent",
		createdOffset: -33,
		completedOffset: -30,
		labels: ["Database", "Backend", "Architecture"],
		assignees: ["current", "avery"],
		comments: [
			{
				author: "avery",
				offset: -31,
				content:
					"The many-to-many relationships should stay explicit through join tables so assignments and memberships remain enforceable at the database layer.",
			},
		],
	},
	{
		key: "clerk-auth",
		title: "Integrate Clerk authentication",
		description:
			"Add sign-in and sign-up flows, protect authenticated routes, and connect the authenticated Clerk identity to Shiro's server-side application shell.",
		stage: "Done",
		priority: "urgent",
		createdOffset: -31,
		completedOffset: -29,
		labels: ["Auth", "Backend"],
		assignees: ["current"],
	},
	{
		key: "clerk-sync",
		title: "Synchronize Clerk users into PostgreSQL",
		description:
			"Handle Clerk webhook synchronization and keep a defensive authenticated-user upsert path so the local users table stays usable across environments.",
		stage: "Done",
		priority: "high",
		createdOffset: -30,
		completedOffset: -28,
		labels: ["Auth", "Database", "Backend"],
		assignees: ["current", "avery"],
	},
	{
		key: "project-crud",
		title: "Implement project CRUD",
		description:
			"Create, read, update, complete, reactivate, and delete projects through validated Server Actions and permission-aware database operations.",
		stage: "Done",
		priority: "urgent",
		createdOffset: -29,
		completedOffset: -26,
		labels: ["Backend", "Database", "Frontend"],
		assignees: ["current", "avery"],
	},
	{
		key: "stage-crud",
		title: "Implement stage CRUD and board structure",
		description:
			"Create, rename, reorder, and delete project stages while preserving task ordering and project access rules.",
		stage: "Done",
		priority: "high",
		createdOffset: -27,
		completedOffset: -24,
		labels: ["Backend", "Frontend"],
		assignees: ["current"],
	},
	{
		key: "task-crud",
		title: "Implement task CRUD",
		description:
			"Support validated task creation, editing, deletion, archiving, restoration, priorities, schedules, and completion state.",
		stage: "Done",
		priority: "urgent",
		createdOffset: -26,
		completedOffset: -23,
		labels: ["Backend", "Database", "Frontend"],
		assignees: ["current", "avery"],
	},
	{
		key: "drag-drop",
		title: "Persist Kanban drag-and-drop movement",
		description:
			"Use dnd-kit with optimistic client state, serialized persistence, permission checks, task reordering, and rollback when a server save fails.",
		stage: "Done",
		priority: "urgent",
		createdOffset: -25,
		completedOffset: -22,
		labels: ["Frontend", "Backend", "Architecture"],
		assignees: ["current", "avery"],
		comments: [
			{
				author: "current",
				offset: -22,
				content:
					"The board now updates immediately but still rolls back to the confirmed server state when persistence fails.",
			},
		],
	},
	{
		key: "multiple-assignees",
		title: "Add multiple task assignees",
		description:
			"Model task assignments through a join table and expose reusable assignee controls for task creation, details, and bulk actions.",
		stage: "Done",
		priority: "high",
		createdOffset: -23,
		completedOffset: -20,
		labels: ["Database", "Backend", "Frontend"],
		assignees: ["current", "avery"],
	},
	{
		key: "permissions",
		title: "Implement Owner, Member, and Viewer permissions",
		description:
			"Centralize project capabilities and enforce authorization inside server/database mutations rather than relying only on hidden UI controls.",
		stage: "Done",
		priority: "urgent",
		createdOffset: -22,
		completedOffset: -19,
		labels: ["Auth", "Backend", "Testing"],
		assignees: ["current", "noah"],
		comments: [
			{
				author: "noah",
				offset: -20,
				content:
					"Viewer checks need to fail server-side too. Hiding the controls is only the UX layer, not the security boundary.",
			},
		],
	},
	{
		key: "task-metadata",
		title: "Add labels, priorities, dates, and comments",
		description:
			"Round out task planning with reusable labels, priority levels, date ranges, comments, assignment display, and activity entries.",
		stage: "Done",
		priority: "high",
		createdOffset: -20,
		completedOffset: -17,
		labels: ["Frontend", "Backend", "Database"],
		assignees: ["current", "maya"],
	},
	{
		key: "dashboard",
		title: "Build the dashboard overview",
		description:
			"Surface project statistics, task health, urgent work, recent projects, and activity in a server-rendered overview.",
		stage: "Done",
		priority: "medium",
		createdOffset: -19,
		completedOffset: -16,
		labels: ["Frontend", "Backend", "UX/UI"],
		assignees: ["current", "maya"],
	},
	{
		key: "project-filters",
		title: "Build reusable project filtering and search",
		description:
			"Move access, status, color, schedule, search, and sorting behavior into reusable URL-backed project filter controls and hooks.",
		stage: "Done",
		priority: "high",
		createdOffset: -18,
		completedOffset: -15,
		labels: ["Frontend", "Architecture"],
		assignees: ["current"],
	},
	{
		key: "calendar",
		title: "Build Calendar timeline and due-date modes",
		description:
			"Render project and task schedules on a calendar, reuse the project filter system, and support both full timeline bars and due-date-only markers.",
		stage: "Done",
		priority: "high",
		createdOffset: -16,
		completedOffset: -13,
		labels: ["Frontend", "UX/UI"],
		assignees: ["current", "maya"],
		comments: [
			{
				author: "current",
				offset: -13,
				content:
					"Calendar now reuses the same project filters instead of maintaining a second filtering implementation.",
			},
		],
	},
	{
		key: "team-directory",
		title: "Build the Team directory",
		description:
			"Show collaborators, job titles, access roles, project participation, and role comparison in a reusable team experience.",
		stage: "Done",
		priority: "medium",
		createdOffset: -14,
		completedOffset: -11,
		labels: ["Frontend", "Backend", "UX/UI"],
		assignees: ["current", "maya"],
	},
	{
		key: "notifications",
		title: "Implement notifications and due-date reminders",
		description:
			"Persist project/task notifications, respect user categories, deduplicate scheduled reminders, and expose a notification center in the shared dashboard shell.",
		stage: "Done",
		priority: "high",
		createdOffset: -12,
		completedOffset: -9,
		labels: ["Backend", "Database", "Frontend"],
		assignees: ["current", "avery"],
		comments: [
			{
				author: "avery",
				offset: -9,
				content:
					"The reminder job is idempotent through a deterministic dedupe key, so repeated cron executions do not create duplicate due-soon notifications.",
			},
		],
	},
	{
		key: "settings",
		title: "Implement Settings and notification preferences",
		description:
			"Add profile-facing settings, theme preferences, notification muting, and category-level notification controls.",
		stage: "Done",
		priority: "medium",
		createdOffset: -10,
		completedOffset: -8,
		labels: ["Frontend", "Backend", "UX/UI"],
		assignees: ["current"],
	},
	{
		key: "task-completion",
		title: "Add the task completion workflow",
		description:
			"Persist task completion timestamps, expose completion actions, update activity, and incorporate completion into dashboard and analytics behavior.",
		stage: "Done",
		priority: "high",
		createdOffset: -9,
		completedOffset: -7,
		labels: ["Backend", "Database", "Frontend"],
		assignees: ["current", "avery"],
	},
	{
		key: "analytics",
		title: "Build the project analytics dashboard",
		description:
			"Aggregate completion trends, task health, priority mix, project progress, contributor activity, and time-based filters through PostgreSQL queries.",
		stage: "Done",
		priority: "high",
		createdOffset: -8,
		completedOffset: -6,
		labels: ["Database", "Backend", "Frontend"],
		assignees: ["current", "avery"],
	},
	{
		key: "task-details",
		title: "Redesign task details and intercepted task routes",
		description:
			"Give task details a focused information hierarchy while retaining deep-linkable task URLs through an intercepted modal route.",
		stage: "Done",
		priority: "medium",
		createdOffset: -7,
		completedOffset: -5,
		labels: ["Frontend", "UX/UI", "Architecture"],
		assignees: ["current", "maya"],
	},
	{
		key: "landing-auth",
		title: "Redesign the landing and authentication experiences",
		description:
			"Create the Shiro landing page, product artwork, structured product sections, branded Clerk auth shell, and consistent sign-in/sign-up appearance.",
		stage: "Done",
		priority: "medium",
		createdOffset: -6,
		completedOffset: -4,
		labels: ["Frontend", "UX/UI", "Accessibility"],
		assignees: ["current", "maya"],
	},
	{
		key: "keyboard-theme",
		title: "Add keyboard shortcuts and polished theme transitions",
		description:
			"Support navigation/search shortcuts, editable-target guards, light/dark/system themes, and reduced-motion-aware theme transitions.",
		stage: "Done",
		priority: "medium",
		createdOffset: -5,
		completedOffset: -3,
		labels: ["Frontend", "Accessibility", "UX/UI"],
		assignees: ["current", "noah"],
	},
	{
		key: "seed-data",
		title: "Create deterministic demo seed data",
		description:
			"Generate realistic projects, collaborators, schedules, tasks, assignments, labels, comments, completion history, and activity without touching manually created projects.",
		stage: "Done",
		priority: "medium",
		createdOffset: -5,
		completedOffset: -3,
		labels: ["Database", "Testing"],
		assignees: ["current", "noah"],
	},
	{
		key: "repo-flatten",
		title: "Move Shiro to the repository root",
		description:
			"Flatten the original internship repository structure, remove obsolete starter documentation, preserve deployment configuration, and update root-aware documentation.",
		stage: "Done",
		priority: "medium",
		createdOffset: -4,
		completedOffset: -2,
		labels: ["Architecture", "Backend"],
		assignees: ["current"],
	},
	{
		key: "automated-tests",
		title: "Add unit, database integration, and Playwright tests",
		description:
			"Cover deterministic domain behavior with Vitest, real PostgreSQL constraints and workflows with integration tests, and critical browser flows with Playwright and Clerk testing helpers.",
		stage: "Done",
		priority: "urgent",
		createdOffset: -3,
		completedOffset: -1,
		labels: ["Testing", "Backend", "Frontend"],
		assignees: ["current", "noah"],
		comments: [
			{
				author: "noah",
				offset: -1,
				content:
					"Unit and database suites are green, and the browser suite now follows the actual accessible project-actions flow instead of ambiguous Delete selectors.",
			},
		],
	},
	{
		key: "production-migrations",
		title: "Repair production database migration drift",
		description:
			"Bring the deployed Neon schema up to the current Drizzle migration history so authenticated Vercel routes match the columns and tables expected by the application.",
		stage: "Done",
		priority: "urgent",
		createdOffset: -1,
		completedOffset: -1,
		labels: ["Database", "Backend", "Testing"],
		assignees: ["current", "avery"],
		comments: [
			{
				author: "current",
				offset: -1,
				content:
					"Production was behind the application schema. After applying the pending migrations, authenticated routes load against the same schema the code expects.",
			},
		],
	},
	{
		key: "docs-review",
		title: "Finalize README and testing documentation",
		description:
			"Merge the testing guide into the main README, remove stale limitations, and make deployment, environment, and test workflows easy to reproduce.",
		stage: "Review",
		priority: "medium",
		createdOffset: -2,
		startOffset: -1,
		dueOffset: 1,
		labels: ["Testing", "Architecture"],
		assignees: ["current", "noah"],
	},
	{
		key: "mobile-responsive",
		title: "Mobile responsiveness hardening",
		description:
			"Finish the responsive audit for dense project headers, collaborator controls, dashboard cards, bulk actions, popovers, settings, task details, analytics, and public pages.",
		stage: "In Progress",
		priority: "urgent",
		createdOffset: -5,
		startOffset: -2,
		dueOffset: 2,
		labels: ["Frontend", "UX/UI", "Accessibility"],
		assignees: ["current", "maya", "noah"],
		comments: [
			{
				author: "maya",
				offset: -1,
				content:
					"Prioritize the project header, collaborator modal, dashboard clipping, fixed-width popovers, bulk toolbar, and Settings layout before presentation day.",
			},
		],
	},
	{
		key: "final-testing",
		title: "Final regression testing and QA",
		description:
			"Run the full automated suite, production build, responsive smoke tests, permission checks, and final demo-path regression checks after the remaining changes.",
		stage: "In Progress",
		priority: "high",
		createdOffset: -2,
		startOffset: -1,
		dueOffset: 2,
		labels: ["Testing", "Accessibility"],
		assignees: ["current", "noah"],
	},
	{
		key: "presentation",
		title: "Prepare the capstone presentation and technical Q&A",
		description:
			"Rehearse the 15-minute technical walkthrough, prepare the three-minute end-to-end demo, and practice architecture, security, database, and testing questions.",
		stage: "In Progress",
		priority: "high",
		createdOffset: -1,
		startOffset: 0,
		dueOffset: 3,
		labels: ["Testing", "Architecture"],
		assignees: ["current"],
	},
	{
		key: "record-demo-video",
		title: "Record demo video",
		description:
			"Record and edit a concise Shiro walkthrough covering authentication, validation, project and task workflows, Kanban drag-and-drop, analytics, empty states, and responsive behavior for the capstone submission.",
		stage: "To Do",
		priority: "high",
		createdOffset: 0,
		startOffset: 1,
		dueOffset: 3,
		labels: ["UX/UI", "Testing"],
		assignees: ["current"],
	},
	{
		key: "email-invites",
		title: "Add email-based collaborator invites",
		description:
			"Create pending project invitations with secure tokens, expiration, role selection, resend/revoke behavior, Clerk sign-in handoff, and email delivery.",
		stage: "To Do",
		priority: "high",
		createdOffset: 0,
		startOffset: 4,
		dueOffset: 12,
		labels: ["Auth", "Backend", "Database"],
		assignees: ["current", "avery"],
		comments: [
			{
				author: "avery",
				offset: 0,
				content:
					"Keep pending invitations separate from project_members so access is granted only after the invite is accepted by the matching authenticated email.",
			},
		],
	},
	{
		key: "team-filters",
		title: "Add filters for Team",
		description:
			"Filter collaborators by role, project, job title, and search query while keeping the Team page consistent with Shiro's reusable filtering patterns.",
		stage: "To Do",
		priority: "medium",
		createdOffset: 0,
		startOffset: 6,
		dueOffset: 10,
		labels: ["Frontend", "UX/UI"],
		assignees: ["current", "maya"],
	},
	{
		key: "bookmark-project",
		title: "Bookmark a project",
		description:
			"Allow users to pin frequently used projects so they can prioritize them in Projects, Dashboard, and search experiences.",
		stage: "Backlog",
		priority: "low",
		createdOffset: 0,
		startOffset: 12,
		dueOffset: 20,
		labels: ["Frontend", "Database"],
		assignees: ["current"],
	},
	{
		key: "copy-project-link",
		title: "Copy a project link",
		description:
			"Add a share action that copies the canonical project URL with clear success feedback and keyboard-accessible interaction.",
		stage: "Backlog",
		priority: "low",
		createdOffset: 0,
		startOffset: 13,
		dueOffset: 20,
		labels: ["Frontend", "Accessibility"],
		assignees: ["current", "maya"],
	},
	{
		key: "project-visibility",
		title: "Add project visibility and anyone-with-link access",
		description:
			"Introduce explicit private/link-visible project access rules, secure read-only share links, visibility controls, and authorization checks for users without project membership.",
		stage: "Backlog",
		priority: "medium",
		createdOffset: 0,
		startOffset: 16,
		dueOffset: 30,
		labels: ["Auth", "Backend", "Database", "UX/UI"],
		assignees: ["current", "avery"],
	},
];

async function main() {
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
			`No database user exists for ${seedUserEmail}. Sign in to Shiro once first so Clerk can synchronize the user.`,
		);
	}

	const projectId = deterministicUuid("project:shiro");

	await db.delete(projects).where(eq(projects.id, projectId));

	const collaboratorRows: NewUser[] = COLLABORATORS.map((person, index) => ({
		id: deterministicUuid(`user:${person.key}`),
		clerkId: `seed_clerk_shiro_${person.key}`,
		email: `shiro.${person.email}`,
		name: person.name,
		imageUrl: null,
		jobTitle: person.jobTitle,
		createdAt: dateFromNow(-34 + index),
		updatedAt: dateFromNow(-2 + index / 10),
	}));

	await db
		.insert(users)
		.values(collaboratorRows)
		.onConflictDoUpdate({
			target: users.id,
			set: {
				name: sql`excluded.name`,
				email: sql`excluded.email`,
				jobTitle: sql`excluded.job_title`,
				updatedAt: sql`excluded.updated_at`,
			},
		});

	const collaboratorIdByKey = new Map<CollaboratorKey, string>();
	for (const [index, collaborator] of COLLABORATORS.entries()) {
		collaboratorIdByKey.set(
			collaborator.key,
			collaboratorRows[index]?.id as string,
		);
	}

	const resolveUserId = (key: AssigneeKey) => {
		if (key === "current") {
			return currentUser.id;
		}

		const id = collaboratorIdByKey.get(key);

		if (!id) {
			throw new Error(`Missing Shiro collaborator ${key}.`);
		}

		return id;
	};

	const projectCreatedAt = dateFromNow(-36, 9);

	await db.insert(projects).values({
		id: projectId,
		ownerId: currentUser.id,
		name: "Shiro",
		description:
			"The project-management capstone itself: architecture, Kanban workflows, collaboration, analytics, notifications, testing, deployment, and the remaining roadmap toward a polished portfolio release.",
		color: "blue",
		startDate: dateFromNow(-36),
		dueDate: dateFromNow(7),
		completedAt: null,
		createdAt: projectCreatedAt,
		updatedAt: dateFromNow(0, 4),
	});

	const memberRows: NewProjectMember[] = COLLABORATORS.map((person, index) => ({
		projectId,
		userId: resolveUserId(person.key),
		role: person.role,
		joinedAt: addMinutes(projectCreatedAt, 180 + index * 60),
	}));
	await db.insert(projectMembers).values(memberRows);

	const stageIdByName = new Map<StageName, string>();
	const stageRows: NewStage[] = SHIRO_STAGES.map((name, index) => {
		const id = deterministicUuid(`stage:shiro:${name}`);
		stageIdByName.set(name, id);

		return {
			id,
			projectId,
			name,
			position: index,
			createdAt: addMinutes(projectCreatedAt, 60 + index * 20),
			updatedAt: addMinutes(projectCreatedAt, 60 + index * 20),
		};
	});
	await db.insert(stages).values(stageRows);

	const labelIdByName = new Map<string, string>();
	const labelRows: NewProjectLabel[] = SHIRO_LABELS.map((label, index) => {
		const id = deterministicUuid(`label:shiro:${label.name}`);
		labelIdByName.set(label.name, id);

		return {
			id,
			projectId,
			name: label.name,
			normalizedName: normalizeLabelName(label.name),
			color: label.color,
			createdAt: addMinutes(projectCreatedAt, 240 + index * 15),
			updatedAt: addMinutes(projectCreatedAt, 240 + index * 15),
		};
	});
	await db.insert(projectLabels).values(labelRows);

	const taskRows: NewTask[] = [];
	const assigneeRows: NewTaskAssignee[] = [];
	const taskLabelRows: NewTaskLabel[] = [];
	const commentRows: NewTaskComment[] = [];
	const activityRows: NewActivityLog[] = [];
	const nextPositionByStage = new Map<string, number>();

	activityRows.push(
		makeActivity("shiro:project-created", {
			projectId,
			taskId: null,
			actorId: currentUser.id,
			action: "project_created",
			metadata: { projectName: "Shiro" },
			createdAt: projectCreatedAt,
		}),
	);

	for (const [index, stage] of stageRows.entries()) {
		activityRows.push(
			makeActivity(`shiro:stage-created:${stage.name}`, {
				projectId,
				taskId: null,
				actorId: currentUser.id,
				action: "stage_created",
				metadata: { stageName: stage.name },
				createdAt: addMinutes(projectCreatedAt, 60 + index * 20),
			}),
		);
	}

	for (const [index, collaborator] of COLLABORATORS.entries()) {
		activityRows.push(
			makeActivity(`shiro:member-added:${collaborator.key}`, {
				projectId,
				taskId: null,
				actorId: currentUser.id,
				action: "member_added",
				metadata: {
					memberName: collaborator.name,
					memberRole: collaborator.role,
				},
				createdAt: addMinutes(projectCreatedAt, 180 + index * 60),
			}),
		);
	}

	for (const blueprint of SHIRO_TASKS) {
		const taskId = deterministicUuid(`task:shiro:${blueprint.key}`);
		const stageId = stageIdByName.get(blueprint.stage);

		if (!stageId) {
			throw new Error(`Missing Shiro stage ${blueprint.stage}.`);
		}

		const position = nextPositionByStage.get(stageId) ?? 0;
		nextPositionByStage.set(stageId, position + 1);

		const createdAt = dateFromNow(blueprint.createdOffset, 9);
		const completedAt =
			typeof blueprint.completedOffset === "number"
				? dateFromNow(blueprint.completedOffset, 16)
				: null;
		const latestCommentOffset = Math.max(
			blueprint.createdOffset,
			...(blueprint.comments?.map((comment) => comment.offset) ?? []),
		);
		const updatedAt = completedAt
			? new Date(
					Math.max(
						completedAt.getTime(),
						dateFromNow(latestCommentOffset, 17).getTime(),
					),
				)
			: dateFromNow(Math.min(0, latestCommentOffset), 17);

		taskRows.push({
			id: taskId,
			stageId,
			title: blueprint.title,
			description: blueprint.description,
			position,
			priority: blueprint.priority,
			startDate:
				blueprint.startOffset === undefined || blueprint.startOffset === null
					? null
					: dateFromNow(blueprint.startOffset),
			dueDate:
				blueprint.dueOffset === undefined || blueprint.dueOffset === null
					? null
					: dateFromNow(blueprint.dueOffset),
			completedAt,
			archivedAt: null,
			createdAt,
			updatedAt,
		});

		activityRows.push(
			makeActivity(`shiro:task-created:${blueprint.key}`, {
				projectId,
				taskId,
				actorId: currentUser.id,
				action: "task_created",
				metadata: {
					taskTitle: blueprint.title,
					stageName: blueprint.stage,
				},
				createdAt,
			}),
		);

		if (blueprint.stage !== "Backlog") {
			activityRows.push(
				makeActivity(`shiro:task-moved:${blueprint.key}`, {
					projectId,
					taskId,
					actorId: currentUser.id,
					action: "task_moved",
					metadata: {
						taskTitle: blueprint.title,
						previousStageName: "Backlog",
						fromStage: "Backlog",
						toStage: blueprint.stage,
						stageName: blueprint.stage,
					},
					createdAt: addMinutes(createdAt, 180),
				}),
			);
		}

		if (completedAt) {
			activityRows.push(
				makeActivity(`shiro:task-completed:${blueprint.key}`, {
					projectId,
					taskId,
					actorId: currentUser.id,
					action: "task_completed",
					metadata: { taskTitle: blueprint.title },
					createdAt: completedAt,
				}),
			);
		}

		for (const [assigneeIndex, assigneeKey] of blueprint.assignees.entries()) {
			const assigneeId = resolveUserId(assigneeKey);
			const assignedAt = addMinutes(createdAt, 45 + assigneeIndex * 20);

			assigneeRows.push({
				taskId,
				userId: assigneeId,
				assignedAt,
			});

			activityRows.push(
				makeActivity(`shiro:assignee-added:${blueprint.key}:${assigneeKey}`, {
					projectId,
					taskId,
					actorId: currentUser.id,
					action: "assignee_added",
					metadata: {
						taskTitle: blueprint.title,
						assigneeName:
							assigneeKey === "current"
								? currentUser.name?.trim() || currentUser.email
								: (COLLABORATORS.find((person) => person.key === assigneeKey)
										?.name ?? "Project member"),
					},
					createdAt: assignedAt,
				}),
			);
		}

		for (const labelName of blueprint.labels) {
			const labelId = labelIdByName.get(labelName);

			if (!labelId) {
				throw new Error(`Missing Shiro label ${labelName}.`);
			}

			taskLabelRows.push({ taskId, labelId });
		}

		if (blueprint.labels[0]) {
			activityRows.push(
				makeActivity(`shiro:label-added:${blueprint.key}`, {
					projectId,
					taskId,
					actorId: currentUser.id,
					action: "label_added",
					metadata: {
						taskTitle: blueprint.title,
						labelName: blueprint.labels[0],
					},
					createdAt: addMinutes(createdAt, 120),
				}),
			);
		}

		for (const [commentIndex, comment] of (
			blueprint.comments ?? []
		).entries()) {
			const authorId = resolveUserId(comment.author);
			const commentCreatedAt = dateFromNow(comment.offset, 15);

			commentRows.push({
				id: deterministicUuid(`comment:shiro:${blueprint.key}:${commentIndex}`),
				taskId,
				authorId,
				content: comment.content,
				createdAt: commentCreatedAt,
				updatedAt: commentCreatedAt,
			});

			activityRows.push(
				makeActivity(`shiro:comment-added:${blueprint.key}:${commentIndex}`, {
					projectId,
					taskId,
					actorId: authorId,
					action: "comment_added",
					metadata: { taskTitle: blueprint.title },
					createdAt: commentCreatedAt,
				}),
			);
		}
	}

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

	activityRows.push(
		makeActivity("shiro:project-updated:current", {
			projectId,
			taskId: null,
			actorId: currentUser.id,
			action: "project_updated",
			metadata: {
				projectName: "Shiro",
				changedFields: "roadmap, testing, deployment",
			},
			createdAt: dateFromNow(0, 4),
		}),
	);

	await db.insert(activityLogs).values(activityRows);

	console.log("\nShiro project seed complete.\n");
	console.table({
		Project: "Shiro",
		Stages: stageRows.length,
		Tasks: taskRows.length,
		"Completed tasks": taskRows.filter((task) => task.completedAt).length,
		"Open tasks": taskRows.filter((task) => !task.completedAt).length,
		Labels: labelRows.length,
		Collaborators: memberRows.length,
		Assignments: assigneeRows.length,
		Comments: commentRows.length,
		"Activity logs": activityRows.length,
	});
}

main().catch((error) => {
	console.error("\nShiro project seed failed:\n", error);
	process.exitCode = 1;
});
