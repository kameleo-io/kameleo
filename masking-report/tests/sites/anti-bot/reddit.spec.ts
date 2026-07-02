import { expect, test } from "../../../utils/browserFixture.ts";

test("Reddit", async ({ page }) => {
    await page.goto("https://www.reddit.com/r/popular/best/?geo_filter=us");
    await page.waitForTimeout(5_000); // wait for the page to fully load
    await expect(page).toHaveTitle("r/popular");
});
