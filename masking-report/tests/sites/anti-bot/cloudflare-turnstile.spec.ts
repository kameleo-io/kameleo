import { expect, test } from "../../../utils/browserFixture.ts";

test.describe(() => {
    test.use({
        browserSettings: {
            additionalOptions: [{ key: "kameleo:forceOpenShadowRoot", value: true }],
        },
    });
    test("Cloudflare Turnstile", async ({ page }) => {
        await page.goto("https://2captcha.com/demo/cloudflare-turnstile");

        const iframeLocator = page.frameLocator("#cf-turnstile iframe[src^='https://challenges.cloudflare.com']");
        await iframeLocator.locator("text=Verify you are human").click();

        await page.waitForTimeout(5_000); // for video presentation purposes

        const successLocator = iframeLocator.locator("#success");
        await successLocator.waitFor({ state: "attached" });
        await expect(successLocator).toBeVisible();
    });
});
