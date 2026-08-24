"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import {
	clickKeyboardActionTarget,
	dispatchBoardKeyboardCommand,
	focusKeyboardActionTarget,
	hasOpenKeyboardBlockingOverlay,
	isEditableKeyboardTarget,
	KEYBOARD_ACTION_TARGETS,
} from "@/lib/keyboard-shortcuts";

const NAVIGATION_SHORTCUTS: Record<string, string> = {
	d: "/dashboard",
	p: "/projects",
	t: "/team",
	a: "/analytics",
	c: "/calendar",
	s: "/settings",
};

const NAVIGATION_SEQUENCE_TIMEOUT_MS = 900;

function isProjectBoardPath(pathname: string) {
	return /^\/projects\/[^/]+(?:\/|$)/.test(pathname);
}

export function DashboardKeyboardShortcuts() {
	const pathname = usePathname();
	const router = useRouter();

	const [helpOpen, setHelpOpen] = useState(false);

	const pendingNavigationRef = useRef(false);
	const navigationTimeoutRef = useRef<number | undefined>(undefined);

	useEffect(() => {
		function clearNavigationSequence() {
			pendingNavigationRef.current = false;

			if (navigationTimeoutRef.current !== undefined) {
				window.clearTimeout(navigationTimeoutRef.current);
				navigationTimeoutRef.current = undefined;
			}
		}

		function startNavigationSequence() {
			clearNavigationSequence();

			pendingNavigationRef.current = true;
			navigationTimeoutRef.current = window.setTimeout(
				clearNavigationSequence,
				NAVIGATION_SEQUENCE_TIMEOUT_MS,
			);
		}

		function handleKeyDown(event: KeyboardEvent) {
			const key = event.key.toLowerCase();

			function dispatchBoardCommand(
				command: Parameters<typeof dispatchBoardKeyboardCommand>[0],
			) {
				if (dispatchBoardKeyboardCommand(command)) {
					event.preventDefault();
				}
			}

			if (event.key === "Escape" && isEditableKeyboardTarget(event.target)) {
				clearNavigationSequence();

				if (event.target instanceof HTMLElement) {
					event.target.blur();
				}

				return;
			}

			if (hasOpenKeyboardBlockingOverlay()) {
				clearNavigationSequence();
				return;
			}

			if ((event.metaKey || event.ctrlKey) && !event.altKey && key === "k") {
				event.preventDefault();
				clearNavigationSequence();
				focusKeyboardActionTarget(KEYBOARD_ACTION_TARGETS.globalSearch);
				return;
			}

			if (
				(event.metaKey || event.ctrlKey) &&
				!event.altKey &&
				event.code === "Slash"
			) {
				let filterTarget:
					| (typeof KEYBOARD_ACTION_TARGETS)["projectFilter"]
					| (typeof KEYBOARD_ACTION_TARGETS)["taskFilter"]
					| undefined;

				if (pathname === "/projects") {
					filterTarget = KEYBOARD_ACTION_TARGETS.projectFilter;
				} else if (isProjectBoardPath(pathname)) {
					filterTarget = KEYBOARD_ACTION_TARGETS.taskFilter;
				}

				if (filterTarget) {
					event.preventDefault();
					clearNavigationSequence();

					focusKeyboardActionTarget(filterTarget);
				}

				return;
			}

			if (isEditableKeyboardTarget(event.target)) {
				clearNavigationSequence();
				return;
			}

			if (event.metaKey || event.ctrlKey || event.altKey) {
				clearNavigationSequence();
				return;
			}

			if (event.key === "?") {
				if (event.repeat) {
					return;
				}

				event.preventDefault();
				clearNavigationSequence();
				setHelpOpen(true);
				return;
			}

			if (pendingNavigationRef.current) {
				const destination = NAVIGATION_SHORTCUTS[key];

				clearNavigationSequence();

				if (destination) {
					event.preventDefault();
					router.push(destination);
					return;
				}
			}

			if (key === "g" && !event.repeat) {
				event.preventDefault();
				startNavigationSequence();
				return;
			}

			if (pathname === "/projects" && key === "n" && !event.repeat) {
				const opened = clickKeyboardActionTarget(
					KEYBOARD_ACTION_TARGETS.newProject,
				);

				if (opened) {
					event.preventDefault();
				}

				return;
			}

			if (!isProjectBoardPath(pathname)) {
				return;
			}

			if (event.repeat && !["h", "j", "k", "l"].includes(key)) {
				return;
			}

			if (key === "h" || event.key === "ArrowLeft") {
				dispatchBoardCommand("left");
				return;
			}

			if (key === "l" || event.key === "ArrowRight") {
				dispatchBoardCommand("right");
				return;
			}

			if (key === "j" || event.key === "ArrowDown") {
				dispatchBoardCommand("down");
				return;
			}

			if (key === "k" || event.key === "ArrowUp") {
				dispatchBoardCommand("up");
				return;
			}

			if (event.key === "Enter") {
				dispatchBoardCommand("open");
				return;
			}

			if (key === "s") {
				dispatchBoardCommand("toggle-selection-mode");
				return;
			}

			if (event.key === " ") {
				dispatchBoardCommand("toggle-focused-selection");
				return;
			}

			if (key === "a") {
				dispatchBoardCommand("archive-selected");
				return;
			}

			if (event.key === "Backspace" || event.key === "Delete") {
				dispatchBoardCommand("delete-selected");
				return;
			}

			if (event.key === "Escape") {
				dispatchBoardCommand("escape");
			}
		}

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			clearNavigationSequence();
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [pathname, router]);

	return <KeyboardShortcutsDialog open={helpOpen} onOpenChange={setHelpOpen} />;
}
