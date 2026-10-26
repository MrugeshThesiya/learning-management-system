"""Auth flows through the real UI: login, validation, registration, logout."""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from helpers import (
    STUDENT_EMAIL,
    STUDENT_PASSWORD,
    api_register,
    ui_login,
    ui_logout,
)


def _fill_login(driver, email, password):
    email_box = driver.find_element(By.CSS_SELECTOR, 'input[type="email"]')
    pass_box = driver.find_element(By.CSS_SELECTOR, 'input[type="password"], input[placeholder*="\u2022"]')
    email_box.clear()
    email_box.send_keys(email)
    pass_box.clear()
    pass_box.send_keys(password)


def test_login_valid_student_reaches_dashboard(driver, wait, base_url):
    ui_login(driver, wait, base_url, STUDENT_EMAIL, STUDENT_PASSWORD)
    # Student dashboard greets by first name ("Demo") and shows learning sections
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(., 'Continue learning')]")))
    assert "Demo" in driver.page_source


def test_login_empty_fields_shows_validation(driver, wait, base_url):
    driver.get(f"{base_url}/login")
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, 'input[type="email"]')))
    driver.find_element(By.XPATH, "//button[contains(., 'Sign in')]").click()
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(., 'Enter your email and password.')]")))


def test_login_wrong_password_shows_error(driver, wait, base_url):
    driver.get(f"{base_url}/login")
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, 'input[type="email"]')))
    _fill_login(driver, STUDENT_EMAIL, "definitely-wrong-pw")
    driver.find_element(By.XPATH, "//button[contains(., 'Sign in')]").click()
    wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//*[contains(., 'Invalid') or contains(., 'failed') or contains(., 'Check your details')]")
        )
    )
    assert "/login" in driver.current_url


def test_register_empty_fields_shows_validation(driver, wait, base_url):
    driver.get(f"{base_url}/register")
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(., 'Create your account')]")))
    driver.find_element(By.XPATH, "//button[contains(., 'Create account')]").click()
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(., 'Please fill in')]")))


def test_register_short_password_shows_validation(driver, wait, base_url):
    driver.get(f"{base_url}/register")
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(., 'Create your account')]")))
    driver.find_element(By.CSS_SELECTOR, 'input[placeholder="Ada Lovelace"]').send_keys("E2E Learner")
    driver.find_element(By.CSS_SELECTOR, 'input[type="email"]').send_keys("short-pw@example.com")
    driver.find_element(By.CSS_SELECTOR, 'input[placeholder="Minimum 6 characters"]').send_keys("123")
    driver.find_element(By.XPATH, "//button[contains(., 'Create account')]").click()
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(., 'at least 6')]")))


def test_register_new_student_end_to_end(driver, wait, base_url, api_url):
    # Register via the API (unique user, no state pollution), then prove the
    # credentials work through the real login form.
    email, password = api_register(api_url)
    ui_login(driver, wait, base_url, email, password)
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(., 'Continue learning')]")))


def test_logout_returns_to_landing(driver, wait, base_url):
    ui_login(driver, wait, base_url, STUDENT_EMAIL, STUDENT_PASSWORD)
    wait.until(EC.visibility_of_element_located((By.XPATH, "//button[normalize-space()='Log out']")))
    ui_logout(driver, wait)
    wait.until(EC.visibility_of_element_located((By.XPATH, "//h1[contains(., 'Learn anything')]")))
