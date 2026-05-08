import { expect, test } from "../../../utils/browserFixture.js";

test("Fingerprint.com", async ({ page }) => {
    await page.goto("https://demo.fingerprint.com/playground", { waitUntil: "networkidle" });

    const successSelector = "[class*='SignalTable_green']";
    const failureSelector = "[class*='SignalTable_red']";
    await page.locator(`${successSelector}, ${failureSelector}`).first().waitFor();

    const successCount = await page.locator(successSelector).count();
    const failedRows = (await page.locator(`tr:has(${failureSelector})`).allInnerTexts()).map((row) => row.replace("\t\n", ": "));

    expect(failedRows.length === 0 && successCount >= 1, `Issues:\n\t${failedRows.join("\n\t")}`).toBe(true);
});
