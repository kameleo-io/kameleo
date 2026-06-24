import { expect, test } from "../../../utils/browserFixture.ts";
import { scrollDown } from "../../../utils/pageUtils.ts";

test.describe(() => {
    test.use({
        profileOptions: {
            proxy: { value: "none" },
            fonts: "off",
        },
    });
    test("Iphey", async ({ page }) => {
        await page.goto("https://iphey.com/", { waitUntil: "networkidle" });
        await page.locator("#signals").waitFor({ timeout: 90_000 });

        const knownSignals = new Set([
            "status: Not detected",
            "browser: Detected the following processes on your device: Remote Desktop Protocol (RDP)", // caused by non-Kameleo related dev environment
        ]);

        const signalLocators = await page.locator("#signals + .detail-list .detail-entry").all();
        const issues = new Set<string>();
        for (const signal of signalLocators) {
            const name = await signal.locator(".detail-name").textContent();
            const value = await signal.locator(".detail-value").textContent();
            issues.add(`${name}: ${value}`);
        }

        await scrollDown(page);

        const unknownIssues = [...issues.difference(knownSignals)];
        expect(unknownIssues, `Unknown signals detected:\n\t${unknownIssues.join("\n\t")}`).toHaveLength(0);
    });
});
