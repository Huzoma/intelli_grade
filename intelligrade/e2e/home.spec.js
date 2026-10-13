import { expect, test } from "@playwright/test";

test("the landing page serves the marketing hero", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/IntelliGrade/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Beautifully Automated");
});
