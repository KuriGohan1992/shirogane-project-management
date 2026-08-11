import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { getUserByClerkId, upsertUser } from "@/lib/db/users";

export async function getCurrentDatabaseUser() {
	const { userId: clerkId } = await auth.protect();

	const existingUser = await getUserByClerkId(clerkId);

	if (existingUser) {
		return existingUser;
	}

	const clerkUser = await currentUser();

	if (!clerkUser) {
		throw new Error("Authenticated Clerk user could not be loaded.");
	}

	const email = clerkUser.primaryEmailAddress?.emailAddress;

	if (!email) {
		throw new Error("Clerk user does not have a primary email address.");
	}

	const name =
		[clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

	return upsertUser({
		clerkId,
		email,
		name,
		imageUrl: clerkUser.imageUrl ?? null,
	});
}
