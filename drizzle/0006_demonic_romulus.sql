ALTER TABLE "projects" ADD COLUMN "closed_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "projects_closed_at_idx" ON "projects" USING btree ("closed_at");