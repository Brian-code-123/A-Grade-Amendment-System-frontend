import { expect, test } from '@playwright/test'

/**
 * End-to-end test covering all CRUD operations with screenshots.
 *
 * This test exercises the full amendment lifecycle through the browser:
 *   1. CREATE  — fill and submit the amendment form
 *   2. READ    — search and verify the created row appears
 *   3. UPDATE  — edit the amendment and verify changes
 *   4. DELETE  — remove the amendment and verify it disappears
 *
 * Screenshots are captured at each stage and saved to the test output folder.
 */

function routePath(baseURL, route) {
  return /azurestaticapps\.net/.test(baseURL || '') ? `/#${route}` : route
}

async function loginTeacherDemo(page) {
  await page.addInitScript(() => {
    const demoToken = `demo_token_teacher_${Date.now()}`
    const demoUser = {
      email: 'teacher.demo@hkbu.edu.hk',
      name: 'Dr. Martin Choy',
      role: 'Teacher',
    }
    window.localStorage.setItem('token', demoToken)
    window.localStorage.setItem('user', JSON.stringify(demoUser))
  })
}

test.describe('Amendments CRUD — full lifecycle with screenshots', () => {
  test('complete Create → Read → Update → Delete cycle', async ({ page }, testInfo) => {
    page.on('dialog', (dialog) => dialog.accept())

    // --- AUTH: set up demo teacher session ---
    await loginTeacherDemo(page)

    // --- NAVIGATE to amendments page ---
    await page.goto('/')
    const path = routePath(testInfo.project.use.baseURL, '/amendments')
    await page.goto(path)

    // Skip if route not available
    const notFound = page.getByRole('heading', { name: /404: Not Found/i })
    if ((await notFound.count()) > 0 && (await notFound.first().isVisible())) {
      test.skip(true, 'Amendments route not available.')
    }

    await expect(page.getByRole('heading', { name: /Grade Amendments/i })).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('00-amendments-page.png'),
      fullPage: true,
    })

    // --- CREATE ---
    const courseCode = `COMP9${Date.now().toString().slice(-4)}`
    const studentNo = `E2E${Date.now().toString().slice(-5)}`

    await page.getByRole('button', { name: /New Amendment/i }).click()
    await page.screenshot({
      path: testInfo.outputPath('01-create-form-open.png'),
      fullPage: true,
    })

    const form = page.locator('form').first()
    await form.getByPlaceholder('e.g. 22240802').fill(studentNo)
    await form.locator('.row.g-3.mb-3').nth(1).locator('input').nth(1).fill('E2E Full CRUD Student')
    await form.getByPlaceholder('e.g. COMP3047').fill(courseCode)
    await form.getByPlaceholder('e.g. Software Engineering').fill('E2E Automated Testing')
    await form.locator('.row.g-3.mb-4 select').nth(0).selectOption('B')
    await form.locator('.row.g-3.mb-4 select').nth(1).selectOption('A')
    await form.getByLabel('Conversion of temporary grade (I, NR, PR, YR)').check()
    await form.getByPlaceholder('e.g. Dr. Martin Choy').fill('Dr. E2E Tester')
    await form.getByPlaceholder('e.g. COMP', { exact: true }).fill('COMP')

    await page.screenshot({
      path: testInfo.outputPath('02-create-form-filled.png'),
      fullPage: true,
    })

    await page.getByRole('button', { name: /Preview & Submit/i }).click()
    await page.screenshot({
      path: testInfo.outputPath('03-create-preview.png'),
      fullPage: true,
    })

    await page.getByRole('button', { name: /Confirm Submission/i }).click()
    await expect(page.getByText('Amendment submitted successfully')).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('04-create-success.png'),
      fullPage: true,
    })

    // --- READ ---
    await page.getByPlaceholder('e.g. COMP3047').fill(courseCode)
    const row = page.locator('tr', { hasText: courseCode }).first()
    await expect(row).toBeVisible()
    await expect(row).toContainText(studentNo)
    await expect(row).toContainText('E2E Full CRUD Student')
    await expect(row).toContainText('B')
    await expect(row).toContainText('A')
    await page.screenshot({
      path: testInfo.outputPath('05-read-search.png'),
      fullPage: true,
    })

    // --- UPDATE ---
    await row.locator('button[title="Edit"]').click()
    await page.screenshot({
      path: testInfo.outputPath('06-update-form-open.png'),
      fullPage: true,
    })

    await form.locator('.row.g-3.mb-4 select').nth(1).selectOption('A-')
    await form.getByPlaceholder('e.g. Software Engineering').fill('E2E Updated Course Title')
    await page.screenshot({
      path: testInfo.outputPath('07-update-form-changed.png'),
      fullPage: true,
    })

    await page.getByRole('button', { name: /Review Changes/i }).click()
    await page.screenshot({
      path: testInfo.outputPath('08-update-review.png'),
      fullPage: true,
    })

    await page.getByRole('button', { name: /Confirm Update/i }).click()
    await expect(page.getByText('Amendment updated successfully')).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('09-update-success.png'),
      fullPage: true,
    })

    // Verify updated values
    await page.getByPlaceholder('e.g. COMP3047').fill(courseCode)
    const updatedRow = page.locator('tr', { hasText: courseCode }).first()
    await expect(updatedRow).toBeVisible()
    await expect(updatedRow).toContainText('A-')
    await page.screenshot({
      path: testInfo.outputPath('10-update-verified.png'),
      fullPage: true,
    })

    // --- DELETE ---
    await updatedRow.locator('.btn-outline-danger').click()
    await page.waitForTimeout(500)
    await expect(page.locator('tr', { hasText: courseCode })).toHaveCount(0)
    await page.screenshot({
      path: testInfo.outputPath('11-delete-success.png'),
      fullPage: true,
    })
  })

  test('create multiple amendments and read all', async ({ page }, testInfo) => {
    page.on('dialog', (dialog) => dialog.accept())
    await loginTeacherDemo(page)
    await page.goto(routePath(testInfo.project.use.baseURL, '/amendments'))

    const notFound = page.getByRole('heading', { name: /404: Not Found/i })
    if ((await notFound.count()) > 0 && (await notFound.first().isVisible())) {
      test.skip(true, 'Amendments route not available.')
    }
    await expect(page.getByRole('heading', { name: /Grade Amendments/i })).toBeVisible()

    const suffix = Date.now().toString().slice(-4)
    const codes = [`COMP7${suffix}`, `COMP8${suffix}`]

    for (let i = 0; i < codes.length; i++) {
      await page.getByRole('button', { name: /New Amendment/i }).click()
      const form = page.locator('form').first()
      await form.getByPlaceholder('e.g. 22240802').fill(`MULTI${suffix}${i}`)
      await form.locator('.row.g-3.mb-3').nth(1).locator('input').nth(1).fill(`Multi Student ${i + 1}`)
      await form.getByPlaceholder('e.g. COMP3047').fill(codes[i])
      await form.getByPlaceholder('e.g. Software Engineering').fill(`Course ${i + 1}`)
      await form.locator('.row.g-3.mb-4 select').nth(0).selectOption('C')
      await form.locator('.row.g-3.mb-4 select').nth(1).selectOption('B')
      await form.getByLabel('Conversion of temporary grade (I, NR, PR, YR)').check()
      await form.getByPlaceholder('e.g. Dr. Martin Choy').fill('Dr. Multi')
      await form.getByPlaceholder('e.g. COMP', { exact: true }).fill('COMP')
      await page.getByRole('button', { name: /Preview & Submit/i }).click()
      await page.getByRole('button', { name: /Confirm Submission/i }).click()
      await expect(page.getByText('Amendment submitted successfully')).toBeVisible()
    }

    await page.screenshot({
      path: testInfo.outputPath('multi-01-both-created.png'),
      fullPage: true,
    })

    // Verify both visible via search
    await page.getByPlaceholder('e.g. COMP3047').fill(`COMP`)
    for (const code of codes) {
      await expect(page.locator('tr', { hasText: code }).first()).toBeVisible()
    }
    await page.screenshot({
      path: testInfo.outputPath('multi-02-both-visible.png'),
      fullPage: true,
    })
  })

  test('create and then update multiple fields', async ({ page }, testInfo) => {
    page.on('dialog', (dialog) => dialog.accept())
    await loginTeacherDemo(page)
    await page.goto(routePath(testInfo.project.use.baseURL, '/amendments'))

    const notFound = page.getByRole('heading', { name: /404: Not Found/i })
    if ((await notFound.count()) > 0 && (await notFound.first().isVisible())) {
      test.skip(true, 'Amendments route not available.')
    }
    await expect(page.getByRole('heading', { name: /Grade Amendments/i })).toBeVisible()

    const code = `COMP5${Date.now().toString().slice(-4)}`

    // Create
    await page.getByRole('button', { name: /New Amendment/i }).click()
    const form = page.locator('form').first()
    await form.getByPlaceholder('e.g. 22240802').fill('UPD99999')
    await form.locator('.row.g-3.mb-3').nth(1).locator('input').nth(1).fill('Update Test')
    await form.getByPlaceholder('e.g. COMP3047').fill(code)
    await form.getByPlaceholder('e.g. Software Engineering').fill('Before Update')
    await form.locator('.row.g-3.mb-4 select').nth(0).selectOption('C')
    await form.locator('.row.g-3.mb-4 select').nth(1).selectOption('B')
    await form.getByLabel('Conversion of temporary grade (I, NR, PR, YR)').check()
    await form.getByPlaceholder('e.g. Dr. Martin Choy').fill('Dr. Before')
    await form.getByPlaceholder('e.g. COMP', { exact: true }).fill('COMP')
    await page.getByRole('button', { name: /Preview & Submit/i }).click()
    await page.getByRole('button', { name: /Confirm Submission/i }).click()
    await expect(page.getByText('Amendment submitted successfully')).toBeVisible()

    // Edit multiple fields
    await page.getByPlaceholder('e.g. COMP3047').fill(code)
    const row = page.locator('tr', { hasText: code }).first()
    await row.locator('button[title="Edit"]').click()

    await form.locator('.row.g-3.mb-4 select').nth(1).selectOption('A+')
    await form.getByPlaceholder('e.g. Software Engineering').fill('After Update Title')

    await page.getByRole('button', { name: /Review Changes/i }).click()
    await page.screenshot({
      path: testInfo.outputPath('multifield-01-review.png'),
      fullPage: true,
    })

    await page.getByRole('button', { name: /Confirm Update/i }).click()
    await expect(page.getByText('Amendment updated successfully')).toBeVisible()

    await page.getByPlaceholder('e.g. COMP3047').fill(code)
    const updatedRow = page.locator('tr', { hasText: code }).first()
    await expect(updatedRow).toContainText('A+')
    await page.screenshot({
      path: testInfo.outputPath('multifield-02-verified.png'),
      fullPage: true,
    })
  })
})
