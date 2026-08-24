// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	BOARD_KEYBOARD_COMMAND_EVENT,
	clickKeyboardActionTarget,
	dispatchBoardKeyboardCommand,
	focusKeyboardActionTarget,
	hasOpenKeyboardBlockingOverlay,
	isEditableKeyboardTarget,
} from "@/lib/keyboard-shortcuts";

describe("keyboard shortcut helpers", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("detects editable targets", () => {
		const input = document.createElement("input");
		const wrapper = document.createElement("div");
		const editable = document.createElement("div");

		editable.setAttribute("contenteditable", "true");
		wrapper.append(editable);

		expect(isEditableKeyboardTarget(input)).toBe(true);
		expect(isEditableKeyboardTarget(editable)).toBe(true);
		expect(isEditableKeyboardTarget(wrapper)).toBe(false);
		expect(isEditableKeyboardTarget(null)).toBe(false);
	});

	it("dispatches cancellable board commands", () => {
		window.addEventListener(
			BOARD_KEYBOARD_COMMAND_EVENT,
			(event) => event.preventDefault(),
			{ once: true },
		);

		expect(dispatchBoardKeyboardCommand("archive-selected")).toBe(true);
	});

	it("focuses and selects input keyboard targets", () => {
		const input = document.createElement("input");

		input.dataset.keyboardAction = "global-search";
		input.value = "query";
		document.body.append(input);

		const select = vi.spyOn(input, "select");

		expect(focusKeyboardActionTarget("global-search")).toBe(true);
		expect(document.activeElement).toBe(input);
		expect(select).toHaveBeenCalledOnce();
	});

	it("clicks matching action targets", () => {
		const button = document.createElement("button");

		button.dataset.keyboardAction = "new-project";
		document.body.append(button);

		const click = vi.spyOn(button, "click");

		expect(clickKeyboardActionTarget("new-project")).toBe(true);
		expect(click).toHaveBeenCalledOnce();
	});

	it("returns false when a target does not exist", () => {
		expect(focusKeyboardActionTarget("task-filter")).toBe(false);
		expect(clickKeyboardActionTarget("new-project")).toBe(false);
	});

	it("detects open blocking overlays", () => {
		expect(hasOpenKeyboardBlockingOverlay()).toBe(false);

		const dialog = document.createElement("div");

		dialog.dataset.slot = "dialog-content";
		dialog.dataset.state = "open";
		document.body.append(dialog);

		expect(hasOpenKeyboardBlockingOverlay()).toBe(true);
	});
});
