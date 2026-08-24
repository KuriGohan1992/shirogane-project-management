import type { User } from "@/lib/db/schema";

export type UserSummary = Pick<User, "id" | "name" | "email" | "imageUrl">;

export type UserProfileSummary = UserSummary & Pick<User, "jobTitle">;
