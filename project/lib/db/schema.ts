import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { PROJECT_MEMBER_ROLE_VALUES } from "../constants/project-roles";

/*
 * Enumerations
 *
 * PostgreSQL enums restrict a column to a predefined set of values.
 */

export const projectMemberRoleEnum = pgEnum(
	"project_member_role",
	PROJECT_MEMBER_ROLE_VALUES,
);

export const taskPriorityEnum = pgEnum("task_priority", [
	"low",
	"medium",
	"high",
	"urgent",
]);

/*
 * Reusable timestamp columns
 *
 * createdAt records when a row is first inserted.
 * updatedAt starts with the same value, but our update operations must
 * explicitly change it whenever the row is edited.
 */

const timestamps = {
	createdAt: timestamp("created_at", {
		withTimezone: true,
		mode: "date",
	})
		.defaultNow()
		.notNull(),

	updatedAt: timestamp("updated_at", {
		withTimezone: true,
		mode: "date",
	})
		.defaultNow()
		.notNull(),
};

/*
 * Users
 *
 * Clerk remains responsible for authentication, passwords, sessions,
 * email verification, and Google login.
 *
 * This table stores the user information Shiro needs for its own
 * projects, memberships, assignments, and database relationships.
 */

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),

	clerkId: text("clerk_id").notNull().unique(),

	email: text("email").notNull().unique(),

	name: text("name"),

	imageUrl: text("image_url"),

	...timestamps,
});

/*
 * Projects
 *
 * Every project has exactly one owner.
 * Other collaborators are stored in projectMembers.
 */

export const projects = pgTable(
	"projects",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		ownerId: uuid("owner_id")
			.notNull()
			.references(() => users.id, {
				onDelete: "cascade",
			}),

		name: text("name").notNull(),

		description: text("description"),

		dueDate: timestamp("due_date", {
			withTimezone: true,
			mode: "date",
		}),

		...timestamps,
	},
	(table) => [
		index("projects_owner_id_idx").on(table.ownerId),
		index("projects_created_at_idx").on(table.createdAt),
	],
);

/*
 * Project members
 *
 * This is a junction table connecting users and projects.
 *
 * One project can have many users.
 * One user can belong to many projects.
 *
 * The project owner is stored in projects.ownerId and is not duplicated
 * here. This table is for invited collaborators.
 */

export const projectMembers = pgTable(
	"project_members",
	{
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, {
				onDelete: "cascade",
			}),

		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, {
				onDelete: "cascade",
			}),

		role: projectMemberRoleEnum("role").default("member").notNull(),

		joinedAt: timestamp("joined_at", {
			withTimezone: true,
			mode: "date",
		})
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.projectId, table.userId],
		}),

		index("project_members_user_id_idx").on(table.userId),
	],
);

/*
 * Stages
 *
 * User-managed Kanban columns belonging to a project.
 *
 * New projects currently start with:
 * Backlog, To Do, In Progress, and Done.
 *
 * Users can add, rename, delete, and reorder stages.
 */

export const stages = pgTable(
	"stages",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, {
				onDelete: "cascade",
			}),

		name: text("name").notNull(),

		position: integer("position").notNull(),

		...timestamps,
	},
	(table) => [
		index("stages_project_position_idx").on(table.projectId, table.position),
	],
);

/*
 * Tasks
 *
 * A task belongs to a stage.
 *
 * Its stage represents its current Kanban status, so there is deliberately
 * no separate status column.
 */

export const tasks = pgTable(
	"tasks",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		stageId: uuid("stage_id")
			.notNull()
			.references(() => stages.id, {
				onDelete: "cascade",
			}),

		title: text("title").notNull(),

		description: text("description"),

		position: integer("position").notNull(),

		priority: taskPriorityEnum("priority").default("medium").notNull(),

		dueDate: timestamp("due_date", {
			withTimezone: true,
			mode: "date",
		}),

		archivedAt: timestamp("archived_at", {
			withTimezone: true,
			mode: "date",
		}),

		...timestamps,
	},
	(table) => [
		index("tasks_stage_position_idx").on(table.stageId, table.position),

		index("tasks_due_date_idx").on(table.dueDate),
	],
);

export const taskAssignees = pgTable(
	"task_assignees",
	{
		taskId: uuid("task_id")
			.notNull()
			.references(() => tasks.id, {
				onDelete: "cascade",
			}),

		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, {
				onDelete: "cascade",
			}),

		assignedAt: timestamp("assigned_at", {
			withTimezone: true,
			mode: "date",
		})
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.taskId, table.userId],
		}),

		index("task_assignees_user_id_idx").on(table.userId),
	],
);

/*
 * Task comments
 *
 * Comments belong to a task and record the Shiro user who authored them.
 * Deleting a task also deletes its comments.
 */

export const taskComments = pgTable(
	"task_comments",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		taskId: uuid("task_id")
			.notNull()
			.references(() => tasks.id, {
				onDelete: "cascade",
			}),

		authorId: uuid("author_id")
			.notNull()
			.references(() => users.id, {
				onDelete: "cascade",
			}),

		content: text("content").notNull(),

		...timestamps,
	},
	(table) => [
		index("task_comments_task_created_at_idx").on(
			table.taskId,
			table.createdAt,
		),

		index("task_comments_author_id_idx").on(table.authorId),
	],
);

/*
 * Drizzle relational-query definitions
 *
 * Foreign keys protect the actual PostgreSQL data.
 * These relation objects teach Drizzle how tables connect when using
 * db.query.* with nested "with" queries.
 */

export const usersRelations = relations(users, ({ many }) => ({
	ownedProjects: many(projects),
	projectMemberships: many(projectMembers),
	taskAssignments: many(taskAssignees),
	taskComments: many(taskComments),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
	owner: one(users, {
		fields: [projects.ownerId],
		references: [users.id],
	}),

	members: many(projectMembers),

	stages: many(stages),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
	project: one(projects, {
		fields: [projectMembers.projectId],
		references: [projects.id],
	}),

	user: one(users, {
		fields: [projectMembers.userId],
		references: [users.id],
	}),
}));

export const stagesRelations = relations(stages, ({ one, many }) => ({
	project: one(projects, {
		fields: [stages.projectId],
		references: [projects.id],
	}),

	tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
	stage: one(stages, {
		fields: [tasks.stageId],
		references: [stages.id],
	}),

	assignees: many(taskAssignees),

	comments: many(taskComments),
}));

export const taskAssigneesRelations = relations(taskAssignees, ({ one }) => ({
	task: one(tasks, {
		fields: [taskAssignees.taskId],
		references: [tasks.id],
	}),

	user: one(users, {
		fields: [taskAssignees.userId],
		references: [users.id],
	}),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
	task: one(tasks, {
		fields: [taskComments.taskId],
		references: [tasks.id],
	}),

	author: one(users, {
		fields: [taskComments.authorId],
		references: [users.id],
	}),
}));

/*
 * Inferred TypeScript types
 *
 * Select types represent rows returned by PostgreSQL.
 * Insert types represent values accepted when inserting rows.
 */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type ProjectMember = typeof projectMembers.$inferSelect;
export type NewProjectMember = typeof projectMembers.$inferInsert;

export type Stage = typeof stages.$inferSelect;
export type NewStage = typeof stages.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type TaskAssignee = typeof taskAssignees.$inferSelect;
export type NewTaskAssignee = typeof taskAssignees.$inferInsert;

export type TaskComment = typeof taskComments.$inferSelect;
export type NewTaskComment = typeof taskComments.$inferInsert;
