import type { Frame, Page } from "@playwright/test";
import { setTimeout } from "timers/promises";

export async function autoScroll(page: Page, pixelsPerSec = 400): Promise<void> {
    await page.evaluate(async (pixelsPerSec: number) => {
        const delay = (ms: number): Promise<void> => new Promise((resolve) => globalThis.setTimeout(resolve, ms));
        const scrollDistance = pixelsPerSec / 60; // 60 scrolls per second
        const scrollDelay = 1000 / 60;

        let lastScrollTop = 0;
        let stuckCount = 0;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
            const scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
            const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
            const clientHeight = document.documentElement.clientHeight;

            // Reached bottom
            if (scrollTop + clientHeight >= scrollHeight - 1) break;

            // Stuck in same position
            if (Math.abs(scrollTop - lastScrollTop) < 1) {
                if (++stuckCount > 3) break;
            } else {
                stuckCount = 0;
            }

            lastScrollTop = scrollTop;
            window.scrollBy({ top: scrollDistance, behavior: "auto" });
            await delay(scrollDelay);
        }
    }, pixelsPerSec);
}

export async function waitForFrame(options: { page: Page; url: string | RegExp } | { page: Page; title: string }): Promise<Frame> {
    let frame: Frame | undefined;
    const timeoutMs = 30_000;
    const startedAt = Date.now();

    while (!frame) {
        if (Date.now() - startedAt > timeoutMs) {
            const descriptor = "url" in options ? `url: ${options.url.toString()}` : `title: ${options.title}`;
            throw new Error(`Timed out waiting for frame (${descriptor}) after ${timeoutMs}ms`);
        }

        await setTimeout(500);

        const frames = options.page.frames();
        for (const f of frames) {
            if ("url" in options) {
                if (typeof options.url === "string") {
                    if (f.url() === options.url) {
                        frame = f;
                        break;
                    }
                } else {
                    if (options.url.test(f.url())) {
                        frame = f;
                        break;
                    }
                }
            } else {
                if ((await f.title()) === options.title) {
                    frame = f;
                    break;
                }
            }
        }
    }

    return frame;
}
