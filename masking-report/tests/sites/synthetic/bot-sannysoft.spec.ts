import { expect, test } from "../../../utils/kameleoBrowserFixture.js";
import { autoScroll } from "../../../utils/pageUtils.js";

test("Sannysoft", async ({ page, browserProduct }) => {
    await page.goto("https://bot.sannysoft.com/");

    await page.waitForLoadState("networkidle");
    await autoScroll(page);

    await expect(page.locator(".passed")).not.toHaveCount(0);

    // this failure is a false positive for Junglefox (and native Firefox)
    const exceptionForFirefox = browserProduct == "firefox" ? ":not(#chrome-result)" : "";
    await expect(page.locator(`.failed${exceptionForFirefox}`)).toHaveCount(0);
});
