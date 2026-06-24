import { expect, test } from "../../../utils/browserFixture.ts";
import { scrollDown } from "../../../utils/pageUtils.ts";

test.describe(() => {
    test.use({
        profileOptions: { proxy: { value: "none" } },
    });
    test("Fingerprint.com", async ({ page }) => {
        await page.goto("https://demo.fingerprint.com/playground", { waitUntil: "networkidle" });

        const successSelector = "[class*='SignalTable_green']",
            suspiciousSelector = "[class*='SignalTable_red']";
        await page.locator(`${successSelector}, ${suspiciousSelector}`).first().waitFor();

        const successCount = await page.locator(successSelector).count();
        const suspiciousRows = (await page.locator(`tr:has(${suspiciousSelector})`).allInnerTexts()).map((row) =>
            row.replace("\t\n", ": "),
        );
        const failedRows = suspiciousRows.filter((row) =>
            ["Bot", "Browser Tampering", "Virtual Machine"].some((issue) => row.startsWith(issue)),
        );

        // log server API response for more details
        // a json view in an element next to the "Server API Response" heading
        const serverApiResponseLocator = page.locator('h4:has-text("Server API Response") + * .json-view');
        if (await serverApiResponseLocator.isVisible()) {
            console.log(`Server API Response:\n${await serverApiResponseLocator.innerText()}`);
        } else {
            console.log("Server API Response not found!");
        }

        await scrollDown(page);

        expect(failedRows.length === 0 && successCount >= 1, `Issues:\n\t${suspiciousRows.join("\n\t")}`).toBe(true);
    });
});
