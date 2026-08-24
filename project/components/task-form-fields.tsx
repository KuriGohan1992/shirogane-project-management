"use client";

import { useState } from "react";

import { CharacterCount } from "@/components/character-count";
import { CreateTaskAssigneesField } from "@/components/create-task-assignees-field";
import { CreateTaskLabelsField } from "@/components/create-task-labels-field";
import { DatePicker } from "@/components/date-picker";
import { FormFieldError } from "@/components/form-field-error";
import { TaskAssigneePicker } from "@/components/task-assignee-picker";
import { TaskLabelPicker } from "@/components/task-label-picker";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { TASK_FIELD_LIMITS } from "@/lib/constants/form-limits";
import type { ProjectLabel } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import type { TaskFormData } from "@/lib/validations/task";
import type { AssignmentCandidate } from "@/types/member";
import type { TaskActionState } from "@/types/task";
import type { UserSummary } from "@/types/user";

type TaskLabelFieldConfig =
	| {
			mode: "create";
			projectId: string;
			candidates: ProjectLabel[];
	  }
	| {
			mode: "edit";
			taskId: string;
			candidates: ProjectLabel[];
			assignedLabels: ProjectLabel[];
			canManage: boolean;
	  };

type TaskAssigneeFieldConfig =
	| {
			mode: "create";
			candidates: AssignmentCandidate[];
	  }
	| {
			mode: "edit";
			taskId: string;
			candidates: AssignmentCandidate[];
			assignedUsers: UserSummary[];
			canManage: boolean;
	  };

type TaskFormFieldsProps = {
	formId: string;
	state: TaskActionState;
	defaultValues: TaskFormData;
	pending: boolean;
	labels: TaskLabelFieldConfig;
	assignees: TaskAssigneeFieldConfig;
};

type TaskPriority = NonNullable<TaskFormData["priority"]>;

type PrioritySelection = TaskPriority | "none";

const TASK_PRIORITY_OPTIONS = [
	{
		value: "low",
		label: "Low",
	},
	{
		value: "medium",
		label: "Medium",
	},
	{
		value: "high",
		label: "High",
	},
	{
		value: "urgent",
		label: "Urgent",
	},
] as const satisfies ReadonlyArray<{
	value: TaskPriority;
	label: string;
}>;

type TaskField = keyof NonNullable<TaskActionState["errors"]>;

