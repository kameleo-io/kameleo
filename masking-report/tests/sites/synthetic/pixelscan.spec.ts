import { expect, type Page, test } from "../../../utils/kameleoBrowserFixture.js";
import { autoScroll } from "../../../utils/pageUtils.js";

test("Pixelscan Fingerprint", async ({ page }) => {
    await page.goto("https://pixelscan.net/");

    const browserIntegritySelector = "pxlscn-browser-integrity";
    const fingerPrintMaskingSelector = "pxlscn-fingerprint-masking";
    const botDetectionSelector = "pxlscn-bot-detection";
    const locationMaskingSelector = "pxlscn-location-masking";

    // click "Start check" button
    await page.locator("pxlscn-main-banner a[href='/fingerprint-check']").click();

    // wait for loading
    await Promise.all(
        [browserIntegritySelector, fingerPrintMaskingSelector, botDetectionSelector, locationMaskingSelector].map((selector) =>
            page.locator(`${selector}:not(:has(.shimmer))`).waitFor({ timeout: 60_000 }),
        ),
    );

    await autoScroll(page);

    // get results
    const result = {
        browserIntegrity: await getSuccess(page, browserIntegritySelector),
        fingerPrintMasking: await getSuccess(page, fingerPrintMaskingSelector),
        botDetection: await getSuccess(page, botDetectionSelector),
        locationMasking: await getSuccess(page, locationMaskingSelector),
    };
    const goodResult = {
        browserIntegrity: true,
        fingerPrintMasking: true,
        botDetection: true,
        locationMasking: true,
    };

    expect(result).toEqual(goodResult);
});

async function getSuccess(page: Page, selector: string): Promise<boolean> {
    const locator = page.locator(`${selector} .tool-icon-svg`);
    await locator.waitFor();
    const classList = await locator.getAttribute("class");
    return !!classList && !classList.includes("bg-err");
}
