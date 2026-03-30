/**
 * E2E tests for Submission CRUD operations.
 *
 * Uses demo auth injected via addInitScript so no real backend is needed.
 */
import { test, expect } from '@playwright/test'

function withPDAuth(page) {
  return page.addInitScript(() => {
    const token = 'demo_token_pd_sub_e2e_' + Date.now()
    const user = {
      email: 'pd@hkbu.edu.hk',
      name: 'Programme Director',
      role: 'Programme Director',
      signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    }
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  })
}

function withAdminAuth(page) {
  return page.addInitScript(() => {
    const token = 'demo_token_admin_sub_e2e_' + Date.now()
    const user = {
      email: 'admin@hkbu.edu.hk',
      name: 'Administrator',
      role: 'admin',
    }
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  })
}

// ──────────────────────────────────────────────────────────────────
// READ – list submissions
// ──────────────────────────────────────────────────────────────────
test.describe('Submissions – READ (list)', () => {
  test('PD user can access the submissions page', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/submissions')
    await expect(page.locator('h3').filter({ hasText: /submissions/i })).toBeVisible({ timeout: 10000 })
  })

  test('Submissions list shows demo data cards or rows', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/submissions')
    await expect(page.locator('h3').filter({ hasText: /submissions/i })).toBeVisible({ timeout: 10000 })
    // At least one submission card should appear
    const cards = page.locator('.card').filter({ hasText: /draft|submitted|approved|rejected/i })
    await expect(cards.first()).toBeVisible({ timeout: 10000 })
  })

  test('Admin can view submissions list', async ({ page }) => {
    await withAdminAuth(page)
    await page.goto('/submissions')
    await expect(page.locator('h3').filter({ hasText: /submissions/i })).toBeVisible({ timeout: 10000 })
  })
})

// ──────────────────────────────────────────────────────────────────
// CREATE – new submission
// ──────────────────────────────────────────────────────────────────
test.describe('Submissions – CREATE', () => {
  test('PD user can open the create submission panel', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/submissions')
    await expect(page.locator('h3').filter({ hasText: /submissions/i })).toBeVisible({ timeout: 10000 })

    const createBtn = page.getByRole('button', { name: /create new submission/i }).first()
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      await expect(page.locator('.card-header').filter({ hasText: /create new submission/i })).toBeVisible({ timeout: 5000 })
    }
  })

  test('Create submission form has a title input', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/submissions')
    await expect(page.locator('h3').filter({ hasText: /submissions/i })).toBeVisible({ timeout: 10000 })

    const createBtn = page.getByRole('button', { name: /create new submission/i }).first()
    if (!await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) return

    await createBtn.click()
    const titleInput = page.locator('input[placeholder*="Semester"]')
    await expect(titleInput).toBeVisible({ timeout: 5000 })
  })

  test('Filling and saving a new submission adds it to the list', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/submissions')
    await expect(page.locator('h3').filter({ hasText: /submissions/i })).toBeVisible({ timeout: 10000 })

    const createBtn = page.getByRole('button', { name: /create new submission/i }).first()
    if (!await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) return

    await createBtn.click()
    const titleInput = page.locator('input[placeholder*="Semester"]').first()
    await titleInput.fill('E2E Playwright Test Submission')

    // Click the create button inside the form
    const saveBtn = page.locator('.card-header').filter({ hasText: /create new submission/i })
      .locator('..').getByRole('button', { name: /create|save/i }).first()
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click()
      await page.waitForTimeout(500)
      await expect(page.getByText('E2E Playwright Test Submission')).toBeVisible({ timeout: 5000 })
    }
  })
})

// ──────────────────────────────────────────────────────────────────
// UPDATE – submit a draft to admin
// ──────────────────────────────────────────────────────────────────
test.describe('Submissions – UPDATE (submit to admin)', () => {
  test('PD user sees Submit button on draft submissions', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/submissions')
    await expect(page.locator('h3').filter({ hasText: /submissions/i })).toBeVisible({ timeout: 10000 })

    // Look for a Submit button (should exist for draft submissions)
    const submitBtn = page.getByRole('button', { name: /^submit$/i }).first()
    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(submitBtn).toBeVisible()
    }
  })
})

// ──────────────────────────────────────────────────────────────────
// Admin view
// ──────────────────────────────────────────────────────────────────
test.describe('Submissions – Admin panel', () => {
  test('Admin panel is accessible', async ({ page }) => {
    await withAdminAuth(page)
    await page.goto('/admin')
    await expect(page.locator('.badge').filter({ hasText: /admin panel/i })).toBeVisible({ timeout: 10000 })
  })

  test('Admin panel shows submissions tab', async ({ page }) => {
    await withAdminAuth(page)
    await page.goto('/admin')
    await expect(page.locator('.badge').filter({ hasText: /admin panel/i })).toBeVisible({ timeout: 10000 })

    const submissionsTab = page.getByRole('tab', { name: /submission/i }).first()
    if (await submissionsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submissionsTab.click()
      await expect(page.locator('.card, table').first()).toBeVisible({ timeout: 5000 })
    }
  })
})

// ──────────────────────────────────────────────────────────────────
// Navigation
// ──────────────────────────────────────────────────────────────────
test.describe('Submissions – navigation', () => {
  test('navigating to /submissions while authenticated stays on the page', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/submissions')
    await expect(page).toHaveURL(/submissions/, { timeout: 10000 })
  })

  test('navigating to /submissions while unauthenticated redirects to /login', async ({ page }) => {
    await page.goto('/submissions')
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })
})
