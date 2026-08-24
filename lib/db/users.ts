import "server-only";

import { eq, inArray } from "drizzle-orm";

import type { NotificationPreferences } from "@/lib/constants/notifications";
import { db } from "@/lib/db";
import { type User, users } from "@/lib/db/schema";

export type SyncUserInput = {
	clerkId: string;
	email: string;
	name: string | null;
	imageUrl: string | null;
};

export type UpdateUserProfileInput = {
	name: string;
	jobTitle: string | null;
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

export async function updateUserProfile(
	userId: string,
	input: UpdateUserProfileInput,
) {
	const [user] = await db
		.update(users)
		.set({
			name: input.name,
			jobTitle: input.jobTitle,
			updatedAt: new Date(),
		})
		.where(eq(users.id, userId))
		.returning();

	return user;
}

export async function updateNotificationPreferencesForUser(
	userId: string,
	preferences: NotificationPreferences,
) {
	const [user] = await db
		.update(users)
		.set({
			notificationsMuted: preferences.notificationsMuted,
			mutedNotificationCategories: preferences.mutedCategories,
			updatedAt: new Date(),
		})
		.where(eq(users.id, userId))
		.returning({
			id: users.id,
		});

	return user;
}

export async function getNotificationPreferencesForUsers(userIds: string[]) {
	const uniqueUserIds = [...new Set(userIds)];

	if (uniqueUserIds.length === 0) {
		return new Map<string, NotificationPreferences>();
	}

	const rows = await db
		.select({
			id: users.id,
			notificationsMuted: users.notificationsMuted,
			mutedCategories: users.mutedNotificationCategories,
		})
		.from(users)
		.where(inArray(users.id, uniqueUserIds));

	return new Map<string, NotificationPreferences>(
		rows.map((row) => [
			row.id,
			{
				notificationsMuted: row.notificationsMuted,
				mutedCategories: row.mutedCategories,
			},
		]),
	);
}
