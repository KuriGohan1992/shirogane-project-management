"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import {
	createProjectWithDefaultStages,
	deleteProjectOwnedByUser,
	updateProjectOwnedByUser,
} from "@/lib/db/projects";
import { projectFormSchema } from "@/lib/validations/project";
import type { ProjectActionState } from "@/types/project";

function parseDueDate(value: string): Date | null {
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
		dueDate: formData.get("dueDate"),
	});

	if (!result.success) {
		return {
			success: false,
			message: "Check the project details and try again.",
			errors: result.error.flatten().fieldErrors,
		};
	}

	let projectId: string;

	try {
		const user = await getCurrentDatabaseUser();

		const project = await createProjectWithDefaultStages({
			ownerId: user.id,
			name: result.data.name,
			description: result.data.description || null,
			dueDate: parseDueDate(result.data.dueDate),
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
	const result = projectFormSchema.safeParse({
		name: formData.get("name"),
		description: formData.get("description"),
		dueDate: formData.get("dueDate"),
	});

	if (!result.success) {
		return {
			success: false,
			message: "Check the project details and try again.",
			errors: result.error.flatten().fieldErrors,
		};
	}

	try {
		const user = await getCurrentDatabaseUser();

		const project = await updateProjectOwnedByUser(projectId, user.id, {
			name: result.data.name,
			description: result.data.description || null,
			dueDate: parseDueDate(result.data.dueDate),
		});

		if (!project) {
			return {
				success: false,
				message: "Project not found or you do not have permission to edit it.",
			};
		}

		revalidatePath("/projects");
		revalidatePath(`/projects/${projectId}`);
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
	console.log("hello");
	try {
		const user = await getCurrentDatabaseUser();

		const deletedProjectId = await deleteProjectOwnedByUser(projectId, user.id);

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
