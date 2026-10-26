"""Landing page: public marketing content and entry points to auth."""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


def test_landing_hero_and_nav(driver, wait, base_url):
    driver.get(base_url)
    wait.until(EC.visibility_of_element_located((By.XPATH, "//h1[contains(., 'Learn anything')]")))
    assert "Learnova" in driver.title or "Learnova" in driver.page_source

    # Entry points to register + login exist and point at the right routes
    links = {a.get_attribute("href") for a in driver.find_elements(By.TAG_NAME, "a")}
    assert any(h and h.rstrip("/").endswith("/register") for h in links), "no /register link on landing"
    assert any(h and h.rstrip("/").endswith("/login") for h in links), "no /login link on landing"


def test_landing_get_started_goes_to_register(driver, wait, base_url):
    driver.get(base_url)
    wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(., 'Start learning free')]"))).click()
    wait.until(EC.url_contains("/register"))
    assert "Create your account" in driver.page_source


def test_landing_sign_in_goes_to_login(driver, wait, base_url):
    driver.get(base_url)
    wait.until(EC.element_to_be_clickable((By.XPATH, "//a[normalize-space()='Sign in to your account']"))).click()
    wait.until(EC.url_contains("/login"))
    assert "Sign in" in driver.page_source
