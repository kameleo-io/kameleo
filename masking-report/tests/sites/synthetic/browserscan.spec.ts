import { expect, test } from "../../../utils/browserFixture.ts";
import { scrollDown } from "../../../utils/pageUtils.ts";

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

    await scrollDown(page);

    const authenticityLocator = page.getByText("Browser fingerprint authenticity: ");
    const percentLocator = authenticityLocator.locator("//following-sibling::*[1]");
    const percent = parseInt((await percentLocator.textContent())?.slice(0, -1) ?? "");

    const percentGoal = 97;

    // list of issues in the format of "Issue: -5% Explanatory paragraph"
    // we look for -x% with a regex, then only keep the part ending with the %
    const deductions = (await page.locator("li").filter({ hasText: /-\d+%/ }).allInnerTexts()).map(
        (deduction) => /^.*?-\d+%/s.exec(deduction)?.[0].trim().replace(/\n/g, ": ") ?? deduction,
    );

    const message =
        `Browser fingerprint authenticity was ${percent}%, expected at least ${percentGoal}%` +
        `\nDeductions:\n\t${deductions.join("\n\t")}`;
    expect(percent >= percentGoal && deductions.length <= 1, message).toBe(true);
});
