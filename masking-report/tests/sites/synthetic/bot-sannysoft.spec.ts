import { expect, test } from "../../../utils/browserFixture.ts";
import { scrollDown } from "../../../utils/pageUtils.ts";

test("Sannysoft", async ({ page, browserProduct }) => {
    await page.goto("https://bot.sannysoft.com/");
    await page.waitForTimeout(5_000); // for video presentation purposes

    await scrollDown(page);

    await expect(page.locator(".passed")).not.toHaveCount(0);

    // this failure is a false positive for Junglefox (and native Firefox)
    const exceptionForFirefox = browserProduct == "firefox" ? ":not(#chrome-result)" : "";
    await expect(page.locator(`.failed${exceptionForFirefox}`)).toHaveCount(0);
});