export function TaskFormFields({
	formId,
	state,
	defaultValues,
	pending,
	labels,
	assignees,
}: TaskFormFieldsProps) {
	const [titleLength, setTitleLength] = useState(defaultValues.title.length);

	const [descriptionLength, setDescriptionLength] = useState(
		defaultValues.description.length,
	);

	const [priority, setPriority] = useState<PrioritySelection>(
		defaultValues.priority ?? "none",
	);

	const titleErrorId = "task-title-error";
	const descriptionErrorId = "task-description-error";
	const priorityErrorId = "task-priority-error";
	const startDateErrorId = "task-start-date-error";
	const dueDateErrorId = "task-due-date-error";

	const { getFieldErrors, clearFieldError } = useFieldErrors<TaskField>(
		state.errors,
	);

	const titleErrors = getFieldErrors("title");
	const descriptionErrors = getFieldErrors("description");
	const priorityErrors = getFieldErrors("priority");
	const startDateErrors = getFieldErrors("startDate");
	const dueDateErrors = getFieldErrors("dueDate");

	return (
		<div className="space-y-5">
			<div>
				<div className="mb-2 flex items-center justify-between">
					<label
						htmlFor="task-title"
						className="text-sm font-medium text-foreground"
					>
						Task title
					</label>

					<CharacterCount current={titleLength} max={TASK_FIELD_LIMITS.title} />
				</div>

				<input
					id="task-title"
					name="title"
					form={formId}
					type="text"
					required
					maxLength={TASK_FIELD_LIMITS.title}
					defaultValue={defaultValues.title}
					disabled={pending}
					onChange={(event) => {
						const value = event.currentTarget.value;

						setTitleLength(value.length);

						if (value.trim().length > 0) {
							clearFieldError("title");
						}
					}}
					aria-invalid={Boolean(titleErrors)}
					aria-describedby={titleErrors ? titleErrorId : undefined}
					placeholder="e.g. Build project dashboard"
					className={cn(
						"w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
						titleErrors && "border-destructive",
					)}
				/>

				<FormFieldError id={titleErrorId} messages={titleErrors} />
			</div>

			<div>
				<div className="mb-2 flex items-center justify-between">
					<label
						htmlFor="task-description"
						className="text-sm font-medium text-foreground"
					>
						Description
					</label>

					<CharacterCount
						current={descriptionLength}
						max={TASK_FIELD_LIMITS.description}
					/>
				</div>

				<textarea
					id="task-description"
					name="description"
					form={formId}
					rows={4}
					maxLength={TASK_FIELD_LIMITS.description}
					defaultValue={defaultValues.description}
					disabled={pending}
					onChange={(event) => {
						setDescriptionLength(event.currentTarget.value.length);
						clearFieldError("description");
					}}
					aria-invalid={Boolean(descriptionErrors)}
					aria-describedby={descriptionErrors ? descriptionErrorId : undefined}
					placeholder="Add more details about this task..."
					className={cn(
						"w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
						descriptionErrors && "border-destructive",
					)}
				/>

				<FormFieldError id={descriptionErrorId} messages={descriptionErrors} />
			</div>

			<div>
				<label
					htmlFor="task-priority"
					className="mb-2 block text-sm font-medium text-foreground"
				>
					Priority
					<span className="ml-1 font-normal text-muted-foreground">
						(optional)
					</span>
				</label>

				<input
					type="hidden"
					name="priority"
					form={formId}
					value={priority === "none" ? "" : priority}
					readOnly
				/>

				<Select
					value={priority}
					disabled={pending}
					onValueChange={(value) => {
						setPriority(value as PrioritySelection);
						clearFieldError("priority");
					}}
				>
					<SelectTrigger
						id="task-priority"
						aria-invalid={Boolean(priorityErrors)}
						aria-describedby={priorityErrors ? priorityErrorId : undefined}
						className={cn(
							"w-full bg-card hover:bg-card/90",
							priorityErrors && "border-destructive",
						)}
					>
						<SelectValue />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="none">No priority</SelectItem>

						{TASK_PRIORITY_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<FormFieldError id={priorityErrorId} messages={priorityErrors} />
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<p className="mb-2 text-sm font-medium text-foreground">Start date</p>

					<DatePicker
						name="startDate"
						form={formId}
						defaultValue={defaultValues.startDate}
						placeholder="Select a start date"
						disabled={pending}
						invalid={Boolean(startDateErrors)}
						errorId={startDateErrorId}
						onValueChange={() => clearFieldError("startDate")}
						className="bg-card hover:bg-card/90"
					/>

					<FormFieldError id={startDateErrorId} messages={startDateErrors} />
				</div>

				<div>
					<p className="mb-2 text-sm font-medium text-foreground">Due date</p>

					<DatePicker
						name="dueDate"
						form={formId}
						defaultValue={defaultValues.dueDate}
						placeholder="Select a due date"
						disabled={pending}
						invalid={Boolean(dueDateErrors)}
						errorId={dueDateErrorId}
						onValueChange={() => clearFieldError("dueDate")}
						className="bg-card hover:bg-card/90"
					/>

					<FormFieldError id={dueDateErrorId} messages={dueDateErrors} />
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="min-w-0">
					<p className="mb-2 text-sm font-medium text-foreground">Labels</p>

					{labels.mode === "create" ? (
						<CreateTaskLabelsField
							formId={formId}
							projectId={labels.projectId}
							labels={labels.candidates}
							pending={pending}
						/>
					) : (
						<TaskLabelPicker
							taskId={labels.taskId}
							labels={labels.candidates}
							assignedLabels={labels.assignedLabels}
							canManage={labels.canManage}
						/>
					)}
				</div>

				<div className="min-w-0">
					<p className="mb-2 text-sm font-medium text-foreground">Assignees</p>

					{assignees.mode === "create" ? (
						<CreateTaskAssigneesField
							formId={formId}
							candidates={assignees.candidates}
							pending={pending}
						/>
					) : (
						<TaskAssigneePicker
							taskId={assignees.taskId}
							candidates={assignees.candidates}
							assignedUsers={assignees.assignedUsers}
							canManage={assignees.canManage}
							fieldStyle
							modal
						/>
					)}
				</div>
			</div>
		</div>
	);
}
