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

    await expect(page.getByText("✔").first()).toBeVisible();
    await expect(page.getByText("✖")).toHaveCount(0);
});
