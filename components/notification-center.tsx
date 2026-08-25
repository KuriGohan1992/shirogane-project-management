"use client";

import { formatDistanceToNow } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
	Bell,
	BellRing,
	CalendarClock,
	Check,
	MessageSquare,
	Minus,
	ShieldCheck,
	UserMinus,
	UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	loadNotificationsAction,
	loadUnreadNotificationCountAction,
	markAllNotificationsReadAction,
	markNotificationReadAction,
} from "@/lib/actions/notifications";
import type { NotificationType } from "@/lib/constants/notifications";
import {
	getNotificationCategory,
	getNotificationHref,
	getNotificationMessage,
} from "@/lib/notification-display";
import { cn } from "@/lib/utils";
import type {
	NotificationCenterData,
	NotificationItem,
} from "@/types/notification";

const POLL_INTERVAL_MS = 30_000;

const NOTIFICATION_ICONS: Record<NotificationType, LucideIcon> = {
	project_member_added: UserPlus,
	project_member_removed: UserMinus,
	project_member_role_changed: ShieldCheck,

	task_assigned: Check,
	task_unassigned: Minus,

	tasks_assigned: Check,
	tasks_unassigned: Minus,

	task_comment_added: MessageSquare,

	task_due_soon: CalendarClock,
};

type NotificationCenterProps = {
	initialUnreadCount: number;
};

