import {
	NOTIFICATION_CATEGORY_BY_TYPE,
	type NotificationPreferences,
	type NotificationType,
} from "@/lib/constants/notifications";

export function isNotificationAllowed(
	preferences: NotificationPreferences | undefined,
	type: NotificationType,
) {
	if (!preferences) {
		return true;
	}

	if (preferences.notificationsMuted) {
		return false;
	}

	return !preferences.mutedCategories.includes(
		NOTIFICATION_CATEGORY_BY_TYPE[type],
	);
}
