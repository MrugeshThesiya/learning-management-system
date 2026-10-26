"""Shared helpers for the LMS Selenium suite (imported by conftest + tests)."""

import os
import shutil
import uuid

import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = os.environ.get("E2E_BASE_URL", "http://localhost:5173").rstrip("/")
API_URL = os.environ.get("E2E_API_URL", "http://localhost:4000").rstrip("/")
SELENIUM_URL = os.environ.get("E2E_SELENIUM_URL", "").strip()
HEADLESS = os.environ.get("E2E_HEADLESS", "1") != "0"
WINDOW = os.environ.get("E2E_WINDOW", "1366,900")

STUDENT_EMAIL = "demo@learnova.app"
STUDENT_PASSWORD = "password123"
INSTRUCTOR_EMAIL = "instructor@learnova.app"
INSTRUCTOR_PASSWORD = "instructor123"


def chrome_options():
    opts = ChromeOptions()
    if HEADLESS:
        opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument(f"--window-size={WINDOW}")
    return opts


def make_driver():
    if SELENIUM_URL:
        return webdriver.Remote(command_executor=SELENIUM_URL, options=chrome_options())
    service = None
    chromedriver = shutil.which("chromedriver") or os.environ.get("CHROMEDRIVER", "")
    if chromedriver and os.path.exists(chromedriver):
        service = ChromeService(executable_path=chromedriver)
    return webdriver.Chrome(service=service, options=chrome_options())


def unique_email(prefix="e2e"):
    return f"{prefix}+{uuid.uuid4().hex[:8]}@example.com"


def api_register(api_url, full_name="E2E Learner", role="student"):
    """Create a fresh user via the API; returns (email, password)."""
    email = unique_email()
    password = "password123"
    r = requests.post(
        f"{api_url}/auth/register",
        json={"full_name": full_name, "email": email, "password": password, "role": role},
        timeout=15,
    )
    r.raise_for_status()
    return email, password


def ui_login(driver, wait, base_url, email, password):
    """Log in through the real Login form and land on the dashboard."""
    driver.get(f"{base_url}/login")
    email_box = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, 'input[type="email"]')))
    pass_box = driver.find_element(By.CSS_SELECTOR, 'input[type="password"], input[placeholder*="\u2022"]')
    email_box.clear()
    email_box.send_keys(email)
    pass_box.clear()
    pass_box.send_keys(password)
    driver.find_element(By.XPATH, "//button[contains(., 'Sign in')]").click()
    wait.until(EC.url_contains("/dashboard"))
    return driver


def ui_logout(driver, wait, base_url=None):
    base = base_url or BASE_URL
    driver.find_element(By.XPATH, "//button[normalize-space()='Log out']").click()
    wait.until(EC.url_to_be(f"{base}/"))
