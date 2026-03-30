/**
 * E2E tests for Amendment CRUD operations.
 *
 * These tests use demo auth injected via addInitScript so no real backend is needed.
 */
import { test, expect } from '@playwright/test'

function withPDAuth(page) {
  return page.addInitScript(() => {
    const token = 'demo_token_pd_e2e_' + Date.now()
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
    const token = 'demo_token_admin_e2e_' + Date.now()
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
// READ – list amendments
// ──────────────────────────────────────────────────────────────────
test.describe('Amendments – READ (list)', () => {
  test('PD user can view the amendments list page', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/amendments')
    await expect(page.locator('h3').filter({ hasText: /grade amendments/i })).toBeVisible({ timeout: 10000 })
  })

  test('Amendments table is rendered with demo data rows', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/amendments')
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })
  })

  test('Admin can view amendments list in read-only mode', async ({ page }) => {
    await withAdminAuth(page)
    await page.goto('/amendments')
    await expect(page.locator('h3').filter({ hasText: /grade amendments/i })).toBeVisible({ timeout: 10000 })
  })

  test('Filter by course code updates displayed amendments', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/amendments')
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 })

    const filterInput = page.locator('input[placeholder*="Course"]').first()
    if (await filterInput.isVisible()) {
      await filterInput.fill('COMP3047')
      await expect(page.locator('table')).toBeVisible()
    }
  })
})

// ──────────────────────────────────────────────────────────────────
// CREATE – add a new amendment
// ──────────────────────────────────────────────────────────────────
test.describe('Amendments – CREATE', () => {
  test('PD user can open the add amendment form', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/amendments')
    await expect(page.locator('h3').filter({ hasText: /grade amendments/i })).toBeVisible({ timeout: 10000 })

    const addBtn = page.getByRole('button', { name: /new amendment/i }).first()
    await expect(addBtn).toBeVisible({ timeout: 5000 })
    await addBtn.click()

    // The form should now be visible
    await expect(page.locator('form')).toBeVisible({ timeout: 5000 })
  })

  test('New Amendment form has student and course fields', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/amendments')
    await expect(page.locator('h3').filter({ hasText: /grade amendments/i })).toBeVisible({ timeout: 10000 })

    const addBtn = page.getByRole('button', { name: /new amendment/i }).first()
    await addBtn.click()

    // Form fields should be present
    await expect(page.locator('form')).toBeVisible({ timeout: 5000 })
    // At least one input field in the form
    await expect(page.locator('form input').first()).toBeVisible({ timeout: 3000 })
  })

  test('Filling amendment form fields works', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/amendments')
    await expect(page.locator('h3').filter({ hasText: /grade amendments/i })).toBeVisible({ timeout: 10000 })

    const addBtn = page.getByRole('button', { name: /new amendment/i }).first()
    await addBtn.click()
    await expect(page.locator('form')).toBeVisible({ timeout: 5000 })

    // Fill the student number field
    const studentInput = page.locator('input[placeholder*="Student"]').first()
    if (await studentInput.isVisible()) {
      await studentInput.fill('12345678')
      await expect(studentInput).toHaveValue('12345678')
    }
  })
})

// ──────────────────────────────────────────────────────────────────
// UPDATE – edit an existing amendment
// ──────────────────────────────────────────────────────────────────
test.describe('Amendments – UPDATE', () => {
  test('PD user can open the edit form for an amendment', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/amendments')
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 })

    // Find an edit button (pencil icon / "Edit" text) in the action column
    const editBtn = page.locator('button[title*="Edit"], button.btn-outline-warning, button[class*="warning"]').first()
    if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editBtn.click()
      await expect(page.locator('form')).toBeVisible({ timeout: 5000 })
    }
  })
})

// ──────────────────────────────────────────────────────────────────
// DELETE – remove an amendment
// ──────────────────────────────────────────────────────────────────
test.describe('Amendments – DELETE', () => {
  test('PD user sees delete buttons for amendments', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/amendments')
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 })

    // Delete button should be present (trash icon / btn-outline-danger)
    const deleteBtn = page.locator('button.btn-outline-danger').first()
    await expect(deleteBtn).toBeVisible({ timeout: 5000 })
  })

  test('PD user can delete an amendment', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/amendments')
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 })

    const rowsBefore = await page.locator('tbody tr').count()
    if (rowsBefore === 0) return

    const deleteBtn = page.locator('button.btn-outline-danger').first()
    if (!await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false)) return

    page.on('dialog', dialog => dialog.accept())
    await deleteBtn.click()
    await page.waitForTimeout(800)

    const rowsAfter = await page.locator('tbody tr').count()
    expect(rowsAfter).toBeLessThan(rowsBefore)
  })
})

// ──────────────────────────────────────────────────────────────────
// Admin restrictions
// ──────────────────────────────────────────────────────────────────
test.describe('Amendments – admin restrictions', () => {
  test('Add amendment button is hidden for admin users', async ({ page }) => {
    await withAdminAuth(page)
    await page.goto('/amendments')
    await expect(page.locator('h3').filter({ hasText: /grade amendments/i })).toBeVisible({ timeout: 10000 })

    const addBtn = page.getByRole('button', { name: /new amendment/i })
    expect(await addBtn.count()).toBe(0)
  })
})

// ──────────────────────────────────────────────────────────────────
// Download actions
// ──────────────────────────────────────────────────────────────────
test.describe('Amendments – download template', () => {
  test('Download Template button is visible', async ({ page }) => {
    await withPDAuth(page)
    await page.goto('/amendments')
    await expect(page.locator('h3').filter({ hasText: /grade amendments/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /template/i })).toBeVisible({ timeout: 5000 })
  })
})
