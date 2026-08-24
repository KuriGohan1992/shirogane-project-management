import "server-only";

import type { AnyCreateNotificationInput } from "@/lib/constants/notifications";
import { createNotificationRecords } from "@/lib/db/notifications";
import { getNotificationPreferencesForUsers } from "@/lib/db/users";
import { isNotificationAllowed } from "@/lib/notifications";

export async function createNotificationsSafely(
	inputs: AnyCreateNotificationInput[],
) {
	const targetedInputs = inputs.filter(
		(input) => !input.actorId || input.actorId !== input.recipientId,
	);

	if (targetedInputs.length === 0) {
		return [];
	}

	try {
		const preferencesByUserId = await getNotificationPreferencesForUsers(
			targetedInputs.map((input) => input.recipientId),
		);

		const allowedInputs = targetedInputs.filter((input) =>
			isNotificationAllowed(
				preferencesByUserId.get(input.recipientId),
				input.type,
			),
		);

		if (allowedInputs.length === 0) {
			return [];
		}

		return await createNotificationRecords(allowedInputs);
	} catch (error) {
		console.error("Failed to create notification records:", error);

		return [];
	}
}
