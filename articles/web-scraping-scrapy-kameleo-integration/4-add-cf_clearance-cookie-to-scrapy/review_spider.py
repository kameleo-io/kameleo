import scrapy
import json


class ReviewSpider(scrapy.Spider):
    name = "review"

    def start_requests(self):
        # Read cookies exported from Kameleo browser profile
        with open('../3-bypass-cloudflare-turnstile-with-Kameleo/cf_clearance_cookie.json', 'r') as file:
            json_data = file.read()
        cookies_list = json.loads(json_data)

        # Convert to Scrapy format
        cookies = {cookie["name"]: cookie["value"] for cookie in cookies_list}

        with open("../3-bypass-cloudflare-turnstile-with-Kameleo/user_agent.txt", "r", encoding="utf-8") as file:
            user_agent = file.readline().strip()

        # Add cookies to the request
        yield scrapy.Request(
            url="https://www.indeed.com/cmp/Burger-King/reviews",
            cookies=cookies,  # add the cf_clearance cooke
            headers={"User-Agent": user_agent},  # dynamically set user-agent
            callback=self.parse
        )

    def parse(self, response):
        self.logger.info(f"User-Agent used: {response.request.headers['User-Agent']}")
        review_titles = response.css('h2[data-testid="title"] span::text').getall()
        yield {"Review titles": review_titles}