import type {
	NotificationMetadataByType,
	NotificationType,
} from "@/lib/constants/notifications";
import type { UserSummary } from "@/types/user";

export type NotificationItemOf<T extends NotificationType> = {
	id: string;
	type: T;

	actor: UserSummary | null;

	projectId: string | null;
	taskId: string | null;

	metadata: NotificationMetadataByType[T];

	readAt: string | null;
	createdAt: string;
};

export type NotificationItem = {
	[T in NotificationType]: NotificationItemOf<T>;
}[NotificationType];

export type NotificationCenterData = {
	items: NotificationItem[];
	unreadCount: number;
};