export function NotificationCenter({
	initialUnreadCount,
}: NotificationCenterProps) {
	const router = useRouter();

	const [open, setOpen] = useState(false);

	const [data, setData] = useState<NotificationCenterData>({
		items: [],
		unreadCount: initialUnreadCount,
	});

	const [hasLoadedItems, setHasLoadedItems] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const itemsRefreshingRef = useRef(false);
	const countRefreshingRef = useRef(false);

	const refreshItems = useCallback(() => {
		if (itemsRefreshingRef.current) {
			return;
		}

		itemsRefreshingRef.current = true;

		startTransition(async () => {
			try {
				const nextData = await loadNotificationsAction();

				setData(nextData);
				setHasLoadedItems(true);
				setError(null);
			} catch (refreshError) {
				console.error("Failed to refresh notifications:", refreshError);

				setError("Notifications could not be refreshed.");
			} finally {
				itemsRefreshingRef.current = false;
			}
		});
	}, []);

	const refreshCount = useCallback(() => {
		if (countRefreshingRef.current) {
			return;
		}

		countRefreshingRef.current = true;

		startTransition(async () => {
			try {
				const unreadCount = await loadUnreadNotificationCountAction();

				setData((current) => ({
					...current,
					unreadCount,
				}));
			} catch (refreshError) {
				console.error("Failed to refresh notification count:", refreshError);
			} finally {
				countRefreshingRef.current = false;
			}
		});
	}, []);

	useEffect(() => {
		const refreshVisibleNotifications = () => {
			if (document.visibilityState !== "visible") {
				return;
			}

			if (open) {
				refreshItems();
			} else {
				refreshCount();
			}
		};

		const interval = window.setInterval(
			refreshVisibleNotifications,
			POLL_INTERVAL_MS,
		);

		document.addEventListener("visibilitychange", refreshVisibleNotifications);

		return () => {
			window.clearInterval(interval);

			document.removeEventListener(
				"visibilitychange",
				refreshVisibleNotifications,
			);
		};
	}, [open, refreshCount, refreshItems]);

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);

		if (nextOpen) {
			refreshItems();
		}
	}

	function markReadOptimistically(notificationId: string) {
		const markedAt = new Date().toISOString();

		setData((current) => {
			const target = current.items.find((item) => item.id === notificationId);

			if (!target || target.readAt) {
				return current;
			}

			return {
				items: current.items.map((item) =>
					item.id === notificationId
						? {
								...item,
								readAt: markedAt,
							}
						: item,
				),

				unreadCount: Math.max(0, current.unreadCount - 1),
			};
		});
	}

	function handleNotificationClick(notification: NotificationItem) {
		const href = getNotificationHref(notification);

		if (!notification.readAt) {
			markReadOptimistically(notification.id);

			startTransition(async () => {
				try {
					const nextData = await markNotificationReadAction(notification.id);

					setData(nextData);
					setHasLoadedItems(true);
					setError(null);
				} catch (readError) {
					console.error("Failed to mark notification as read:", readError);

					refreshItems();
				}
			});
		}

		if (href) {
			setOpen(false);

			router.push(href);
		}
	}

	function handleMarkAllRead() {
		if (data.unreadCount === 0) {
			return;
		}

		const markedAt = new Date().toISOString();

		setData((current) => ({
			items: current.items.map((item) => ({
				...item,
				readAt: item.readAt ?? markedAt,
			})),

			unreadCount: 0,
		}));

		startTransition(async () => {
			try {
				const nextData = await markAllNotificationsReadAction();

				setData(nextData);
				setHasLoadedItems(true);
				setError(null);
			} catch (markError) {
				console.error("Failed to mark all notifications as read:", markError);

				setError("Notifications could not be marked as read.");

				refreshItems();
			}
		});
	}

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label={
						data.unreadCount > 0
							? `Notifications, ${data.unreadCount} unread`
							: "Notifications"
					}
					className="group relative inline-flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<Bell
						aria-hidden="true"
						size={19}
						className="transition-transform duration-150 group-hover:scale-110"
					/>

					{data.unreadCount > 0 && (
						<span
							aria-hidden="true"
							className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-card"
						/>
					)}
				</button>
			</PopoverTrigger>

			<PopoverContent
				align="end"
				sideOffset={8}
				className="w-[min(25rem,calc(100vw-2rem))] overflow-hidden p-0"
			>
				<div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
					<div className="flex items-center gap-2">
						<h2 className="font-semibold text-foreground">Notifications</h2>

						{data.unreadCount > 0 && (
							<span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
								{data.unreadCount}
							</span>
						)}
					</div>

					{data.unreadCount > 0 && hasLoadedItems && (
						<button
							type="button"
							disabled={isPending}
							onClick={handleMarkAllRead}
							className="text-xs font-semibold text-primary transition-opacity hover:underline disabled:opacity-50"
						>
							Mark all read
						</button>
					)}
				</div>

				{error && (
					<p className="border-b border-border bg-destructive/5 px-4 py-2 text-xs text-destructive">
						{error}
					</p>
				)}

				{!hasLoadedItems ? (
					<div className="px-6 py-10 text-center text-sm text-muted-foreground">
						Loading notifications...
					</div>
				) : data.items.length === 0 ? (
					<div className="px-6 py-10 text-center">
						<BellRing
							aria-hidden="true"
							className="mx-auto size-7 text-muted-foreground"
						/>

						<p className="mt-3 text-sm font-semibold text-foreground">
							You're all caught up
						</p>

						<p className="mt-1 text-xs text-muted-foreground">
							New project and task activity will appear here.
						</p>
					</div>
				) : (
					<div className="scrollbar-thin max-h-[28rem] divide-y divide-border overflow-y-auto overscroll-contain">
						{data.items.map((notification) => {
							const Icon = NOTIFICATION_ICONS[notification.type];

							const unread = notification.readAt === null;

							return (
								<button
									key={notification.id}
									type="button"
									onClick={() => handleNotificationClick(notification)}
									className={cn(
										"relative flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",

										unread && "bg-primary/[0.04]",
									)}
								>
									<span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
										<Icon aria-hidden="true" className="size-4" />
									</span>

									<span className="min-w-0 flex-1 pr-4">
										<span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
											{getNotificationCategory(notification)}
										</span>

										<span
											className={cn(
												"mt-0.5 block text-sm leading-5 text-foreground",

												unread && "font-medium",
											)}
										>
											{getNotificationMessage(notification)}
										</span>

										<time
											dateTime={notification.createdAt}
											title={new Date(notification.createdAt).toLocaleString()}
											className="mt-1 block text-xs text-muted-foreground"
										>
											{formatDistanceToNow(new Date(notification.createdAt), {
												addSuffix: true,
											})}
										</time>
									</span>

									{unread && (
										<span
											aria-hidden="true"
											className="absolute right-4 top-4 size-2 rounded-full bg-primary"
										/>
									)}
								</button>
							);
						})}
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
