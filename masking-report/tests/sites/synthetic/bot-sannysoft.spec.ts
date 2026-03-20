import { expect, test } from "../../../utils/browserFixture.js";
import { autoScroll } from "../../../utils/pageUtils.js";

test("Sannysoft", async ({ page, browserProduct }) => {
    await page.goto("https://bot.sannysoft.com/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(5_000); // makes video smoother

    await autoScroll(page);

    await expect(page.locator(".passed")).not.toHaveCount(0);

    // this failure is a false positive for Junglefox (and native Firefox)
    const exceptionForFirefox = browserProduct == "firefox" ? ":not(#chrome-result)" : "";
    await expect(page.locator(`.failed${exceptionForFirefox}`)).toHaveCount(0);
});
