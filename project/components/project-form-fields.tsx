"use client";

import { ProjectDatePicker } from "@/components/project-date-picker";
import { cn } from "@/lib/utils";
import type { ProjectActionState, ProjectFormValues } from "@/types/project";

type ProjectFormFieldsProps = {
	state: ProjectActionState;
	defaultValues: ProjectFormValues;
	pending: boolean;
};

type FieldErrorProps = {
	id: string;
	messages?: string[];
};

function FieldError({ id, messages }: FieldErrorProps) {
	const message = messages?.[0];

	if (!message) {
		return null;
	}

	return (
		<p id={id} className="mt-1.5 text-sm text-destructive">
			{message}
		</p>
	);
}

export function ProjectFormFields({
	state,
	defaultValues,
	pending,
}: ProjectFormFieldsProps) {
	const nameErrorId = "project-name-error";
	const descriptionErrorId = "project-description-error";
	const dueDateErrorId = "project-due-date-error";

	return (
		<div className="space-y-5">
			<div>
				<label
					htmlFor="project-name"
					className="mb-2 block text-sm font-medium text-foreground"
				>
					Project name
				</label>

				<input
					id="project-name"
					name="name"
					type="text"
					required
					maxLength={100}
					defaultValue={defaultValues.name}
					disabled={pending}
					aria-invalid={Boolean(state.errors?.name)}
					aria-describedby={state.errors?.name ? nameErrorId : undefined}
					placeholder="e.g. Shiro Capstone"
					className={cn(
						"w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
						state.errors?.name && "border-destructive",
					)}
				/>

				<FieldError id={nameErrorId} messages={state.errors?.name} />
			</div>

			<div>
				<label
					htmlFor="project-description"
					className="mb-2 block text-sm font-medium text-foreground"
				>
					Description
				</label>

				<textarea
					id="project-description"
					name="description"
					rows={4}
					maxLength={500}
					defaultValue={defaultValues.description}
					disabled={pending}
					aria-invalid={Boolean(state.errors?.description)}
					aria-describedby={
						state.errors?.description ? descriptionErrorId : undefined
					}
					placeholder="What is this project about?"
					className={cn(
						"w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
						state.errors?.description && "border-destructive",
					)}
				/>

				<FieldError
					id={descriptionErrorId}
					messages={state.errors?.description}
				/>
			</div>

			<div>
				<p className="mb-2 text-sm font-medium text-foreground">Due date</p>

				<ProjectDatePicker
					defaultValue={defaultValues.dueDate}
					disabled={pending}
					invalid={Boolean(state.errors?.dueDate)}
					errorId={dueDateErrorId}
				/>

				<FieldError id={dueDateErrorId} messages={state.errors?.dueDate} />
			</div>
		</div>
	);
}
