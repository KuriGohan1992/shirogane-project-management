import { expect, test } from "@playwright/test";

test.describe("authenticated Shiro experience", () => {
	test("loads every primary dashboard destination", async ({ page }) => {
		const destinations = [
			["/dashboard", "Dashboard"],
			["/projects", "Projects"],
			["/team", "Team"],
			["/calendar", "Calendar"],
			["/settings", "Settings"],
		] as const;

		for (const [href, heading] of destinations) {
			await page.goto(href);

			await expect(
				page.getByRole("heading", { name: heading, level: 1 }),
			).toBeVisible();
		}

		await page.goto("/analytics");

		const emptyAnalytics = page.getByRole("heading", {
			name: "No projects to analyze",
		});

		const populatedAnalytics = page.getByText("Completed tasks", {
			exact: true,
		});

		await expect(emptyAnalytics.or(populatedAnalytics).first()).toBeVisible();
	});

	test("creates a project and a task, then cleans the project up", async ({
		page,
	}) => {
		const suffix = Date.now();
		const projectName = `Playwright ${suffix}`;
		const taskTitle = `Smoke task ${suffix}`;

		await page.goto("/projects");

		await page.getByRole("button", { name: "New Project" }).click();
		await expect(
			page.getByRole("heading", { name: "Create project" }),
		).toBeVisible();

		await page.getByLabel("Project name").fill(projectName);
		await page
			.getByLabel("Description", { exact: true })
			.fill("Created automatically by the Shiro Playwright suite.");

		await page.getByRole("button", { name: "Create project" }).click();

		await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+$/);
		await expect(
			page.getByRole("heading", { name: projectName, level: 1 }),
		).toBeVisible();

		await page.getByRole("button", { name: "Add task" }).first().click();
		await expect(
			page.getByRole("heading", { name: "Create task" }),
		).toBeVisible();

		await page.getByLabel("Task title").fill(taskTitle);
		await page
			.getByLabel("Description", { exact: true })
			.fill("Created automatically by Playwright.");
		await page.getByRole("button", { name: "Create task" }).click();

		await expect(
			page.getByRole("heading", { name: "Create task" }),
		).not.toBeVisible();
		await expect(page.getByText(taskTitle, { exact: true })).toBeVisible();

		await page
			.getByRole("button", { name: `Actions for ${projectName}` })
			.click();

		await page
			.getByRole("button", { name: "Delete project", exact: true })
			.click();

		await expect(
			page.getByRole("heading", { name: `Delete ${projectName}?` }),
		).toBeVisible();
		await page.getByRole("button", { name: "Delete project" }).click();

		await expect(page).toHaveURL(/\/projects$/);
		await expect(
			page.getByText(projectName, { exact: true }),
		).not.toBeVisible();
	});

	test("supports the global search keyboard shortcut", async ({ page }) => {
		await page.goto("/dashboard");

		const search = page.locator('[data-keyboard-action="global-search"]');

		await page.keyboard.press("Control+K");
		await expect(search).toBeFocused();
	});

	test("collapses and expands the desktop sidebar", async ({ page }) => {
		await page.goto("/dashboard");

		const collapse = page.getByRole("button", { name: "Collapse sidebar" });

		await collapse.click();

		await expect(
			page.getByRole("button", { name: "Expand sidebar" }),
		).toBeVisible();

		await page.getByRole("button", { name: "Expand sidebar" }).click();

		await expect(
			page.getByRole("button", { name: "Collapse sidebar" }),
		).toBeVisible();
	});
});
