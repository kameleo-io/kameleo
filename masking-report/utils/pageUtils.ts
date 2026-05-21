import type { Page } from "@playwright/test";

/** scroll down to the bottom of the page, with a 1 minute time limit */
export async function scrollDown(page: Page): Promise<void> {
    await page.evaluate(async () => {
        const pixelsPerSec = 300;
        const scrollsPerSec = 60;
        const delaySec = 1 / scrollsPerSec;
        const distance = pixelsPerSec * delaySec;

        // stop when 1 second has passed since the last successful scroll
        const startTime = Temporal.Now.instant();
        let lastSuccessfulScrollTime = startTime;
        do {
            const previousScrollTop = document.documentElement.scrollTop;
            window.scrollBy({ top: distance });
            await new Promise((resolve) => setTimeout(resolve, delaySec * 1_000));

            if (previousScrollTop != document.documentElement.scrollTop) {
                lastSuccessfulScrollTime = Temporal.Now.instant();
            }
        } while (
            Temporal.Now.instant().since(lastSuccessfulScrollTime).total("milliseconds") < 1_000 &&
            Temporal.Now.instant().since(startTime).total("seconds") < 60
        );
    });
}
