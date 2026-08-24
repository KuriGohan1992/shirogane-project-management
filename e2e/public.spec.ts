import { expect, test } from "@playwright/test";

test.describe("public landing experience", () => {
	test("shows the Shiro landing page and primary calls to action", async ({
		page,
	}) => {
		await page.goto("/");

		await expect(
			page.getByRole("heading", {
				name: /Keep projects moving/i,
				level: 1,
			}),
		).toBeVisible();

		const header = page.getByRole("banner");

		await expect(
			header.getByRole("button", { name: "Get started" }),
		).toBeVisible();

		await expect(header.getByRole("button", { name: "Sign in" })).toBeVisible();
	});

	test("navigates to landing sections with anchors", async ({ page }) => {
		await page.goto("/");

		await page
			.getByRole("navigation", { name: "Landing page navigation" })
			.getByRole("link", { name: "Product" })
			.click();

		await expect(page).toHaveURL(/#product$/);
		await expect(
			page.getByRole("heading", {
				name: "Everything around the work, in one place.",
			}),
		).toBeVisible();
	});

	test("switches between light and dark themes", async ({ page }) => {
		await page.goto("/");

		const root = page.locator("html");
		const darkButton = page.getByRole("button", {
			name: "Switch to dark mode",
		});

		if (await darkButton.isVisible()) {
			await darkButton.click();
			await expect(root).toHaveClass(/dark/);
			await expect(
				page.getByRole("button", { name: "Switch to light mode" }),
			).toBeVisible();
		} else {
			await page.getByRole("button", { name: "Switch to light mode" }).click();
			await expect(root).toHaveClass(/light/);
		}
	});
});
