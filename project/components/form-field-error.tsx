type FormFieldErrorProps = {
	id: string;
	messages?: string[];
};

export function FormFieldError({ id, messages }: FormFieldErrorProps) {
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
