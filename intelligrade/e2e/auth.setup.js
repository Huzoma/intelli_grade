import { expect, test as setup } from "@playwright/test";

// The one place the sign in form is driven. Every later test starts from the
// session saved here instead of signing in through the form again.
const STUDENT_AUTH_FILE = "e2e/.auth/student.json";

setup("signs the seeded student in once", async ({ page }) => {
  await page.goto("/login");

  // The form is prefilled with the seeded student, so one click signs in.
  await page.getByRole("button", { name: /sign in to dashboard/i }).click();

  await page.waitForURL("**/student");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome back, Uzoma");

  await page.context().storageState({ path: STUDENT_AUTH_FILE });
});
