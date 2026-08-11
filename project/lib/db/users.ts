import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { type User, users } from "@/lib/db/schema";

export type SyncUserInput = {
	clerkId: string;
	email: string;
	name: string | null;
	imageUrl: string | null;
};

export async function getUserByClerkId(
	clerkId: string,
): Promise<User | undefined> {
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.clerkId, clerkId))
		.limit(1);

	return user;
}

export async function upsertUser(input: SyncUserInput): Promise<User> {
	const [user] = await db
		.insert(users)
		.values(input)
		.onConflictDoUpdate({
			target: users.clerkId,
			set: {
				email: input.email,
				name: input.name,
				imageUrl: input.imageUrl,
				updatedAt: new Date(),
			},
		})
		.returning();

	if (!user) {
		throw new Error("Failed to synchronize user with the database.");
	}

	return user;
}
