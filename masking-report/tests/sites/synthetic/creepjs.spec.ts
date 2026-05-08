import { expect, test } from "../../../utils/browserFixture.js";
import { autoScroll } from "../../../utils/pageUtils.js";

test("CreepJS", async ({ page }) => {
    await page.goto("https://abrahamjuliot.github.io/creepjs/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3_000); // makes video smoother

    await autoScroll(page);

    await page.goto("https://abrahamjuliot.github.io/creepjs/tests/machine.html");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3_000); // makes video smoother

    const successSelector = "span.pass",
        failureSelector = "span.fail";
    await page.locator(`${successSelector}, ${failureSelector}`).first().waitFor();
    const successCount = await page.locator(successSelector).count();
    const failedItems = (await page.locator(`div:has(> ${failureSelector})`).allInnerTexts()).map((text) => text.trim());

    expect(failedItems.length === 0 && successCount > 0, `Issues:\n\t${failedItems.join("\n\t")}`).toBe(true);
});
