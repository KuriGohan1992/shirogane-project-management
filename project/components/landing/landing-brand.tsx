"use client";

import type { MouseEvent } from "react";

import { ShiroBrand } from "@/components/shiro-brand";

export function LandingBrand() {
	function handleClick(event: MouseEvent<HTMLAnchorElement>) {
		// Preserve normal browser behavior for modified clicks.
		if (
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey ||
			event.button !== 0
		) {
			return;
		}

		event.preventDefault();

		if (window.scrollY <= 8) {
			window.location.reload();
			return;
		}

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}

	return <ShiroBrand priority onClick={handleClick} />;
}