import os
import logging
from recipe_scrapers import scrape_me

from flask import Flask, request


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    logger = logging.getLogger(__name__)

    app.config.from_mapping(
        SECRET_KEY='dev',
    )
    # configure envs
    #print(os.environ.get("TEST"))

    @app.route('/parse', methods=["GET"])
    def hello():
        url = request.args.get("url")
        secret = request.headers.get("Authorization")
        if url:
            scraper = scrape_me(url, wild_mode=True)
            logger.debug(scraper.title())
            return scraper.to_json()
        return "Invalid url", 400

    return app
