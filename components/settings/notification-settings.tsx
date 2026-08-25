"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";

import { Switch } from "@/components/ui/switch";
import { updateNotificationSettings } from "@/lib/actions/settings";
import type {
	NotificationCategory,
	NotificationPreferences,
} from "@/lib/constants/notifications";
import { cn } from "@/lib/utils";
import type { SettingsMutationResult } from "@/types/settings";

const CATEGORY_OPTIONS = [
	{
		value: "project_access",
		label: "Project access",
	},
	{
		value: "assignments",
		label: "Assignments",
	},
	{
		value: "comments",
		label: "Comments",
	},
	{
		value: "deadlines",
		label: "Due reminders",
	},
] as const satisfies ReadonlyArray<{
	value: NotificationCategory;
	label: string;
}>;

type NotificationSettingsProps = {
	initialPreferences: NotificationPreferences;
};

export function NotificationSettings({
	initialPreferences,
}: NotificationSettingsProps) {
	const [confirmedPreferences, setConfirmedPreferences] =
		useState(initialPreferences);

	const [optimisticPreferences, setOptimisticPreferences] = useOptimistic(
		confirmedPreferences,
		(
			_currentPreferences: NotificationPreferences,
			nextPreferences: NotificationPreferences,
		) => nextPreferences,
	);

	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	}>();

	const [, startTransition] = useTransition();

	const latestPreferencesRef =
		useRef<NotificationPreferences>(initialPreferences);

	const confirmedPreferencesRef =
		useRef<NotificationPreferences>(initialPreferences);

	const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

	const changeVersionRef = useRef(0);

	function enqueueSave(
		nextPreferences: NotificationPreferences,
	): Promise<SettingsMutationResult> {
		const savePromise = saveQueueRef.current.then(() =>
			updateNotificationSettings(nextPreferences),
		);

		saveQueueRef.current = savePromise.then(
			() => undefined,
			() => undefined,
		);

		return savePromise;
	}

	function updatePreferences(nextPreferences: NotificationPreferences) {
		const version = ++changeVersionRef.current;

		latestPreferencesRef.current = nextPreferences;
		setFeedback(undefined);

		startTransition(async () => {
			setOptimisticPreferences(nextPreferences);

			try {
				const result = await enqueueSave(nextPreferences);

				if (!result.success) {
					if (version === changeVersionRef.current) {
						latestPreferencesRef.current = confirmedPreferencesRef.current;
					}

					setFeedback({
						type: "error",
						message:
							result.message ?? "Notification preferences could not be saved.",
					});

					return;
				}

				confirmedPreferencesRef.current = nextPreferences;
				setConfirmedPreferences(nextPreferences);

				if (version === changeVersionRef.current) {
					setFeedback({
						type: "success",
						message: "Notification settings updated.",
					});
				}
			} catch (error) {
				console.error("Failed to save notification preferences:", error);

				if (version === changeVersionRef.current) {
					latestPreferencesRef.current = confirmedPreferencesRef.current;
				}

				setFeedback({
					type: "error",
					message: "Notification preferences could not be saved.",
				});
			}
		});
	}

	function setNotificationsMuted(checked: boolean) {
		updatePreferences({
			...latestPreferencesRef.current,
			notificationsMuted: checked,
		});
	}

	function setCategoryEnabled(
		category: NotificationCategory,
		enabled: boolean,
	) {
		const currentPreferences = latestPreferencesRef.current;

		updatePreferences({
			...currentPreferences,

			mutedCategories: enabled
				? currentPreferences.mutedCategories.filter(
						(value) => value !== category,
					)
				: [
						...currentPreferences.mutedCategories.filter(
							(value) => value !== category,
						),
						category,
					],
		});
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex-1 divide-y divide-border sm:grid sm:grid-rows-5">
				<div className="flex min-h-12 items-center justify-between gap-4 py-3 sm:min-h-0 sm:gap-6 sm:py-0">
					<p className="text-sm font-bold text-foreground">
						Mute all notifications
					</p>

					<Switch
						checked={optimisticPreferences.notificationsMuted}
						aria-label="Mute all notifications"
						onCheckedChange={setNotificationsMuted}
					/>
				</div>

				{CATEGORY_OPTIONS.map((option) => {
					const enabled = !optimisticPreferences.mutedCategories.includes(
						option.value,
					);

					return (
						<div
							key={option.value}
							className="flex min-h-12 items-center justify-between gap-4 py-3 sm:min-h-0 sm:gap-6 sm:py-0"
						>
							<p
								className={cn(
									"text-sm font-medium transition-colors",
									optimisticPreferences.notificationsMuted
										? "text-muted-foreground"
										: "text-foreground",
								)}
							>
								{option.label}
							</p>

							<Switch
								checked={enabled}
								disabled={optimisticPreferences.notificationsMuted}
								aria-label={`${option.label} notifications`}
								onCheckedChange={(checked) =>
									setCategoryEnabled(option.value, checked)
								}
							/>
						</div>
					);
				})}
			</div>

			<div className="flex min-h-9 items-center border-t border-border pt-3 sm:min-h-8">
				{feedback && (
					<p
						aria-live="polite"
						className={cn(
							"truncate text-xs",
							feedback.type === "success"
								? "text-emerald-600 dark:text-emerald-400"
								: "text-destructive",
						)}
					>
						{feedback.message}
					</p>
				)}
			</div>
		</div>
	);
}
