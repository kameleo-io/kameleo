import { expect, test } from "../../../utils/kameleoBrowserFixture.js";

test("Brotector", async ({ page }) => {
    await page.goto("https://ttlns.github.io/brotector/");

    await page.waitForLoadState("networkidle");

    await page.click("#clickHere");
    await page.mouse.move(100, 100);
    await page.mouse.click(100, 100);
    await page.evaluate("(async () => { return 1 })()");
    await page.keyboard.type("World", { delay: 100 });

    await expect(page.locator("td#avg-score")).toHaveText("0");
});
