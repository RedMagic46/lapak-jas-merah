import { test, expect } from "@playwright/test";

test.describe("Lapak Jas Merah E2E Tests", () => {
  test("should load the landing page successfully", async ({ page }) => {
    await page.goto("/");
    
    // Check main branding header or page title
    await expect(page).toHaveTitle(/Lapak Jas Merah/);
    
    // Check main elements
    const heading = page.locator("h1");
    await expect(heading.first()).toContainText(/Lapak Jas Merah/i);
  });

  test("should navigate to the login page", async ({ page }) => {
    await page.goto("/");
    
    // Find the login link and click it
    const loginLink = page.locator("a[href='/login']").first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    } else {
      // Direct navigation if landing links differ
      await page.goto("/login");
    }

    // Verify login form inputs are present
    const identifierInput = page.locator("input[name='identifier']");
    const passwordInput = page.locator("input[name='password']");
    const submitBtn = page.locator("button[type='submit']");

    await expect(identifierInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });

  test("should navigate to the registration page", async ({ page }) => {
    await page.goto("/register");

    // Verify registration inputs
    await expect(page.locator("input[name='fullName']")).toBeVisible();
    await expect(page.locator("input[name='nim']")).toBeVisible();
    await expect(page.locator("input[name='email']")).toBeVisible();
    await expect(page.locator("input[name='password']")).toBeVisible();
    await expect(page.locator("input[name='confirmPassword']")).toBeVisible();
  });
});
