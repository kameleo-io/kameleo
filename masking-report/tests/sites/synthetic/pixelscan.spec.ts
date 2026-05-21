import { expect, type Page, test } from "../../../utils/browserFixture.ts";
import { scrollDown } from "../../../utils/pageUtils.ts";

test("Pixelscan", async ({ page }) => {
    await page.goto("https://pixelscan.net/");

    const browserIntegritySelector = "pxlscn-browser-integrity";
    const fingerPrintMaskingSelector = "pxlscn-fingerprint-masking";
    const botDetectionSelector = "pxlscn-bot-detection";
    const locationMaskingSelector = "pxlscn-location-masking";

    // click "Scan My Browser Now" button
    await page.locator("pxlscn-main-banner a[href='/fingerprint-check']").click();

    // wait for loading
    await Promise.all(
        [browserIntegritySelector, fingerPrintMaskingSelector, botDetectionSelector, locationMaskingSelector].map((selector) =>
            page.locator(`${selector}:not(:has(.checker-card__icon--loading))`).waitFor({ timeout: 60_000 }),
        ),
    );

    await page.waitForTimeout(5_000); // for video presentation purposes
    await scrollDown(page);

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
    const locator = page.locator(`${selector} .checker-card`);
    await locator.waitFor();
    const classList = await locator.getAttribute("class");
    return !!classList && !classList.includes("checker-card--failed");
}
