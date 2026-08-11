import { expect, test } from "../../../utils/browserFixture.ts";

test.describe(() => {
    test.use({
        browserSettings: async ({ browserProduct }, use) => {
            await use(browserProduct === "firefox" ? undefined : { arguments: ["--disable-http2"] });
        },
    });
    test("Reddit", async ({ page }) => {
        await page.goto("https://www.reddit.com/r/popular/best/?geo_filter=us");
        await page.waitForTimeout(5_000); // wait for the page to fully load
        await expect(page).toHaveTitle("r/popular");
    });
});
