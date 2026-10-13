import { expect, test } from "@playwright/test";

// Runs on the session saved by the setup project, so it proves the saved
// session is reused rather than the form being driven again.
test("the seeded student sees their dashboard and submissions", async ({ page }) => {
  await page.goto("/student");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome back, Uzoma");
  await expect(page.getByText("Total Submissions")).toBeVisible();
  await expect(page.getByText("IntelliGrade SaaS Architecture")).toBeVisible();
  await expect(page.getByText("SIWES 6-Month Logbook")).toBeVisible();
});
