"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import {
	addProjectMemberByEmail,
	removeProjectMemberOwnedByUser,
	updateProjectMemberRoleOwnedByUser,
} from "@/lib/db/members";
import {
	projectMemberFormSchema,
	projectMemberRoleSchema,
} from "@/lib/validations/member";
import { projectIdSchema } from "@/lib/validations/project";
import { userIdSchema } from "@/lib/validations/user";
import type { ProjectMemberActionState } from "@/types/member";

export async function addProjectMember(
	projectId: string,
	_previousState: ProjectMemberActionState,
	formData: FormData,
): Promise<ProjectMemberActionState> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	if (!projectIdResult.success) {
		return {
			success: false,
			message: "The selected project is invalid.",
		};
	}

	const result = projectMemberFormSchema.safeParse({
		email: formData.get("email"),
	});

	if (!result.success) {
		return {
			success: false,
			errors: z.flattenError(result.error).fieldErrors,
		};
	}

	try {
		const user = await getCurrentDatabaseUser();

		const status = await addProjectMemberByEmail(
			projectIdResult.data,
			user.id,
			result.data.email,
		);

		switch (status) {
			case "project_not_found":
				return {
					success: false,
					message: "You do not have permission to manage this project.",
				};

			case "user_not_found":
				return {
					success: false,
					message: "No Shiro account exists for that email address.",
				};

			case "owner":
				return {
					success: false,
					message: "The project owner is already part of this project.",
				};

			case "already_member":
				return {
					success: false,
					message: "That user is already a project member.",
				};

			case "added":
				revalidatePath(`/projects/${projectIdResult.data}`);

				revalidatePath("/projects");

				return {
					success: true,
					message: "Member added.",
				};
		}
	} catch (error) {
		console.error("Failed to add project member:", error);

		return {
			success: false,
			message: "Something went wrong while adding the member.",
		};
	}
}

export async function removeProjectMember(
	projectId: string,
	memberUserId: string,
	_formData: FormData,
): Promise<void> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	const userIdResult = userIdSchema.safeParse(memberUserId);

	if (!projectIdResult.success || !userIdResult.success) {
		throw new Error("The project member could not be found.");
	}

	const user = await getCurrentDatabaseUser();

	const affectedProjectId = await removeProjectMemberOwnedByUser(
		projectIdResult.data,
		userIdResult.data,
		user.id,
	);

	if (!affectedProjectId) {
		throw new Error("The project member could not be removed.");
	}

	revalidatePath(`/projects/${affectedProjectId}`);

	revalidatePath("/projects");
}

export async function updateProjectMemberRole(
	projectId: string,
	memberUserId: string,
	formData: FormData,
): Promise<void> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	const userIdResult = userIdSchema.safeParse(memberUserId);

	const roleResult = projectMemberRoleSchema.safeParse(formData.get("role"));

	if (
		!projectIdResult.success ||
		!userIdResult.success ||
		!roleResult.success
	) {
		throw new Error("The member role could not be updated.");
	}

	const user = await getCurrentDatabaseUser();

	const result = await updateProjectMemberRoleOwnedByUser(
		projectIdResult.data,
		userIdResult.data,
		user.id,
		roleResult.data,
	);

	if (result !== "updated") {
		throw new Error("The member role could not be updated.");
	}

	revalidatePath(`/projects/${projectIdResult.data}`);

	revalidatePath("/projects");
}
