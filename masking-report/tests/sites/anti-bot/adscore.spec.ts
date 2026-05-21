import { expect, test } from "../../../utils/browserFixture.ts";
import { env } from "../../../utils/common.ts";

test("Adscore", async ({ page }) => {
    const targetSite = "https://example.com";
    const apiKey = env("ADSCORE_API_KEY");
    await page.goto(`https://c.adsco.re/r#apikey=${encodeURIComponent(apiKey)}&type=1&data=${encodeURIComponent(targetSite)}`);

    const locator = page.frameLocator(`iframe[src^='${targetSite}']`).locator("h1");
    await locator.waitFor();
    await expect(locator).toHaveText("Example Domain");
});
