import { expect, test } from "../../../utils/browserFixture.ts";
import { scrollDown } from "../../../utils/pageUtils.ts";

test("CreepJS", async ({ page }) => {
    await page.goto("https://abrahamjuliot.github.io/creepjs/");
    await page.waitForTimeout(6_000); // for video presentation purposes

    await scrollDown(page);

    await page.goto("https://abrahamjuliot.github.io/creepjs/tests/machine.html");
    await page.waitForTimeout(3_000); // for video presentation purposes

    const successSelector = "span.pass",
        failureSelector = "span.fail";
    await page.locator(`${successSelector}, ${failureSelector}`).first().waitFor();
    const successCount = await page.locator(successSelector).count();
    const failedItems = (await page.locator(`div:has(> ${failureSelector})`).allInnerTexts()).map((text) => text.trim());

    expect(failedItems.length === 0 && successCount > 0, `Issues:\n\t${failedItems.join("\n\t")}`).toBe(true);
});
