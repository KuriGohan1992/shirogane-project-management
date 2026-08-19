"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { TaskLabelBadge } from "@/components/task-label-badge";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { getColorHex } from "@/lib/constants/colors";
import type { ProjectLabel } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type CreateTaskLabelsFieldProps = {
	formId: string;
	labels: ProjectLabel[];
	pending: boolean;
};

export function CreateTaskLabelsField({
	formId,
	labels,
	pending,
}: CreateTaskLabelsFieldProps) {
	const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

	const selectedLabelIdSet = useMemo(
		() => new Set(selectedLabelIds),
		[selectedLabelIds],
	);

	const selectedLabels = labels.filter((label) =>
		selectedLabelIdSet.has(label.id),
	);

	function toggleLabel(labelId: string) {
		setSelectedLabelIds((current) =>
			current.includes(labelId)
				? current.filter((id) => id !== labelId)
				: [...current, labelId],
		);
	}

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

			{labels.length > 0 ? (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-8"
							disabled={pending}
						>
							<Plus aria-hidden="true" size={14} />
							Label
						</Button>
					</PopoverTrigger>

					<PopoverContent align="start" className="w-72 p-2">
						<div className="space-y-1">
							{labels.map((label) => {
								const isSelected = selectedLabelIdSet.has(label.id);

								return (
									<button
										key={label.id}
										type="button"
										aria-pressed={isSelected}
										disabled={pending}
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
											style={{ backgroundColor: getColorHex(label.color) }}
										/>

										<span className="min-w-0 flex-1 truncate text-sm">
											{label.name}
										</span>
									</button>
								);
							})}
						</div>
					</PopoverContent>
				</Popover>
			) : (
				<span className="text-sm text-muted-foreground">
					No project labels yet.
				</span>
			)}
		</div>
	);
}
