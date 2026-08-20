"use client";

import { Plus, Tag } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import { FormFieldError } from "@/components/form-field-error";
import { TaskLabelBadge } from "@/components/task-label-badge";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { createProjectLabel } from "@/lib/actions/labels";
import {
	COLOR_OPTIONS,
	DEFAULT_COLOR,
	getColorHex,
} from "@/lib/constants/colors";
import { LABEL_FIELD_LIMITS } from "@/lib/constants/form-limits";
import type { ProjectLabel } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import type { LabelActionState, LabelOption } from "@/types/label";

type CreateTaskLabelsFieldProps = {
	projectId: string;
	formId: string;
	labels: ProjectLabel[];
	pending: boolean;
};

const initialState: LabelActionState = {
	success: false,
};

export function CreateTaskLabelsField({
	projectId,
	formId,
	labels,
	pending,
}: CreateTaskLabelsFieldProps) {
	const createAction = createProjectLabel.bind(null, projectId);

	const [createState, createFormAction, createPending] = useActionState(
		createAction,
		initialState,
	);

	const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

	const [createdLabels, setCreatedLabels] = useState<LabelOption[]>([]);

	const [showCreate, setShowCreate] = useState(false);

	const createFormRef = useRef<HTMLFormElement>(null);

	const availableLabels = useMemo(() => {
		const labelsById = new Map<string, LabelOption>();

		for (const label of labels) {
			labelsById.set(label.id, label);
		}

		for (const label of createdLabels) {
			labelsById.set(label.id, label);
		}

		return [...labelsById.values()].toSorted((a, b) =>
			a.name.localeCompare(b.name),
		);
	}, [labels, createdLabels]);

	const selectedLabelIdSet = useMemo(
		() => new Set(selectedLabelIds),
		[selectedLabelIds],
	);

	const selectedLabels = availableLabels.filter((label) =>
		selectedLabelIdSet.has(label.id),
	);

	useEffect(() => {
		if (!createState.success || !createState.label) {
			return;
		}

		const createdLabel = createState.label;

		setCreatedLabels((current) =>
			current.some((label) => label.id === createdLabel.id)
				? current
				: [...current, createdLabel],
		);

		setSelectedLabelIds((current) =>
			current.includes(createdLabel.id)
				? current
				: [...current, createdLabel.id],
		);

		createFormRef.current?.reset();

		setShowCreate(false);
	}, [createState]);

	function toggleLabel(labelId: string) {
		setSelectedLabelIds((current) =>
			current.includes(labelId)
				? current.filter((id) => id !== labelId)
				: [...current, labelId],
		);
	}

	const isDisabled = pending || createPending;

	return (
		<div className="flex flex-wrap items-center gap-2">
			{selectedLabels.map((label) => (
				<TaskLabelBadge key={label.id} label={label} />
			))}

			{selectedLabelIds.map((labelId) => (
				<input
					key={labelId}
					type="hidden"
					name="labelIds"
					form={formId}
					value={labelId}
					readOnly
				/>
			))}

			<Popover>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="h-8"
						disabled={isDisabled}
					>
						<Plus aria-hidden="true" size={14} />
						Label
					</Button>
				</PopoverTrigger>

				<PopoverContent align="start" className="w-80 p-0">
					{availableLabels.length === 0 && !showCreate ? (
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
							{availableLabels.length > 0 && (
								<div className="max-h-64 overflow-y-auto p-2">
									<div className="space-y-1">
										{availableLabels.map((label) => {
											const isSelected = selectedLabelIdSet.has(label.id);

											return (
												<button
													key={label.id}
													type="button"
													aria-pressed={isSelected}
													disabled={isDisabled}
													onClick={() => toggleLabel(label.id)}
													className={cn(
														"group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition hover:bg-muted",
														isSelected && "bg-muted/60",
													)}
												>
													<span
														aria-hidden="true"
														className={cn(
															"size-3.5 shrink-0 rounded-full transition-opacity",
															isSelected
																? "opacity-100"
																: "opacity-30 group-hover:opacity-60",
														)}
														style={{
															backgroundColor: getColorHex(label.color),
														}}
													/>

													<span className="min-w-0 flex-1 truncate text-sm">
														{label.name}
													</span>
												</button>
											);
										})}
									</div>
								</div>
							)}

							<div
								className={cn(
									"p-2",
									availableLabels.length > 0 && "border-t border-border",
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
										ref={createFormRef}
										action={createFormAction}
										className="mt-2 space-y-3 px-2 pb-2"
										noValidate
									>
										<div>
											<label
												htmlFor={`create-project-label-name-${projectId}`}
												className="mb-1.5 block text-xs font-medium"
											>
												Name
											</label>

											<input
												id={`create-project-label-name-${projectId}`}
												name="name"
												type="text"
												required
												maxLength={LABEL_FIELD_LIMITS.name}
												disabled={createPending}
												placeholder="e.g. Backend"
												className={cn(
													"h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:opacity-60",
													createState.errors?.name?.length &&
														"border-destructive",
												)}
											/>

											<FormFieldError
												id={`create-project-label-name-error-${projectId}`}
												messages={createState.errors?.name}
											/>
										</div>

										<fieldset disabled={createPending}>
											<legend className="mb-1.5 text-xs font-medium">
												Color
											</legend>

											<div className="flex flex-wrap gap-2">
												{COLOR_OPTIONS.map((option) => (
													<label
														key={option.value}
														htmlFor={`create-project-label-color-${projectId}-${option.value}`}
														className="cursor-pointer"
														title={option.label}
													>
														<input
															id={`create-project-label-color-${projectId}-${option.value}`}
															type="radio"
															name="color"
															value={option.value}
															defaultChecked={option.value === DEFAULT_COLOR}
															className="peer sr-only"
														/>

														<span
															className="block size-6 rounded-full border-2 border-transparent transition-transform hover:scale-110 peer-checked:border-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
															style={{
																backgroundColor: option.hex,
															}}
														>
															<span className="sr-only">{option.label}</span>
														</span>
													</label>
												))}
											</div>
										</fieldset>

										<FormFieldError
											id={`create-project-label-color-error-${projectId}`}
											messages={createState.errors?.color}
										/>

										{createState.message &&
											!createState.success &&
											!createState.errors && (
												<p className="text-xs text-destructive">
													{createState.message}
												</p>
											)}

										<Button
											type="submit"
											size="sm"
											disabled={createPending}
											className="w-full"
										>
											{createPending ? "Creating..." : "Create and select"}
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
