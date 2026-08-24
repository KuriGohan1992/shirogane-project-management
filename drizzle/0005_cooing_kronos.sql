ALTER TABLE "tasks" ALTER COLUMN "priority" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "priority" DROP NOT NULL;