"use client";

import { useState } from "react";

import { CharacterCount } from "@/components/character-count";
import { DatePicker } from "@/components/date-picker";
import { FormFieldError } from "@/components/form-field-error";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { COLOR_OPTIONS } from "@/lib/constants/colors";
import { PROJECT_FIELD_LIMITS } from "@/lib/constants/form-limits";
import { cn } from "@/lib/utils";
import type { ProjectFormData } from "@/lib/validations/project";
import type { ProjectActionState } from "@/types/project";

type ProjectFormFieldsProps = {
	state: ProjectActionState;
	defaultValues: ProjectFormData;
	pending: boolean;
};

type ProjectField = keyof NonNullable<ProjectActionState["errors"]>;

export function ProjectFormFields({
	state,
	defaultValues,
	pending,
}: ProjectFormFieldsProps) {
	const [nameLength, setNameLength] = useState(defaultValues.name.length);

	const [descriptionLength, setDescriptionLength] = useState(
		defaultValues.description.length,
	);

	const nameErrorId = "project-name-error";
	const descriptionErrorId = "project-description-error";
	const colorErrorId = "project-color-error";
	const startDateErrorId = "project-start-date-error";
	const dueDateErrorId = "project-due-date-error";

	const { getFieldErrors, clearFieldError } = useFieldErrors<ProjectField>(
		state.errors,
	);

	const nameErrors = getFieldErrors("name");
	const descriptionErrors = getFieldErrors("description");
	const colorErrors = getFieldErrors("color");
	const startDateErrors = getFieldErrors("startDate");
	const dueDateErrors = getFieldErrors("dueDate");

	return (
		<div className="space-y-5">
			<div>
				<div className="mb-2 flex items-center justify-between">
					<label
						htmlFor="project-name"
						className="text-sm font-medium text-foreground"
					>
						Project name
					</label>

					<CharacterCount
						current={nameLength}
						max={PROJECT_FIELD_LIMITS.name}
					/>
				</div>

				<input
					id="project-name"
					name="name"
					type="text"
					required
					maxLength={PROJECT_FIELD_LIMITS.name}
					defaultValue={defaultValues.name}
					disabled={pending}
					onChange={(event) => {
						const value = event.currentTarget.value;

						setNameLength(value.length);

						if (value.trim().length > 0) {
							clearFieldError("name");
						}
					}}
					aria-invalid={Boolean(nameErrors)}
					aria-describedby={nameErrors ? nameErrorId : undefined}
					placeholder="e.g. Shiro Capstone"
					className={cn(
						"w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
						nameErrors && "border-destructive",
					)}
				/>

				<FormFieldError id={nameErrorId} messages={nameErrors} />
			</div>

			<div>
				<div className="mb-2 flex items-center justify-between">
					<label
						htmlFor="project-description"
						className="text-sm font-medium text-foreground"
					>
						Description
					</label>

					<CharacterCount
						current={descriptionLength}
						max={PROJECT_FIELD_LIMITS.description}
					/>
				</div>

				<textarea
					id="project-description"
					name="description"
					rows={4}
					maxLength={PROJECT_FIELD_LIMITS.description}
					defaultValue={defaultValues.description}
					disabled={pending}
					onChange={(event) => {
						setDescriptionLength(event.currentTarget.value.length);

						clearFieldError("description");
					}}
					aria-invalid={Boolean(descriptionErrors)}
					aria-describedby={descriptionErrors ? descriptionErrorId : undefined}
					placeholder="What is this project about?"
					className={cn(
						"w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
						descriptionErrors && "border-destructive",
					)}
				/>

				<FormFieldError id={descriptionErrorId} messages={descriptionErrors} />
			</div>

			<fieldset disabled={pending}>
				<legend className="mb-2 text-sm font-medium text-foreground">
					Project color
				</legend>

				<div className="flex flex-wrap gap-2">
					{COLOR_OPTIONS.map((option) => (
						<label
							key={option.value}
							className="cursor-pointer"
							title={option.label}
						>
							<input
								type="radio"
								name="color"
								value={option.value}
								defaultChecked={defaultValues.color === option.value}
								className="peer sr-only"
								onChange={() => clearFieldError("color")}
							/>

							<span
								className="block size-7 rounded-full border-2 border-transparent transition-transform hover:scale-110 peer-checked:border-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
								style={{
									backgroundColor: option.hex,
								}}
							>
								<span className="sr-only">{option.label}</span>
							</span>
						</label>
					))}
				</div>

				<FormFieldError id={colorErrorId} messages={colorErrors} />
			</fieldset>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<p className="mb-2 text-sm font-medium text-foreground">Start date</p>

					<DatePicker
						name="startDate"
						defaultValue={defaultValues.startDate}
						placeholder="Select a start date"
						disabled={pending}
						invalid={Boolean(startDateErrors)}
						errorId={startDateErrorId}
						onValueChange={() => clearFieldError("startDate")}
					/>

					<FormFieldError id={startDateErrorId} messages={startDateErrors} />
				</div>

				<div>
					<p className="mb-2 text-sm font-medium text-foreground">Due date</p>

					<DatePicker
						name="dueDate"
						defaultValue={defaultValues.dueDate}
						disabled={pending}
						invalid={Boolean(dueDateErrors)}
						errorId={dueDateErrorId}
						onValueChange={() => clearFieldError("dueDate")}
					/>

					<FormFieldError id={dueDateErrorId} messages={dueDateErrors} />
				</div>
			</div>
		</div>
	);
}
