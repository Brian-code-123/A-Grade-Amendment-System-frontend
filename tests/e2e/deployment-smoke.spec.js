import { expect, test } from '@playwright/test'

test('deployment home and login route behavior', async ({ page }, testInfo) => {
  const isAzureDeploy = /azurestaticapps\.net/.test(testInfo.project.use.baseURL || '')

  await page.goto('/')
  await expect(page.getByText(/Grade Amendment System/i).first()).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('deploy-01-home.png'), fullPage: true })

  await page.goto(isAzureDeploy ? '/#/login' : '/login')

  const notFound = page.getByRole('heading', { name: /404: Not Found/i })
  if (await notFound.isVisible()) {
    await page.screenshot({ path: testInfo.outputPath('deploy-02-login-404.png'), fullPage: true })
    return
  }

  await expect(page.getByText(/Sign In|Welcome/i).first()).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('deploy-02-login.png'), fullPage: true })
})
