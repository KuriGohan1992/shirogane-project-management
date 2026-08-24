"use client";

import { useState } from "react";

import { CharacterCount } from "@/components/character-count";
import { FormFieldError } from "@/components/form-field-error";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { STAGE_FIELD_LIMITS } from "@/lib/constants/form-limits";
import { cn } from "@/lib/utils";
import type { StageFormData } from "@/lib/validations/stage";
import type { StageActionState } from "@/types/stage";

type StageFormFieldsProps = {
	state: StageActionState;
	defaultValues: StageFormData;
	pending: boolean;
};

type StageField = keyof NonNullable<StageActionState["errors"]>;

export function StageFormFields({
	state,
	defaultValues,
	pending,
}: StageFormFieldsProps) {
	const [nameLength, setNameLength] = useState(defaultValues.name.length);

	const nameErrorId = "stage-name-error";

	const { getFieldErrors, clearFieldError } = useFieldErrors<StageField>(
		state.errors,
	);

	const nameErrors = getFieldErrors("name");

	return (
		<div>
			<div className="mb-2 flex items-center justify-between">
				<label
					htmlFor="stage-name"
					className="text-sm font-medium text-foreground"
				>
					Stage name
				</label>

				<CharacterCount current={nameLength} max={STAGE_FIELD_LIMITS.name} />
			</div>

			<input
				id="stage-name"
				name="name"
				type="text"
				required
				maxLength={STAGE_FIELD_LIMITS.name}
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
				placeholder="e.g. Review"
				className={cn(
					"w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
					nameErrors && "border-destructive",
				)}
			/>

			<FormFieldError id={nameErrorId} messages={nameErrors} />
		</div>
	);
}
