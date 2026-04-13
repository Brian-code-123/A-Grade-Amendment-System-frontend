import { expect, test } from '@playwright/test'

test('teacher demo can perform extended CRUD on amendments with screenshots', async ({ page }, testInfo) => {
  page.on('dialog', (dialog) => dialog.accept())
  const isAzureDeploy = /azurestaticapps\.net/.test(testInfo.project.use.baseURL || '')

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

  await page.goto(isAzureDeploy ? '/#/amendments' : '/amendments')
  await expect(page.getByRole('heading', { name: /Grade Amendments/i })).toBeVisible()

  const code1 = `COMP6${Date.now().toString().slice(-4)}`
  const code2 = `COMP5${Date.now().toString().slice(-4)}`

  async function createAmendment(courseCode, studentNo, studentName) {
    await page.getByRole('button', { name: /New Amendment/i }).click()
    const form = page.locator('form').first()
    await form.getByPlaceholder('e.g. 22240802').fill(studentNo)
    await form.locator('.row.g-3.mb-3').nth(1).locator('input').nth(1).fill(studentName)
    await form.getByPlaceholder('e.g. COMP3047').fill(courseCode)
    await form.getByPlaceholder('e.g. Software Engineering').fill('Extended CRUD Testing')
    await form.locator('.row.g-3.mb-4 select').nth(0).selectOption('B')
    await form.locator('.row.g-3.mb-4 select').nth(1).selectOption('A')
    await form.getByLabel('Conversion of temporary grade (I, NR, PR, YR)').check()
    await form.getByPlaceholder('e.g. Dr. Martin Choy').fill('Dr. Test')
    await form.getByPlaceholder('e.g. COMP', { exact: true }).fill('COMP')
    await page.getByRole('button', { name: /Preview & Submit/i }).click()
    await page.getByRole('button', { name: /Confirm Submission/i }).click()
    await expect(page.getByText('Amendment submitted successfully')).toBeVisible()
  }

  await createAmendment(code1, 'UT300001', 'Extended CRUD One')
  await page.screenshot({ path: testInfo.outputPath('extended-01-create-first.png'), fullPage: true })

  await createAmendment(code2, 'UT300002', 'Extended CRUD Two')
  await page.screenshot({ path: testInfo.outputPath('extended-02-create-second.png'), fullPage: true })

  await page.getByPlaceholder('e.g. COMP3047').fill(code1)
  const row1 = page.locator('tr', { hasText: code1 }).first()
  await expect(row1).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('extended-03-read-filtered.png'), fullPage: true })

  await row1.locator('button[title="Edit"]').click()
  const form = page.locator('form').first()
  await form.locator('.row.g-3.mb-4 select').nth(1).selectOption('A-')
  await page.getByRole('button', { name: /Review Changes/i }).click()
  await page.getByRole('button', { name: /Confirm Update/i }).click()
  await expect(page.getByText('Amendment updated successfully')).toBeVisible()

  await page.getByPlaceholder('e.g. COMP3047').fill(code1)
  await expect(page.locator('tr', { hasText: code1 }).first()).toContainText('A-')
  await page.screenshot({ path: testInfo.outputPath('extended-04-update.png'), fullPage: true })

  await page.getByPlaceholder('e.g. COMP3047').fill(code2)
  const row2 = page.locator('tr', { hasText: code2 }).first()
  await expect(row2).toBeVisible()
  await row2.locator('.btn-outline-danger').click()
  await expect(page.getByText(code2)).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath('extended-05-delete-second.png'), fullPage: true })

  await page.getByPlaceholder('e.g. COMP3047').fill(code1)
  await expect(page.locator('tr', { hasText: code1 }).first()).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('extended-06-final-state.png'), fullPage: true })
})
