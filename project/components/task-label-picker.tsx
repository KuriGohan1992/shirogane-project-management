"use client";

import { Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import { FormFieldError } from "@/components/form-field-error";
import { TaskLabelBadge } from "@/components/task-label-badge";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	assignTaskLabel,
	createTaskLabel,
	deleteProjectLabel,
	unassignTaskLabel,
	updateProjectLabel,
} from "@/lib/actions/labels";
import {
	COLOR_OPTIONS,
	DEFAULT_COLOR,
	getColorHex,
} from "@/lib/constants/colors";
import { LABEL_FIELD_LIMITS } from "@/lib/constants/form-limits";
import type { ProjectLabel } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import type { LabelActionState } from "@/types/label";

type TaskLabelPickerProps = {
	taskId: string;
	labels: ProjectLabel[];
	assignedLabels: ProjectLabel[];
	canManage: boolean;
};

type LabelRowProps = {
	taskId: string;
	label: ProjectLabel;
	isAssigned: boolean;
};

const initialState: LabelActionState = {
	success: false,
};

function LabelColorOptions({
	defaultValue,
	pending,
	namePrefix,
}: {
	defaultValue: ProjectLabel["color"];
	pending: boolean;
	namePrefix: string;
}) {
	return (
		<fieldset disabled={pending}>
			<legend className="mb-1.5 text-xs font-medium">Color</legend>

			<div className="flex flex-wrap gap-2">
				{COLOR_OPTIONS.map((option) => (
					<label
						key={option.value}
						htmlFor={`${namePrefix}-${option.value}`}
						className="cursor-pointer"
						title={option.label}
					>
						<input
							id={`${namePrefix}-${option.value}`}
							type="radio"
							name="color"
							value={option.value}
							defaultChecked={option.value === defaultValue}
							className="peer sr-only"
						/>

						<span
							className="block size-6 rounded-full border-2 border-transparent transition-transform hover:scale-110 peer-checked:border-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
							style={{ backgroundColor: option.hex }}
						>
							<span className="sr-only">{option.label}</span>
						</span>
					</label>
				))}
			</div>
		</fieldset>
	);
}

function LabelRow({ taskId, label, isAssigned }: LabelRowProps) {
	const [isEditing, setIsEditing] = useState(false);
	const updateAction = updateProjectLabel.bind(null, label.id);
	const [updateState, updateFormAction, updatePending] = useActionState(
		updateAction,
		initialState,
	);
	const assignmentAction = isAssigned
		? unassignTaskLabel.bind(null, taskId, label.id)
		: assignTaskLabel.bind(null, taskId, label.id);
	const deleteAction = deleteProjectLabel.bind(null, label.id);

	useEffect(() => {
		if (updateState.success) {
			setIsEditing(false);
		}
	}, [updateState]);

	return (
		<div className="rounded-md">
			<div className="flex items-center gap-1">
				<form action={assignmentAction} className="min-w-0 flex-1">
					<button
						type="submit"
						aria-pressed={isAssigned}
						className={cn(
							"group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition hover:bg-muted",
							isAssigned && "bg-muted/60",
						)}
					>
						<span
							aria-hidden="true"
							className={cn(
								"size-3.5 shrink-0 rounded-full transition-opacity",
								isAssigned
									? "opacity-100"
									: "opacity-30 group-hover:opacity-60",
							)}
							style={{ backgroundColor: getColorHex(label.color) }}
						/>

						<span className="min-w-0 flex-1 truncate text-sm">
							{label.name}
						</span>
						<span className="sr-only">
							{isAssigned ? "Assigned" : "Not assigned"}
						</span>
					</button>
				</form>

				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					aria-label={`Edit ${label.name} label`}
					onClick={() => setIsEditing((current) => !current)}
				>
					{isEditing ? (
						<X aria-hidden="true" size={13} />
					) : (
						<Pencil aria-hidden="true" size={13} />
					)}
				</Button>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							aria-label={`Delete ${label.name} label`}
							className="text-destructive hover:text-destructive"
						>
							<Trash2 aria-hidden="true" size={13} />
						</Button>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete {label.name}?</AlertDialogTitle>

							<AlertDialogDescription>
								This permanently deletes the label from this project and removes
								it from every task using it.
							</AlertDialogDescription>
						</AlertDialogHeader>

						<form action={deleteAction}>
							<AlertDialogFooter>
								<AlertDialogCancel asChild>
									<Button type="button" variant="outline">
										Cancel
									</Button>
								</AlertDialogCancel>

								<Button type="submit" variant="destructive">
									Delete label
								</Button>
							</AlertDialogFooter>
						</form>
					</AlertDialogContent>
				</AlertDialog>
			</div>

			{isEditing && (
				<form
					action={updateFormAction}
					className="mx-2 mb-2 space-y-3 rounded-md border border-border bg-muted/30 p-3"
					noValidate
				>
					<div>
						<label
							htmlFor={`edit-label-name-${label.id}`}
							className="mb-1.5 block text-xs font-medium"
						>
							Name
						</label>

						<input
							id={`edit-label-name-${label.id}`}
							name="name"
							type="text"
							required
							maxLength={LABEL_FIELD_LIMITS.name}
							defaultValue={label.name}
							disabled={updatePending}
							className={cn(
								"h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:opacity-60",
								updateState.errors?.name?.length && "border-destructive",
							)}
						/>

						<FormFieldError
							id={`edit-label-name-error-${label.id}`}
							messages={updateState.errors?.name}
						/>
					</div>

					<LabelColorOptions
						defaultValue={label.color}
						pending={updatePending}
						namePrefix={`edit-label-color-${label.id}`}
					/>

					<FormFieldError
						id={`edit-label-color-error-${label.id}`}
						messages={updateState.errors?.color}
					/>

					{updateState.message &&
						!updateState.success &&
						!updateState.errors && (
							<p className="text-xs text-destructive">{updateState.message}</p>
						)}

					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							disabled={updatePending}
							onClick={() => setIsEditing(false)}
						>
							Cancel
						</Button>

						<Button type="submit" size="sm" disabled={updatePending}>
							{updatePending ? "Saving..." : "Save label"}
						</Button>
					</div>
				</form>
			)}
		</div>
	);
}

