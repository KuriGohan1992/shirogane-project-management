export const BOARD_KEYBOARD_COMMAND_EVENT = "shiro:board-keyboard-command";

export const KEYBOARD_ACTION_TARGETS = {
	globalSearch: "global-search",
	newProject: "new-project",
	projectFilter: "project-filter",
	taskFilter: "task-filter",
} as const;

export type BoardKeyboardCommand =
	| "left"
	| "right"
	| "up"
	| "down"
	| "open"
	| "toggle-selection-mode"
	| "toggle-focused-selection"
	| "archive-selected"
	| "delete-selected"
	| "escape";

export type BoardKeyboardCommandDetail = {
	command: BoardKeyboardCommand;
};

export function dispatchBoardKeyboardCommand(command: BoardKeyboardCommand) {
	const event = new CustomEvent<BoardKeyboardCommandDetail>(
		BOARD_KEYBOARD_COMMAND_EVENT,
		{
			cancelable: true,
			detail: {
				command,
			},
		},
	);

	window.dispatchEvent(event);

	return event.defaultPrevented;
}

export function isEditableKeyboardTarget(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) {
		return false;
	}

	return Boolean(
		target.closest('input, textarea, select, [contenteditable="true"]'),
	);
}

export function hasOpenKeyboardBlockingOverlay() {
	return Boolean(
		document.querySelector(
			[
				'[data-slot="dialog-content"][data-state="open"]',
				'[data-slot="alert-dialog-content"][data-state="open"]',
				'[data-slot="sheet-content"][data-state="open"]',
				'[data-slot="popover-content"][data-state="open"]',
				'[data-slot="select-content"][data-state="open"]',
			].join(","),
		),
	);
}

export function focusKeyboardActionTarget(
	action: (typeof KEYBOARD_ACTION_TARGETS)[keyof typeof KEYBOARD_ACTION_TARGETS],
) {
	const target = document.querySelector<HTMLElement>(
		`[data-keyboard-action="${action}"]`,
	);

	if (!target) {
		return false;
	}

	target.focus();

	if (target instanceof HTMLInputElement) {
		target.select();
	}

	return true;
}

export function clickKeyboardActionTarget(
	action: (typeof KEYBOARD_ACTION_TARGETS)[keyof typeof KEYBOARD_ACTION_TARGETS],
) {
	const target = document.querySelector<HTMLElement>(
		`[data-keyboard-action="${action}"]`,
	);

	if (!target) {
		return false;
	}

	target.click();

	return true;
}
