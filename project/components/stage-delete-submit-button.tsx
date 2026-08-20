"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type StageDeleteSubmitButtonProps = {
	disabled?: boolean;
};

export function StageDeleteSubmitButton({
	disabled = false,
}: StageDeleteSubmitButtonProps) {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" variant="destructive" disabled={disabled || pending}>
			{pending ? "Deleting..." : "Delete stage"}
		</Button>
	);
}
