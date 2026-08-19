ALTER TABLE "projects" ADD COLUMN "color" text DEFAULT 'cyan' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "start_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "start_date" timestamp with time zone;