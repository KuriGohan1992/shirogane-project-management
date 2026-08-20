"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { FormFieldError } from "@/components/form-field-error";
import { renameStage } from "@/lib/actions/stages";
import { STAGE_FIELD_LIMITS } from "@/lib/constants/form-limits";
import { cn } from "@/lib/utils";
import type { StageActionState } from "@/types/stage";

type StageInlineNameProps = {
	stage: {
		id: string;
		name: string;
	};
	canManage: boolean;
	disabled: boolean;
};

type StageRenameFormProps = {
	stage: {
		id: string;
		name: string;
	};
	disabled: boolean;
	onCancel: () => void;
	onSuccess: () => void;
};

const initialState: StageActionState = {
	success: false,
};

function StageRenameForm({
	stage,
	disabled,
	onCancel,
	onSuccess,
}: StageRenameFormProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const isSubmittingRef = useRef(false);

	const renameAction = renameStage.bind(null, stage.id);

	const [state, formAction, pending] = useActionState(
		renameAction,
		initialState,
	);

	const errors = state.errors?.name;

	const errorId = `stage-${stage.id}-name-error`;

	useEffect(() => {
		const input = inputRef.current;

		if (!input) {
			return;
		}

		input.focus();

		// Keep the beginning of a long Stage name visible instead of
		// scrolling the input to the end when edit mode opens.
		input.setSelectionRange(0, 0);
	}, []);

	useEffect(() => {
		if (state.success) {
			onSuccess();
			return;
		}

		isSubmittingRef.current = false;
	}, [state, onSuccess]);

	return (
		<form
			action={formAction}
			className="min-w-0 flex-1"
			noValidate
			onSubmit={() => {
				isSubmittingRef.current = true;
			}}
		>
			<input
				ref={inputRef}
				name="name"
				defaultValue={stage.name}
				maxLength={STAGE_FIELD_LIMITS.name}
				disabled={disabled || pending}
				aria-label={`Rename ${stage.name}`}
				aria-invalid={Boolean(errors)}
				aria-describedby={errors ? errorId : undefined}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						event.preventDefault();

						onCancel();
					}
				}}
				onBlur={() => {
					if (!isSubmittingRef.current) {
						onCancel();
					}
				}}
				className={cn(
					"h-8 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm font-semibold text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
					errors && "border-destructive",
				)}
			/>
			<FormFieldError id={errorId} messages={errors} />
		</form>
	);
}

export function StageInlineName({
	stage,
	canManage,
	disabled,
}: StageInlineNameProps) {
	const [isEditing, setIsEditing] = useState(false);

	if (!canManage) {
		return (
			<h3
				title={stage.name}
				className="min-w-0 truncate font-semibold text-foreground"
			>
				{stage.name}
			</h3>
		);
	}

	if (isEditing) {
		return (
			<StageRenameForm
				key={stage.name}
				stage={stage}
				disabled={disabled}
				onCancel={() => setIsEditing(false)}
				onSuccess={() => setIsEditing(false)}
			/>
		);
	}

	return (
		<button
			type="button"
			disabled={disabled}
			title={`Rename ${stage.name}`}
			onClick={() => setIsEditing(true)}
			className="min-w-0 truncate rounded-md px-1 py-0.5 text-left font-semibold text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
		>
			{stage.name}
		</button>
	);
}
