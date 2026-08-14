import { test } from "../../../utils/browserFixture.ts";

test("Vinted", async ({ page }) => {
    await page.goto("https://www.vinted.com/");

    // select region
    await page.waitForTimeout(3_000); // wait for region popup
    await page
        .getByText("United States")
        .click({ timeout: 3_000 })
        .catch(() => undefined);

    // accept cookies
    await page.waitForTimeout(3_000); // wait for cookie popup
    await page
        .getByText("Accept all")
        .first()
        .click({ timeout: 3_000 })
        .catch(() => undefined);

    // search
    await page.waitForTimeout(1_000); // for video presentation purposes
    await page.fill("input#search_text", "glasses");
    await page.press("input#search_text", "Enter");

    // click item and buy
    await page.locator('a[href^="/items/"]').nth(2).click();
    await page.waitForTimeout(2_000); // for video presentation purposes
    await page.getByText("Buy now").click();
    await page.waitForTimeout(2_000); // for video presentation purposes
});
