"""Shared Selenium fixtures for the LMS end-to-end suite.

Configuration via environment:
  E2E_BASE_URL     — where the client is served (default http://localhost:5173)
  E2E_API_URL      — where the API is reachable (default http://localhost:4000)
  E2E_SELENIUM_URL — Remote WebDriver URL (e.g. http://localhost:4444/wd/hub).
                     When unset, a local headless Chrome is started via
                     Selenium Manager (no manual chromedriver install needed).
  E2E_HEADLESS     — "0" to watch the browser locally, default "1".
  E2E_WINDOW       — window size, default "1366,900".
"""

import os

import pytest
from selenium.webdriver.support.ui import WebDriverWait

from helpers import API_URL, BASE_URL, make_driver

DEFAULT_TIMEOUT = int(os.environ.get("E2E_TIMEOUT", "15"))


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def api_url():
    return API_URL


@pytest.fixture()
def driver():
    """A fresh browser per test with clean storage, so sessions never leak."""
    drv = make_driver()
    drv.implicitly_wait(0)
    yield drv
    try:
        drv.quit()
    except Exception:
        pass


@pytest.fixture()
def wait(driver):
    return WebDriverWait(driver, DEFAULT_TIMEOUT)
