import assert from "assert";

import { expect, test } from "../../../utils/browserFixture.ts";

test("Cloudflare Challenge", async ({ page }) => {
    await page.goto("https://www.scrapingcourse.com/");

    const siteLocator = page
        .locator(".card-container")
        .filter({ has: page.getByRole("heading", { name: "Cloudflare Challenge", exact: true }) })
        .getByRole("link", { name: "See Page" });

    await page.waitForTimeout(1_000); // for video presentation purposes
    await siteLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1_000); // for video presentation purposes
    await siteLocator.click();
    await page.waitForTimeout(3_000); // wait for Cloudflare security verification

    try {
        await expect(page.getByText("You bypassed the Cloudflare challenge")).toBeVisible();
    } catch {
        // retry by clicking the checkbox
        const locator = page.locator('input[name="cf-turnstile-response"]').locator("..");
        await locator.waitFor();
        const box = await locator.boundingBox();
        expect(box).not.toBeNull();
        assert.ok(box);
        await locator.click({ position: { x: box.height / 2, y: box.height / 2 } });

        await expect(page.getByText("You bypassed the Cloudflare challenge")).toBeVisible();
    }

    await page.waitForTimeout(1_000); // for video presentation purposes
});
