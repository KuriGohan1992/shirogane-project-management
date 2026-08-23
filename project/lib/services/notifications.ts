import "server-only";

import type { AnyCreateNotificationInput } from "@/lib/constants/notifications";
import { createNotificationRecords } from "@/lib/db/notifications";

export async function createNotificationsSafely(
	inputs: AnyCreateNotificationInput[],
) {
	/*
	 * Never notify somebody about an action they
	 * performed on themselves.
	 */
	const filteredInputs = inputs.filter(
		(input) => !input.actorId || input.actorId !== input.recipientId,
	);

	if (filteredInputs.length === 0) {
		return [];
	}

	try {
		return await createNotificationRecords(filteredInputs);
	} catch (error) {
		/*
		 * Notification delivery is secondary to the
		 * actual project/task mutation.
		 */
		console.error("Failed to create notification records:", error);

		return [];
	}
}
