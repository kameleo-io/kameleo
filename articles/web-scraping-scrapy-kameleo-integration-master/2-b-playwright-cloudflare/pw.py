import asyncio
from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as p:
        # I run this is headfull mode to make the demo more understandable
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.goto('https://www.indeed.com/cmp/Burger-King/reviews')
        await page.wait_for_timeout(20000)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())