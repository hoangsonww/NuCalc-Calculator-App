import { test, expect } from "@playwright/test";

test.describe("NuCalc Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for calculator to be visible
    await expect(page.locator("#calculator")).toBeVisible();
  });

  test("should display initial state correctly", async ({ page }) => {
    const display = page.locator("#display");
    await expect(display).toHaveText("0");

    const previousValue = page.locator("#previous-value");
    await expect(previousValue).toBeEmpty();

    const activeOperation = page.locator("#active-operation");
    await expect(activeOperation).toBeEmpty();
  });

  test("should handle digit input", async ({ page }) => {
    await page.click("#5-button");
    await expect(page.locator("#display")).toHaveText("5");

    await page.click("#3-button");
    await expect(page.locator("#display")).toHaveText("53");
  });

  test("should handle decimal input", async ({ page }) => {
    await page.click("#3-button");
    await page.click("#.-button");
    await page.click("#1-button");
    await page.click("#4-button");
    await expect(page.locator("#display")).toHaveText("3.14");
  });

  test("should perform addition", async ({ page }) => {
    await page.click("#5-button");
    await page.click("#add-button");
    await page.click("#3-button");
    await page.click("#equals-button");
    await expect(page.locator("#display")).toHaveText("8");
  });

  test("should perform subtraction", async ({ page }) => {
    await page.click("#9-button");
    await page.click("#subtract-button");
    await page.click("#4-button");
    await page.click("#equals-button");
    await expect(page.locator("#display")).toHaveText("5");
  });

  test("should perform multiplication", async ({ page }) => {
    await page.click("#6-button");
    await page.click("#multiply-button");
    await page.click("#7-button");
    await page.click("#equals-button");
    await expect(page.locator("#display")).toHaveText("42");
  });

  test("should perform division", async ({ page }) => {
    await page.click("#8-button");
    await page.click("#divide-button");
    await page.click("#2-button");
    await page.click("#equals-button");
    await expect(page.locator("#display")).toHaveText("4");
  });

  test("should handle division by zero error", async ({ page }) => {
    await page.click("#5-button");
    await page.click("#divide-button");
    await page.click("#0-button");
    await page.click("#equals-button");

    const errorMessage = page.locator("#error-message");
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText("Cannot divide by zero");
    await expect(page.locator("#display")).toHaveText("Error");
  });

  test("should toggle sign", async ({ page }) => {
    await page.click("#5-button");
    await page.click("#sign-button");
    await expect(page.locator("#display")).toHaveText("-5");

    await page.click("#sign-button");
    await expect(page.locator("#display")).toHaveText("5");
  });

  test("should handle clear button", async ({ page }) => {
    await page.click("#5-button");
    await page.click("#add-button");
    await page.click("#3-button");
    await page.click("#clear-button");
    await expect(page.locator("#display")).toHaveText("5");

    await page.click("#clear-button");
    await expect(page.locator("#display")).toHaveText("0");
  });

  test("should handle backspace", async ({ page }) => {
    await page.click("#1-button");
    await page.click("#2-button");
    await page.click("#3-button");
    await page.click("#backspace-button");
    await expect(page.locator("#display")).toHaveText("12");
  });

  test("should handle keyboard input", async ({ page }) => {
    await page.keyboard.type("5");
    await expect(page.locator("#display")).toHaveText("5");

    await page.keyboard.press("+");
    await page.keyboard.type("3");
    await page.keyboard.press("Enter");
    await expect(page.locator("#display")).toHaveText("8");
  });

  test("should chain operations", async ({ page }) => {
    await page.click("#5-button");
    await page.click("#add-button");
    await page.click("#3-button");
    await page.click("#multiply-button");
    await expect(page.locator("#previous-value")).toHaveText("8");

    await page.click("#2-button");
    await page.click("#equals-button");
    await expect(page.locator("#display")).toHaveText("16");
  });

  test("should format large numbers with commas", async ({ page }) => {
    await page.click("#1-button");
    await page.click("#2-button");
    await page.click("#3-button");
    await page.click("#4-button");
    await page.click("#5-button");
    await expect(page.locator("#display")).toHaveText("12,345");
  });

  test("should be responsive on mobile", async ({ page, isMobile }) => {
    const calculator = page.locator("#calculator");
    await expect(calculator).toBeVisible();

    // Check if buttons are clickable
    await page.click("#5-button");
    await page.click("#add-button");
    await page.click("#3-button");
    await page.click("#equals-button");
    await expect(page.locator("#display")).toHaveText("8");
  });

  test("should have proper ARIA attributes", async ({ page }) => {
    const display = page.locator("#display");
    await expect(display).toHaveAttribute("aria-invalid", "false");

    // Trigger an error
    await page.click("#5-button");
    await page.click("#divide-button");
    await page.click("#0-button");
    await page.click("#equals-button");

    await expect(display).toHaveAttribute("aria-invalid", "true");

    const errorMessage = page.locator("#error-message");
    await expect(errorMessage).toHaveAttribute("role", "alert");
    await expect(errorMessage).toHaveAttribute("aria-live", "polite");
  });

  test("should clear error on new input", async ({ page }) => {
    // Trigger error
    await page.click("#5-button");
    await page.click("#divide-button");
    await page.click("#0-button");
    await page.click("#equals-button");

    const errorMessage = page.locator("#error-message");
    await expect(errorMessage).toBeVisible();

    // Start new input
    await page.click("#5-button");
    await expect(errorMessage).not.toBeVisible();
    await expect(page.locator("#display")).toHaveText("5");
  });

  test("should handle complex calculation sequence", async ({ page }) => {
    // (10 - 5) × 2 + 3 = 13
    await page.click("#1-button");
    await page.click("#0-button");
    await page.click("#subtract-button");
    await page.click("#5-button");
    await page.click("#multiply-button");
    await page.click("#2-button");
    await page.click("#add-button");
    await page.click("#3-button");
    await page.click("#equals-button");
    await expect(page.locator("#display")).toHaveText("13");
  });

  test("should handle decimal operations", async ({ page }) => {
    await page.click("#1-button");
    await page.click("#.-button");
    await page.click("#5-button");
    await page.click("#multiply-button");
    await page.click("#2-button");
    await page.click("#equals-button");
    await expect(page.locator("#display")).toHaveText("3");
  });

  test("should prevent multiple decimal points", async ({ page }) => {
    await page.click("#1-button");
    await page.click("#.-button");
    await page.click("#5-button");
    await page.click("#.-button"); // Should be ignored
    await page.click("#3-button");
    await expect(page.locator("#display")).toHaveText("1.53");
  });
});
