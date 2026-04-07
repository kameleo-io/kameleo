import asyncio
from playwright.async_api import async_playwright
import json
import time


async def main():
    start_url = "https://quotes.toscrape.com/page/1/"
    results = []

    async def scrape_page(page, url):
        await page.goto(url)
        quotes = await page.query_selector_all("div.quote")
        for quote in quotes:
            text = await quote.query_selector("span.text")
            author = await quote.query_selector("small.author")
            tags = await quote.query_selector_all("div.tags a.tag")

            results.append({
                "text": await text.inner_text() if text else None,
                "author": await author.inner_text() if author else None,
                "tags": [await tag.inner_text() for tag in tags],
            })

        next_page = await page.query_selector("ul.pager li.next a")
        if next_page:
            next_url = await next_page.get_attribute("href")
            if next_url:
                await scrape_page(page, f"https://quotes.toscrape.com{next_url}")

    async with async_playwright() as p:
        # I run this is headfull mode to make the demo more understandable
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await scrape_page(page, start_url)
        await browser.close()

    # Write results to results.json
    with open("results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    start_time = time.time()
    asyncio.run(main())
    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Script execution time: {elapsed_time:.2f} seconds")