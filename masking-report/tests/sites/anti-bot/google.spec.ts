import { setTimeout } from "timers/promises";

import { expect, test } from "../../../utils/kameleoBrowserFixture.js";

test("Google", async ({ page }) => {
    await page.goto("https://google.com/?hl=en");

    // Dismiss consent popup if present
    await page.click("button:has-text('Accept all')").catch(() => undefined);

    await page.fill("[name='q']", "google wikipedia");
    await page.press("[name='q']", "Enter");

    await page.waitForSelector("h1:has-text('Search Results')");
    await setTimeout(3_000);

    const pageText = await page.textContent("body");
    expect(pageText).toContain("en.wikipedia.org");
});
