import { expect, test } from "../../../utils/browserFixture.js";

test("Brotector", async ({ page }) => {
    await page.goto("https://ttlns.github.io/brotector/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(5_000); // makes video smoother

    await page.click("#clickHere");
    await page.mouse.move(100, 100);
    await page.mouse.click(100, 100);
    await page.evaluate("(async () => { return 1 })()");
    await page.keyboard.type("World", { delay: 100 });

    await expect(page.locator("td#avg-score")).toHaveText("0");
});
