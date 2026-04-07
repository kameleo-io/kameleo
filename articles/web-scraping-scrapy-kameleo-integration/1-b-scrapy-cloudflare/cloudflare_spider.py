import scrapy


class ReviewSpider(scrapy.Spider):
    name = "review"

    def start_requests(self):
        # Add cookies to the request
        yield scrapy.Request(
            url="https://www.indeed.com/cmp/Burger-King/reviews",
            callback=self.parse
        )

    def parse(self, response):
        review_titles = response.css('h2[data-testid="title"] span::text').getall()
        yield {"Review titles": review_titles}
