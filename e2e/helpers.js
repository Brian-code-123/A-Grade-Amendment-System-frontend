/**
 * E2E helper: logs in as the admin demo user.
 * Uses the /demo-login route which sets a demo token in localStorage.
 */
export async function loginAsAdmin(page) {
  await page.goto('/demo-login')
  // DemoLoginView auto-redirects to '/' after setting the token
  await page.waitForURL('/', { timeout: 10000 })
}

/**
 * E2E helper: logs in as the PD demo user.
 * Navigates to /demo-verify which sets a PD demo token.
 */
export async function loginAsPD(page) {
  await page.goto('/demo-verify')
  await page.waitForURL('/', { timeout: 10000 })
}

/**
 * Set a demo user directly in localStorage (faster than navigating).
 */
export async function setDemoAuth(page, role = 'Programme Director') {
  await page.addInitScript(({ role }) => {
    const token = 'demo_token_playwright_' + Date.now()
    const user = {
      email: role === 'admin' ? 'admin@hkbu.edu.hk' : 'pd@hkbu.edu.hk',
      name: role === 'admin' ? 'Administrator' : 'Programme Director',
      role,
      signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    }
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }, { role })
}
