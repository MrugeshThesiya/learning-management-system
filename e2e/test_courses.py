"""Catalog + enrollment flows through the real UI as a student."""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from helpers import STUDENT_EMAIL, STUDENT_PASSWORD, api_register, ui_login


def test_catalog_requires_login(driver, wait, base_url):
    driver.get(f"{base_url}/courses")
    # GuestOnly/ProtectedRoute bounces guests to /login with `from=/courses`
    wait.until(EC.url_contains("/login"))
    assert "Sign in" in driver.page_source


def test_catalog_search_filters_results(driver, wait, base_url):
    ui_login(driver, wait, base_url, STUDENT_EMAIL, STUDENT_PASSWORD)
    driver.get(f"{base_url}/courses")
    search = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, 'input[placeholder*="Search courses"]'))
    )
    assert "Course catalog" in driver.page_source
    search.clear()
    search.send_keys("Python")
    # Debounced search (300ms) narrows the grid to matching courses
    wait.until(EC.text_to_be_present_in_element((By.TAG_NAME, "body"), "Python"))
    body = driver.find_element(By.TAG_NAME, "body").text
    assert "Python" in body


def test_enroll_flow_for_fresh_student(driver, wait, base_url, api_url):
    email, password = api_register(api_url, full_name="Enroll Tester")
    ui_login(driver, wait, base_url, email, password)
    driver.get(f"{base_url}/courses")
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(., 'Course catalog')]")))

    # Find a course the fresh user is NOT enrolled in and enroll via the card button
    enroll_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "(//button[normalize-space()='Enroll'])[1]"))
    )
    enroll_btn.click()
    # Card flips to the enrolled state: "Enrolled" badge or "Continue" link
    wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//*[normalize-space()='Enrolled' or normalize-space()='Continue']")
        )
    )


def test_course_detail_opens_from_catalog(driver, wait, base_url):
    ui_login(driver, wait, base_url, STUDENT_EMAIL, STUDENT_PASSWORD)
    driver.get(f"{base_url}/courses")
    view_link = wait.until(
        EC.element_to_be_clickable((By.XPATH, "(//a[normalize-space()='View'])[1]"))
    )
    view_link.click()
    wait.until(EC.url_matches(r".*/courses/\d+"))
