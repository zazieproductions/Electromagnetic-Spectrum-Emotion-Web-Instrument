import { expect, test } from "@playwright/test";

test.describe("instrument boot path", () => {
  test("renders the full interface chrome", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("THE EMOTION SPECTRUM")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Power On/ })
    ).toBeVisible();
    await expect(page.locator("[data-cellkey]")).not.toHaveCount(0);
    await expect(page.getByRole("button", { name: /Ribbon/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Theremin/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Drone/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Arp/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Panic" })).toBeVisible();
  });

  test("power-on gesture clears the audio gate overlay", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /Power On/ }).click();
    await expect(page.getByRole("button", { name: /Power On/ })).not.toBeVisible();
  });
});
