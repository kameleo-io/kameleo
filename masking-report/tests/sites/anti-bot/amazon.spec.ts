import { test } from "../../../utils/browserFixture.ts";

test("Amazon", async ({ page }) => {
    await page.goto("https://www.amazon.com/");

    // search for a product
    await page.waitForSelector("#nav-search");
    await page.click("#nav-search input");
    await page.keyboard.type("glasses");
    await page.keyboard.press("Enter");
    await page.waitForSelector("h2:has-text('Results')");
    await page.waitForTimeout(2_000); // for video presentation purposes

    // click on one, add to cart, checkout
    await page.locator("div[role='listitem']").nth(2).locator("img").first().click();
    await page.waitForTimeout(2_000); // for video presentation purposes
    await page.locator("input[value='Add to cart']").first().click();
    await page.waitForTimeout(2_000); // for video presentation purposes
    await page.locator("input[value='Proceed to checkout']").click();
    await page.waitForTimeout(2_000); // for video presentation purposes
});
