"use server";

import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import {
	getNotificationCenterDataForUser,
	markAllNotificationsReadForUser,
	markNotificationReadForUser,
} from "@/lib/db/notifications";
import { notificationIdSchema } from "@/lib/validations/notification";
import type { NotificationCenterData } from "@/types/notification";

const NOTIFICATION_LIMIT = 30;

export async function loadNotificationsAction(): Promise<NotificationCenterData> {
	const user = await getCurrentDatabaseUser();

	return getNotificationCenterDataForUser(user.id, NOTIFICATION_LIMIT);
}

export async function markNotificationReadAction(
	notificationId: string,
): Promise<NotificationCenterData> {
	const result = notificationIdSchema.safeParse(notificationId);

	if (!result.success) {
		throw new Error("The selected notification is invalid.");
	}

	const user = await getCurrentDatabaseUser();

	await markNotificationReadForUser(result.data, user.id);

	return getNotificationCenterDataForUser(user.id, NOTIFICATION_LIMIT);
}

export async function markAllNotificationsReadAction(): Promise<NotificationCenterData> {
	const user = await getCurrentDatabaseUser();

	await markAllNotificationsReadForUser(user.id);

	return getNotificationCenterDataForUser(user.id, NOTIFICATION_LIMIT);
}
