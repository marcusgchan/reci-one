import os
import logging
from recipe_scrapers import scrape_me
from dotenv import load_dotenv

from flask import Flask, request

load_dotenv()


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    logger = logging.getLogger(__name__)

    app.config.from_mapping(
        SECRET_KEY='dev',
    )
    # configure envs
    # print(os.environ.get("TEST"))
    password = os.environ.get("PARSER_SECRET")

    @app.route('/parse', methods=["GET"])
    def hello():
        secret = request.headers.get("Authorization")
        if password != secret:
            return "Unauthorized", 401
        url = request.args.get("url")
        if url:
            try:
                scraper = scrape_me(url, wild_mode=True)
                logger.debug(scraper.title())
                return scraper.to_json()
            except Exception:
                return "Unable to scrape", 500
        return "Invalid url", 400

    return app