export function TaskLabelPicker({
	taskId,
	labels,
	assignedLabels,
	canManage,
}: TaskLabelPickerProps) {
	const createAction = createTaskLabel.bind(null, taskId);
	const [state, formAction, pending] = useActionState(
		createAction,
		initialState,
	);
	const [showCreate, setShowCreate] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	const assignedLabelIds = useMemo(
		() => new Set(assignedLabels.map((label) => label.id)),
		[assignedLabels],
	);

	useEffect(() => {
		if (!state.success) {
			return;
		}

		formRef.current?.reset();
		setShowCreate(false);
	}, [state]);

	if (!canManage) {
		if (assignedLabels.length === 0) {
			return <span className="text-sm text-muted-foreground">No labels</span>;
		}

		return (
			<div className="flex flex-wrap gap-2">
				{assignedLabels.map((label) => (
					<TaskLabelBadge key={label.id} label={label} />
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-wrap items-center gap-2">
			{assignedLabels.map((label) => (
				<TaskLabelBadge key={label.id} label={label} />
			))}

			<Popover>
				<PopoverTrigger asChild>
					<Button type="button" variant="outline" size="sm" className="h-8">
						<Plus aria-hidden="true" size={14} />
						Label
					</Button>
				</PopoverTrigger>

				<PopoverContent align="start" className="w-80 p-0">
					{labels.length === 0 && !showCreate ? (
						<div className="px-5 py-6 text-center">
							<Tag
								aria-hidden="true"
								size={20}
								className="mx-auto text-muted-foreground"
							/>

							<p className="mt-2 text-sm font-medium">No labels yet</p>

							<p className="mt-1 text-xs text-muted-foreground">
								Create your first label for this project.
							</p>

							<Button
								type="button"
								size="sm"
								className="mt-4"
								onClick={() => setShowCreate(true)}
							>
								<Plus aria-hidden="true" size={14} />
								Create label
							</Button>
						</div>
					) : (
						<>
							{labels.length > 0 && (
								<div className="max-h-64 overflow-y-auto p-2">
									<div className="space-y-1">
										{labels.map((label) => (
											<LabelRow
												key={label.id}
												taskId={taskId}
												label={label}
												isAssigned={assignedLabelIds.has(label.id)}
											/>
										))}
									</div>
								</div>
							)}

							<div
								className={cn(
									"p-2",
									labels.length > 0 && "border-t border-border",
								)}
							>
								{!showCreate && (
									<Button
										type="button"
										variant="ghost"
										className="w-full justify-start"
										onClick={() => setShowCreate(true)}
									>
										<Tag aria-hidden="true" size={14} />
										Create new label
									</Button>
								)}

								{showCreate && (
									<form
										ref={formRef}
										action={formAction}
										className="mt-2 space-y-3 px-2 pb-2"
										noValidate
									>
										<div>
											<label
												htmlFor={`label-name-${taskId}`}
												className="mb-1.5 block text-xs font-medium"
											>
												Name
											</label>

											<input
												id={`label-name-${taskId}`}
												name="name"
												type="text"
												required
												maxLength={LABEL_FIELD_LIMITS.name}
												disabled={pending}
												placeholder="e.g. Backend"
												className={cn(
													"h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:opacity-60",
													state.errors?.name?.length && "border-destructive",
												)}
											/>

											<FormFieldError
												id={`label-name-error-${taskId}`}
												messages={state.errors?.name}
											/>
										</div>

										<LabelColorOptions
											defaultValue={DEFAULT_COLOR}
											pending={pending}
											namePrefix={`create-label-color-${taskId}`}
										/>

										<FormFieldError
											id={`label-color-error-${taskId}`}
											messages={state.errors?.color}
										/>

										{state.message && !state.success && !state.errors && (
											<p className="text-xs text-destructive">
												{state.message}
											</p>
										)}

										<Button
											type="submit"
											size="sm"
											disabled={pending}
											className="w-full"
										>
											{pending ? "Creating..." : "Create and add"}
										</Button>
									</form>
								)}
							</div>
						</>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
}
