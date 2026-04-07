import { expect, test } from '@playwright/test'

test('teacher demo can perform CRUD on amendments', async ({ page }, testInfo) => {
  page.on('dialog', (dialog) => dialog.accept())

  await page.goto('/login')
  await page.getByRole('button', { name: 'Teacher' }).click()
  await expect(page).toHaveURL(/\/$/)

  await page.goto('/amendments')
  await expect(page.getByRole('heading', { name: /Grade Amendments/i })).toBeVisible()

  const courseCode = `COMP9${Date.now().toString().slice(-4)}`

  await page.getByRole('button', { name: /New Amendment/i }).click()
  const amendmentForm = page.locator('form').first()
  await amendmentForm.getByPlaceholder('e.g. 22240802').fill('UT123456')
  await amendmentForm.locator('.row.g-3.mb-3').nth(1).locator('input').nth(1).fill('Playwright CRUD')
  await amendmentForm.getByPlaceholder('e.g. COMP3047').fill(courseCode)
  await amendmentForm.getByPlaceholder('e.g. Software Engineering').fill('Automated Testing')
  await amendmentForm.locator('.row.g-3.mb-4 select').nth(0).selectOption('B')
  await amendmentForm.locator('.row.g-3.mb-4 select').nth(1).selectOption('A')
  await amendmentForm.getByLabel('Conversion of temporary grade (I, NR, PR, YR)').check()
  await amendmentForm.getByPlaceholder('e.g. Dr. Martin Choy').fill('Dr. Test')
  await amendmentForm.getByPlaceholder('e.g. COMP', { exact: true }).fill('COMP')

  await page.getByRole('button', { name: /Preview & Submit/i }).click()
  await page.getByRole('button', { name: /Confirm Submission/i }).click()
  await expect(page.getByText('Amendment submitted successfully')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('crud-01-create.png'), fullPage: true })

  await page.getByPlaceholder('e.g. COMP3047').fill(courseCode)
  const row = page.locator('tr', { hasText: courseCode }).first()
  await expect(row).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('crud-02-read.png'), fullPage: true })

  await row.locator('button[title="Edit"]').click()
  await amendmentForm.locator('.row.g-3.mb-4 select').nth(1).selectOption('A-')
  await page.getByRole('button', { name: /Review Changes/i }).click()
  await page.getByRole('button', { name: /Confirm Update/i }).click()
  await expect(page.getByText('Amendment updated successfully')).toBeVisible()

  await page.getByPlaceholder('e.g. COMP3047').fill(courseCode)
  const updatedRow = page.locator('tr', { hasText: courseCode }).first()
  await expect(updatedRow).toContainText('A-')
  await page.screenshot({ path: testInfo.outputPath('crud-03-update.png'), fullPage: true })

  await updatedRow.locator('.btn-outline-danger').click()
  await expect(page.getByText(courseCode)).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath('crud-04-delete.png'), fullPage: true })
})
