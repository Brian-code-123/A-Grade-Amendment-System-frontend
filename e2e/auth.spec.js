import { test, expect } from '@playwright/test'

test.describe('Authentication – demo login flow', () => {
  test('demo admin login redirects to home page', async ({ page }) => {
    await page.goto('/demo-login')
    // DemoLoginView auto-redirects to '/' after setting the token
    await page.waitForURL('/', { timeout: 10000 })
    expect(page.url()).toContain('/')
  })

  test('login page renders the Grade Amendment System heading', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Grade Amendment')).toBeVisible({ timeout: 10000 })
  })

  test('login page shows demo access section', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText(/demo/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('unauthenticated user is redirected from /amendments to /login', async ({ page }) => {
    await page.goto('/amendments')
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })

  test('unauthenticated user is redirected from /submissions to /login', async ({ page }) => {
    await page.goto('/submissions')
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })

  test('unauthenticated user is redirected from /admin to /login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })
})

test.describe('Authentication – demo verify (math captcha)', () => {
  test('demo-verify page shows a math captcha question', async ({ page }) => {
    await page.goto('/demo-verify')
    await expect(page.locator('.captcha-text')).toBeVisible({ timeout: 10000 })
  })

  test('completing captcha correctly redirects to home', async ({ page }) => {
    await page.goto('/demo-verify')
    const captchaText = await page.locator('.captcha-text').textContent()
    const match = captchaText.match(/(\d+)\s*\+\s*(\d+)/)
    const answer = parseInt(match[1]) + parseInt(match[2])

    await page.locator('input[type="number"]').fill(String(answer))
    await page.locator('button[type="submit"]').click()

    await page.waitForURL('/', { timeout: 15000 })
    expect(page.url()).toContain('/')
  })

  test('entering wrong captcha answer shows error', async ({ page }) => {
    await page.goto('/demo-verify')
    await page.locator('input[type="number"]').fill('999')
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('.alert-danger')).toBeVisible({ timeout: 5000 })
  })
})
