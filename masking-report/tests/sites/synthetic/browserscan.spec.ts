import { expect, test } from "../../../utils/kameleoBrowserFixture.js";
import { autoScroll } from "../../../utils/pageUtils.js";

test("BrowserScan", async ({ page }) => {
    await page.goto("https://www.browserscan.net/");

    // Dismiss consent popup if present
    await page.click("button.fc-close").catch(() => undefined);

    // Wait for the "Unexpand" button which appears on <100% results after loading
    // If it doesn't appear, we have a legitimate 100%
    await page
        .locator("button")
        .getByText("Unexpand")
        .waitFor({ state: "visible", timeout: 15_000 })
        .catch(() => undefined);

    await autoScroll(page);

    const authenticityLocator = page.getByText("Browser fingerprint authenticity: ");
    const percentLocator = authenticityLocator.locator("//following-sibling::*[1]");
    const percent = parseInt((await percentLocator.textContent())?.slice(0, -1) ?? "");

    const percentGoal = 97;
    expect(percent).toBeGreaterThanOrEqual(percentGoal);
});
