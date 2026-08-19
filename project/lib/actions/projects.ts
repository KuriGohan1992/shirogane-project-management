"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import {
	createProjectWithDefaultStages,
	deleteProjectForUser,
	updateProjectForUser,
} from "@/lib/db/projects";
import { projectFormSchema, projectIdSchema } from "@/lib/validations/project";
import type { ProjectActionState } from "@/types/project";

function parseDate(value: string): Date | null {
	if (!value) {
		return null;
	}

	return new Date(`${value}T00:00:00.000Z`);
}

export async function createProject(
	_previousState: ProjectActionState,
	formData: FormData,
): Promise<ProjectActionState> {
	const result = projectFormSchema.safeParse({
		name: formData.get("name"),
		description: formData.get("description"),
		color: formData.get("color"),
		startDate: formData.get("startDate"),
		dueDate: formData.get("dueDate"),
	});

	if (!result.success) {
		return {
			success: false,
			errors: z.flattenError(result.error).fieldErrors,
		};
	}

	let projectId: string;

	try {
		const user = await getCurrentDatabaseUser();

		const project = await createProjectWithDefaultStages({
			ownerId: user.id,
			name: result.data.name,
			description: result.data.description || null,
			color: result.data.color,
			startDate: parseDate(result.data.startDate),
			dueDate: parseDate(result.data.dueDate),
		});

		projectId = project.id;
	} catch (error) {
		console.error("Failed to create project:", error);

		return {
			success: false,
			message: "Something went wrong while creating the project.",
		};
	}

	revalidatePath("/projects");
	revalidatePath("/dashboard");

	redirect(`/projects/${projectId}`);
}

export async function updateProject(
	projectId: string,
	_previousState: ProjectActionState,
	formData: FormData,
): Promise<ProjectActionState> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	if (!projectIdResult.success) {
		return {
			success: false,
			message: "Project not found or you do not have permission to edit it.",
		};
	}

	const result = projectFormSchema.safeParse({
		name: formData.get("name"),
		description: formData.get("description"),
		color: formData.get("color"),
		startDate: formData.get("startDate"),
		dueDate: formData.get("dueDate"),
	});

	if (!result.success) {
		return {
			success: false,
			errors: z.flattenError(result.error).fieldErrors,
		};
	}

	try {
		const user = await getCurrentDatabaseUser();

		const project = await updateProjectForUser(projectIdResult.data, user.id, {
			name: result.data.name,
			description: result.data.description || null,
			color: result.data.color,
			startDate: parseDate(result.data.startDate),
			dueDate: parseDate(result.data.dueDate),
		});

		if (!project) {
			return {
				success: false,
				message: "Project not found or you do not have permission to edit it.",
			};
		}

		revalidatePath("/projects");
		revalidatePath(`/projects/${projectIdResult.data}`);
		revalidatePath("/dashboard");

		return {
			success: true,
			message: "Project updated successfully.",
		};
	} catch (error) {
		console.error("Failed to update project:", error);

		return {
			success: false,
			message: "Something went wrong while updating the project.",
		};
	}
}

export async function deleteProject(
	projectId: string,
	_formData: FormData,
): Promise<void> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	if (!projectIdResult.success) {
		throw new Error(
			"Project not found or user does not have permission to delete it.",
		);
	}

	try {
		const user = await getCurrentDatabaseUser();

		const deletedProjectId = await deleteProjectForUser(
			projectIdResult.data,
			user.id,
		);

		if (!deletedProjectId) {
			throw new Error(
				"Project not found or user does not have permission to delete it.",
			);
		}
	} catch (error) {
		console.error("Failed to delete project:", error);
		throw error;
	}

	revalidatePath("/projects");
	revalidatePath("/dashboard");

	redirect("/projects");
}
