import { expect, test } from '@playwright/test'

function setDemoUser(page, role, name, email) {
  return page.addInitScript(
    ({ roleArg, nameArg, emailArg }) => {
      const token = `demo_token_${roleArg.toLowerCase()}_${Date.now()}`
      const user = { email: emailArg, name: nameArg, role: roleArg }
      window.localStorage.setItem('token', token)
      window.localStorage.setItem('user', JSON.stringify(user))
    },
    { roleArg: role, nameArg: name, emailArg: email },
  )
}

test('teacher-admin workflow covers create/read/update/delete with screenshots', async ({ page }, testInfo) => {
  test.setTimeout(120000)
  page.on('dialog', (dialog) => dialog.accept())

  const isAzureDeploy = /azurestaticapps\.net/.test(testInfo.project.use.baseURL || '')
  const pathFor = (route) => (isAzureDeploy ? `/#${route}` : route)

  const courseCode = `COMP8${Date.now().toString().slice(-4)}`
  const deleteCourseCode = `COMP7${Date.now().toString().slice(-4)}`

  // Create amendment (CREATE)
  await setDemoUser(page, 'Teacher', 'Dr. Martin Choy', 'teacher.demo@hkbu.edu.hk')
  await page.goto(pathFor('/amendments'))

  const notFoundHeading = page.getByRole('heading', { name: /404: Not Found/i })
  if ((await notFoundHeading.count()) > 0 && (await notFoundHeading.first().isVisible())) {
    test.skip(true, 'Target deployment does not expose required routes for this workflow test.')
  }

  await expect(page.getByRole('heading', { name: /Grade Amendments/i })).toBeVisible()
  await page.getByRole('button', { name: /New Amendment/i }).click()

  const amendmentForm = page.locator('form').first()
  await amendmentForm.getByPlaceholder('e.g. 22240802').fill('UT654321')
  await amendmentForm.locator('.row.g-3.mb-3').nth(1).locator('input').nth(1).fill('Workflow CRUD')
  await amendmentForm.getByPlaceholder('e.g. COMP3047').fill(courseCode)
  await amendmentForm.getByPlaceholder('e.g. Software Engineering').fill('Workflow Testing')
  await amendmentForm.locator('.row.g-3.mb-4 select').nth(0).selectOption('B+')
  await amendmentForm.locator('.row.g-3.mb-4 select').nth(1).selectOption('A')
  await amendmentForm.getByLabel('Conversion of temporary grade (I, NR, PR, YR)').check()
  await amendmentForm.getByPlaceholder('e.g. Dr. Martin Choy').fill('Dr. Martin Choy')
  await amendmentForm.getByPlaceholder('e.g. COMP', { exact: true }).fill('COMP')

  await page.getByRole('button', { name: /Preview & Submit/i }).click()
  await page.getByRole('button', { name: /Confirm Submission/i }).click()
  await expect(page.getByText('Amendment submitted successfully')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('workflow-01-create-amendment.png'), fullPage: true })

  // Read + update via submissions workflow
  await page.goto(pathFor('/submissions'))
  await expect(page.getByRole('heading', { name: /Submissions/i })).toBeVisible()

  const submissionRow = page
    .locator('tbody tr')
    .filter({ has: page.getByRole('button', { name: /Submit to Program Director/i }) })
    .first()
  await expect(submissionRow).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('workflow-02-read-submission-row.png'), fullPage: true })

  await submissionRow.getByRole('button', { name: /Submit to Program Director/i }).click()
  await page.waitForTimeout(800)

  // Admin reads details and updates reminder setting (UPDATE)
  await setDemoUser(page, 'admin', 'Administrator', 'admin.demo@hkbu.edu.hk')
  await page.goto(pathFor('/admin'))
  await expect(page.getByRole('heading', { name: /Submissions Management/i })).toBeVisible()

  await page.getByRole('button', { name: /^Pending$/ }).click()
  const adminRow = page.locator('tbody tr').first()
  await expect(adminRow).toBeVisible()
  await adminRow.locator('button[title="View Details"]').click()
  await expect(page.getByText(/Submitted by:/i)).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('workflow-03-read-admin-detail.png'), fullPage: true })

  const detailModal = page.locator('.modal.d-block').last()
  await detailModal.getByRole('button', { name: /^Close$/ }).click()
  await expect(detailModal).toBeHidden()
  const thresholdInput = page.getByRole('spinbutton').first()
  await thresholdInput.fill('4')
  await page.locator('button.btn-warning:has-text("Save")').first().click()
  await expect(page.getByText(/Reminder threshold updated/i)).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('workflow-04-update-settings.png'), fullPage: true })

  // Switch back to teacher for delete operation
  await setDemoUser(page, 'Teacher', 'Dr. Martin Choy', 'teacher.demo@hkbu.edu.hk')

  // Create a dedicated amendment and delete it (DELETE)
  await page.goto(pathFor('/amendments'))
  await page.getByRole('button', { name: /New Amendment/i }).click()
  const deleteForm = page.locator('form').first()
  await deleteForm.getByPlaceholder('e.g. 22240802').fill('UT000777')
  await deleteForm.locator('.row.g-3.mb-3').nth(1).locator('input').nth(1).fill('Delete Candidate')
  await deleteForm.getByPlaceholder('e.g. COMP3047').fill(deleteCourseCode)
  await deleteForm.getByPlaceholder('e.g. Software Engineering').fill('Deletion Testing')
  await deleteForm.locator('.row.g-3.mb-4 select').nth(0).selectOption('B')
  await deleteForm.locator('.row.g-3.mb-4 select').nth(1).selectOption('A-')
  await deleteForm.getByLabel('Conversion of temporary grade (I, NR, PR, YR)').check()
  await deleteForm.getByPlaceholder('e.g. Dr. Martin Choy').fill('Dr. Martin Choy')
  await deleteForm.getByPlaceholder('e.g. COMP', { exact: true }).fill('COMP')
  await page.getByRole('button', { name: /Preview & Submit/i }).click()
  await page.getByRole('button', { name: /Confirm Submission/i }).click()
  await expect(page.getByText('Amendment submitted successfully')).toBeVisible()

  await page.getByPlaceholder('e.g. COMP3047').fill(deleteCourseCode)
  const amendmentRow = page.locator('tr', { hasText: deleteCourseCode }).first()
  await expect(amendmentRow).toBeVisible()
  await amendmentRow.locator('.btn-outline-danger').click()
  await expect(page.getByText(deleteCourseCode)).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath('workflow-06-delete-amendment.png'), fullPage: true })
})
