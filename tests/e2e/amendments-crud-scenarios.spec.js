import { expect, test } from '@playwright/test'

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

async function openAmendmentsPage(page, baseURL) {
  await page.goto(routePath(baseURL, '/amendments'))
  await expect(page.getByRole('heading', { name: /Grade Amendments/i })).toBeVisible()
}

async function createAmendment(page, courseCode, studentNo, studentName, newGrade = 'A') {
  await page.getByRole('button', { name: /New Amendment/i }).click()
  const form = page.locator('form').first()
  await form.getByPlaceholder('e.g. 22240802').fill(studentNo)
  await form.locator('.row.g-3.mb-3').nth(1).locator('input').nth(1).fill(studentName)
  await form.getByPlaceholder('e.g. COMP3047').fill(courseCode)
  await form.getByPlaceholder('e.g. Software Engineering').fill('E2E Scenario Testing')
  await form.locator('.row.g-3.mb-4 select').nth(0).selectOption('B')
  await form.locator('.row.g-3.mb-4 select').nth(1).selectOption(newGrade)
  await form.getByLabel('Conversion of temporary grade (I, NR, PR, YR)').check()
  await form.getByPlaceholder('e.g. Dr. Martin Choy').fill('Dr. Test')
  await form.getByPlaceholder('e.g. COMP', { exact: true }).fill('COMP')
  await page.getByRole('button', { name: /Preview & Submit/i }).click()
  await page.getByRole('button', { name: /Confirm Submission/i }).click()
  await expect(page.getByText('Amendment submitted successfully')).toBeVisible()
}

test('scenario-01 create amendment', async ({ page }, testInfo) => {
  await loginTeacherDemo(page)
  await openAmendmentsPage(page, testInfo.project.use.baseURL)

  const code = `COMP61${Date.now().toString().slice(-3)}`
  await createAmendment(page, code, 'UT410001', 'Scenario Create One')

  await page.screenshot({ path: testInfo.outputPath('s01-create.png'), fullPage: true })
})

test('scenario-02 create and read with search', async ({ page }, testInfo) => {
  await loginTeacherDemo(page)
  await openAmendmentsPage(page, testInfo.project.use.baseURL)

  const code = `COMP62${Date.now().toString().slice(-3)}`
  await createAmendment(page, code, 'UT410002', 'Scenario Read One')

  await page.getByPlaceholder('e.g. COMP3047').fill(code)
  await expect(page.locator('tr', { hasText: code }).first()).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('s02-read.png'), fullPage: true })
})

test('scenario-03 create and update grade', async ({ page }, testInfo) => {
  await loginTeacherDemo(page)
  await openAmendmentsPage(page, testInfo.project.use.baseURL)

  const code = `COMP63${Date.now().toString().slice(-3)}`
  await createAmendment(page, code, 'UT410003', 'Scenario Update Grade')

  await page.getByPlaceholder('e.g. COMP3047').fill(code)
  const row = page.locator('tr', { hasText: code }).first()
  await row.locator('button[title="Edit"]').click()

  const form = page.locator('form').first()
  await form.locator('.row.g-3.mb-4 select').nth(1).selectOption('A-')
  await page.getByRole('button', { name: /Review Changes/i }).click()
  await page.getByRole('button', { name: /Confirm Update/i }).click()

  await expect(page.getByText('Amendment updated successfully')).toBeVisible()
  await page.getByPlaceholder('e.g. COMP3047').fill(code)
  await expect(page.locator('tr', { hasText: code }).first()).toContainText('A-')
  await page.screenshot({ path: testInfo.outputPath('s03-update-grade.png'), fullPage: true })
})

test('scenario-04 create and update course title', async ({ page }, testInfo) => {
  await loginTeacherDemo(page)
  await openAmendmentsPage(page, testInfo.project.use.baseURL)

  const code = `COMP64${Date.now().toString().slice(-3)}`
  await createAmendment(page, code, 'UT410004', 'Scenario Update Title')

  await page.getByPlaceholder('e.g. COMP3047').fill(code)
  const row = page.locator('tr', { hasText: code }).first()
  await row.locator('button[title="Edit"]').click()

  const form = page.locator('form').first()
  await form.getByPlaceholder('e.g. Software Engineering').fill('E2E Updated Course Title')
  await page.getByRole('button', { name: /Review Changes/i }).click()
  await page.getByRole('button', { name: /Confirm Update/i }).click()

  await expect(page.getByText('Amendment updated successfully')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('s04-update-title.png'), fullPage: true })
})

test('scenario-05 create and delete', async ({ page }, testInfo) => {
  await loginTeacherDemo(page)
  await openAmendmentsPage(page, testInfo.project.use.baseURL)

  const code = `COMP65${Date.now().toString().slice(-3)}`
  await createAmendment(page, code, 'UT410005', 'Scenario Delete One')

  await page.getByPlaceholder('e.g. COMP3047').fill(code)
  const row = page.locator('tr', { hasText: code }).first()
  await row.locator('.btn-outline-danger').click()
  await page.waitForTimeout(700)

  await page.screenshot({ path: testInfo.outputPath('s05-delete.png'), fullPage: true })
})

test('scenario-06 create two and read both', async ({ page }, testInfo) => {
  await loginTeacherDemo(page)
  await openAmendmentsPage(page, testInfo.project.use.baseURL)

  const suffix = Date.now().toString().slice(-3)
  const code1 = `COMP66${suffix}`
  const code2 = `COMP67${suffix}`
  await createAmendment(page, code1, 'UT410006', 'Scenario Two One')
  await createAmendment(page, code2, 'UT410007', 'Scenario Two Two')

  await page.getByPlaceholder('e.g. COMP3047').fill('COMP')
  await expect(page.locator('tr', { hasText: code1 }).first()).toBeVisible()
  await expect(page.locator('tr', { hasText: code2 }).first()).toBeVisible()

  await page.screenshot({ path: testInfo.outputPath('s06-read-two.png'), fullPage: true })
})

test('scenario-07 full CRUD cycle create-read-update-delete', async ({ page }, testInfo) => {
  await loginTeacherDemo(page)
  await openAmendmentsPage(page, testInfo.project.use.baseURL)

  const code = `COMP68${Date.now().toString().slice(-3)}`
  await createAmendment(page, code, 'UT410008', 'Scenario Full CRUD')

  await page.getByPlaceholder('e.g. COMP3047').fill(code)
  const row = page.locator('tr', { hasText: code }).first()
  await expect(row).toBeVisible()

  await row.locator('button[title="Edit"]').click()
  const form = page.locator('form').first()
  await form.locator('.row.g-3.mb-4 select').nth(1).selectOption('A+')
  await page.getByRole('button', { name: /Review Changes/i }).click()
  await page.getByRole('button', { name: /Confirm Update/i }).click()
  await expect(page.getByText('Amendment updated successfully')).toBeVisible()

  await page.getByPlaceholder('e.g. COMP3047').fill(code)
  const updatedRow = page.locator('tr', { hasText: code }).first()
  await expect(updatedRow).toContainText('A+')

  await updatedRow.locator('.btn-outline-danger').click()
  await page.waitForTimeout(700)
  await page.screenshot({ path: testInfo.outputPath('s07-full-crud.png'), fullPage: true })
})
