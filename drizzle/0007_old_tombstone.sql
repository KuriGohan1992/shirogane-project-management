ALTER TABLE "projects" RENAME COLUMN "closed_at" TO "completed_at";--> statement-breakpoint
DROP INDEX "projects_closed_at_idx";--> statement-breakpoint
CREATE INDEX "projects_completed_at_idx" ON "projects" USING btree ("completed_at");