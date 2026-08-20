import { relations } from "drizzle-orm";
import {
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import type {
	TaskActivityAction,
	TaskActivityMetadata,
} from "@/lib/constants/activity";
import type { ColorValue } from "@/lib/constants/colors";
import { DEFAULT_COLOR } from "@/lib/constants/colors";

import { PROJECT_MEMBER_ROLE_VALUES } from "@/lib/constants/project-roles";

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

// Shared creation and update timestamps.
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

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),

	clerkId: text("clerk_id").notNull().unique(),

	email: text("email").notNull().unique(),

	name: text("name"),

	imageUrl: text("image_url"),

	...timestamps,
});

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

		color: text("color").$type<ColorValue>().default(DEFAULT_COLOR).notNull(),

		startDate: timestamp("start_date", {
			withTimezone: true,
			mode: "date",
		}),

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

export const projectLabels = pgTable(
	"project_labels",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, {
				onDelete: "cascade",
			}),

		name: text("name").notNull(),

		normalizedName: text("normalized_name").notNull(),

		color: text("color").$type<ColorValue>().default(DEFAULT_COLOR).notNull(),

		...timestamps,
	},
	(table) => [
		uniqueIndex("project_labels_project_name_unique").on(
			table.projectId,
			table.normalizedName,
		),

		index("project_labels_project_id_idx").on(table.projectId),
	],
);

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

		startDate: timestamp("start_date", {
			withTimezone: true,
			mode: "date",
		}),

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

export const taskLabels = pgTable(
	"task_labels",
	{
		taskId: uuid("task_id")
			.notNull()
			.references(() => tasks.id, {
				onDelete: "cascade",
			}),

		labelId: uuid("label_id")
			.notNull()
			.references(() => projectLabels.id, {
				onDelete: "cascade",
			}),
	},
	(table) => [
		primaryKey({
			columns: [table.taskId, table.labelId],
		}),

		index("task_labels_label_id_idx").on(table.labelId),
	],
);

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

export const activityLogs = pgTable(
	"activity_logs",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, {
				onDelete: "cascade",
			}),

		taskId: uuid("task_id").references(() => tasks.id, {
			onDelete: "set null",
		}),

		actorId: uuid("actor_id").references(() => users.id, {
			onDelete: "set null",
		}),

		action: text("action").$type<TaskActivityAction>().notNull(),

		metadata: jsonb("metadata").$type<TaskActivityMetadata>().notNull(),

		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "date",
		})
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("activity_logs_project_created_at_idx").on(
			table.projectId,
			table.createdAt,
		),

		index("activity_logs_task_created_at_idx").on(
			table.taskId,
			table.createdAt,
		),

		index("activity_logs_actor_id_idx").on(table.actorId),
	],
);

export const usersRelations = relations(users, ({ many }) => ({
	ownedProjects: many(projects),

	projectMemberships: many(projectMembers),

	taskAssignments: many(taskAssignees),

	taskComments: many(taskComments),

	activities: many(activityLogs),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
	owner: one(users, {
		fields: [projects.ownerId],
		references: [users.id],
	}),

	members: many(projectMembers),

	labels: many(projectLabels),

	stages: many(stages),

	activities: many(activityLogs),
}));

export const projectLabelsRelations = relations(
	projectLabels,
	({ one, many }) => ({
		project: one(projects, {
			fields: [projectLabels.projectId],
			references: [projects.id],
		}),

		tasks: many(taskLabels),
	}),
);

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

	labels: many(taskLabels),

	comments: many(taskComments),

	activities: many(activityLogs),
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

export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
	task: one(tasks, {
		fields: [taskLabels.taskId],
		references: [tasks.id],
	}),

	label: one(projectLabels, {
		fields: [taskLabels.labelId],
		references: [projectLabels.id],
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

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
	project: one(projects, {
		fields: [activityLogs.projectId],
		references: [projects.id],
	}),

	task: one(tasks, {
		fields: [activityLogs.taskId],
		references: [tasks.id],
	}),

	actor: one(users, {
		fields: [activityLogs.actorId],
		references: [users.id],
	}),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type ProjectLabel = typeof projectLabels.$inferSelect;
export type NewProjectLabel = typeof projectLabels.$inferInsert;

export type ProjectMember = typeof projectMembers.$inferSelect;
export type NewProjectMember = typeof projectMembers.$inferInsert;

export type Stage = typeof stages.$inferSelect;
export type NewStage = typeof stages.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type TaskAssignee = typeof taskAssignees.$inferSelect;
export type NewTaskAssignee = typeof taskAssignees.$inferInsert;

export type TaskLabel = typeof taskLabels.$inferSelect;
export type NewTaskLabel = typeof taskLabels.$inferInsert;

export type TaskComment = typeof taskComments.$inferSelect;
export type NewTaskComment = typeof taskComments.$inferInsert;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
