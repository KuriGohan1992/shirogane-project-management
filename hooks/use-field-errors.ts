"use client";

import { useEffect, useRef, useState } from "react";

export function useFieldErrors<TField extends string>(
	errors: Partial<Record<TField, string[]>> | undefined,
) {
	const [clearedFields, setClearedFields] = useState<Set<TField>>(
		() => new Set<TField>(),
	);

	const previousErrors = useRef(errors);

	useEffect(() => {
		if (previousErrors.current !== errors) {
			previousErrors.current = errors;
			setClearedFields(new Set<TField>());
		}
	}, [errors]);

	function getFieldErrors(field: TField) {
		if (clearedFields.has(field)) {
			return undefined;
		}

		return errors?.[field];
	}

	function clearFieldError(field: TField) {
		setClearedFields((current) => {
			const next = new Set(current);
			next.add(field);
			return next;
		});
	}

	return {
		getFieldErrors,
		clearFieldError,
	};
}
