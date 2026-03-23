import type { Page } from "@playwright/test";

export async function autoScroll(page: Page, pixelsPerSec = 200): Promise<void> {
    await page.evaluate(async (pixelsPerSec: number) => {
        const scrollsPerSec = 60;
        const delaySec = 1 / scrollsPerSec;
        const distance = pixelsPerSec * delaySec;

        let scrollTop: number;
        do {
            scrollTop = document.documentElement.scrollTop;
            window.scrollBy({ top: distance });
            await new Promise((resolve) => setTimeout(resolve, delaySec * 1_000));
        } while (scrollTop != document.documentElement.scrollTop);
    }, pixelsPerSec);
}
