import { CalendarDays, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DueDatePickerProps = {
	defaultValue?: string;
	disabled?: boolean;
	invalid?: boolean;
	errorId?: string;
	onValueChange?: (value: string) => void;
};

function parseDateValue(value?: string) {
	if (!value) {
		return undefined;
	}

	const [year, month, day] = value.split("-").map(Number);

	if (!year || !month || !day) {
		return undefined;
	}

	return new Date(year, month - 1, day);
}

function toDateValue(date?: Date) {
	if (!date) {
		return "";
	}

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

function formatDateLabel(date: Date) {
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "long",
	}).format(date);
}

export function DueDatePicker({
	defaultValue,
	disabled = false,
	invalid = false,
	errorId,
	onValueChange,
}: DueDatePickerProps) {
	const [date, setDate] = useState<Date | undefined>(() =>
		parseDateValue(defaultValue),
	);
	const [isOpen, setIsOpen] = useState(false);
	const [timeZone, setTimeZone] = useState<string>();

	useEffect(() => {
		setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
	}, []);

	return (
		<>
			<input type="hidden" name="dueDate" value={toDateValue(date)} readOnly />

			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="outline"
						disabled={disabled}
						aria-invalid={invalid}
						aria-describedby={invalid ? errorId : undefined}
						className={cn(
							"w-full justify-start text-left font-normal",
							!date && "text-muted-foreground",
							invalid && "border-destructive",
						)}
					>
						<CalendarDays aria-hidden="true" />
						{date ? formatDateLabel(date) : "Select a due date"}
					</Button>
				</PopoverTrigger>

				<PopoverContent align="start" className="w-auto p-0">
					<Calendar
						mode="single"
						selected={date}
						onSelect={(selectedDate) => {
							setDate(selectedDate);

							onValueChange?.(toDateValue(selectedDate));

							if (selectedDate) {
								setIsOpen(false);
							}
						}}
						timeZone={timeZone}
					/>

					<div className="border-t border-border p-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="w-full"
							disabled={!date}
							onClick={() => {
								setDate(undefined);
								onValueChange?.("");
							}}
						>
							<X aria-hidden="true" />
							Clear date
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</>
	);
}
