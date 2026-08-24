"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import type { NotificationPreferences } from "@/lib/constants/notifications";
import {
	updateNotificationPreferencesForUser,
	updateUserProfile,
} from "@/lib/db/users";
import {
	notificationPreferencesSchema,
	profileSettingsSchema,
} from "@/lib/validations/user";
import type {
	ProfileSettingsActionState,
	SettingsMutationResult,
} from "@/types/settings";

export async function updateProfileSettings(
	_previousState: ProfileSettingsActionState,
	formData: FormData,
): Promise<ProfileSettingsActionState> {
	const result = profileSettingsSchema.safeParse({
		firstName: formData.get("firstName"),
		lastName: formData.get("lastName"),
		jobTitle: formData.get("jobTitle"),
	});

	if (!result.success) {
		return {
			success: false,
			errors: z.flattenError(result.error).fieldErrors,
		};
	}

	try {
		const user = await getCurrentDatabaseUser();
		const { firstName, lastName, jobTitle } = result.data;

		const clerk = await clerkClient();

		await clerk.users.updateUser(user.clerkId, {
			firstName,
			lastName,
		});

		const updatedUser = await updateUserProfile(user.id, {
			name: [firstName, lastName].filter(Boolean).join(" "),
			jobTitle,
		});

		if (!updatedUser) {
			return {
				success: false,
				message: "Your profile could not be saved.",
			};
		}

		revalidatePath("/settings");
		revalidatePath("/team");
		revalidatePath("/projects");
		revalidatePath("/dashboard");

		return {
			success: true,
			message: "Profile updated.",
		};
	} catch (error) {
		console.error("Failed to update profile settings:", error);

		return {
			success: false,
			message: "Something went wrong while updating your profile.",
		};
	}
}

export async function updateNotificationSettings(
	preferences: NotificationPreferences,
): Promise<SettingsMutationResult> {
	const result = notificationPreferencesSchema.safeParse(preferences);

	if (!result.success) {
		return {
			success: false,
			message: "The notification preferences are invalid.",
		};
	}

	try {
		const user = await getCurrentDatabaseUser();

		const updated = await updateNotificationPreferencesForUser(
			user.id,
			result.data,
		);

		if (!updated) {
			return {
				success: false,
				message: "Your notification preferences could not be saved.",
			};
		}

		revalidatePath("/settings");

		return {
			success: true,
			message: "Notification preferences saved.",
		};
	} catch (error) {
		console.error("Failed to update notification settings:", error);

		return {
			success: false,
			message: "Something went wrong while saving notification preferences.",
		};
	}
}
