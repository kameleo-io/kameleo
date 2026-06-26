import { expect, test } from "../../../utils/browserFixture.ts";

test("Cloudflare Challenge", async ({ page }) => {
    await page.goto("https://2captcha.com/demo/cloudflare-turnstile-challenge");
    await page.waitForTimeout(5_000); // wait for Cloudflare security verification
    await expect(page).toHaveTitle("Cloudflare Challenge demo: Sample page with Cloudflare Challenge Turnstile");
});
