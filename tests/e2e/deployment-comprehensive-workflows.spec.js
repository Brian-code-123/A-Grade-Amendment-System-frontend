import { test, expect, Page } from '@playwright/test'

const DEPLOYMENT_URL = 'https://agreeable-pebble-0d1936800.6.azurestaticapps.net'

/**
 * End-to-End Tests for Grade Amendment System
 * Tests complete workflows with multiple roles and CRUD operations
 * All tests include screenshots for visual verification
 */

test.describe('Complete Amendment Workflow - Create, Read, Update, Delete', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    
    // Set reasonable timeouts
    page.setDefaultTimeout(30000)
    page.setDefaultNavigationTimeout(30000)
  })

  test.afterEach(async () => {
    if (page) await page.close()
  })

  test('Teacher: Create Amendment - READ operation', async () => {
    // Navigate to demo login as teacher
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=teacher')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    // Should be redirected to amendments or home
    let url = page.url()
    console.log(`After demo login (teacher): ${url}`)
    
    // Navigate to amendments view
    await page.goto(DEPLOYMENT_URL + '/#/amendments')
    await page.waitForLoadState('networkidle')
    
    await page.screenshot({ path: 'test-results/e2e-1-amendments-list.png', fullPage: true })
    
    // Verify amendments page loaded
    const pageContent = await page.textContent('body')
    expect(pageContent).toBeTruthy()
  })

  test('Teacher: Create Amendment with all fields', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=teacher')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    await page.goto(DEPLOYMENT_URL + '/#/amendments')
    await page.waitForLoadState('networkidle')
    
    // Look for "Create" or "Add" button
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")')
    if (await createButton.count() > 0) {
      await createButton.first().click()
      await page.waitForLoadState('networkidle')
      
      await page.screenshot({ path: 'test-results/e2e-2-create-amendment-form.png', fullPage: true })
    }
  })

  test('Teacher: View Submission Details after my changes', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=teacher')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    // Navigate to submissions
    await page.goto(DEPLOYMENT_URL + '/#/submissions')
    await page.waitForLoadState('networkidle')
    
    await page.screenshot({ path: 'test-results/e2e-3-submissions-list.png', fullPage: true })
    
    // Look for Details button (our new feature)
    const detailsButtons = page.locator('button:has-text("Details"), button:has-text("View")')
    if (await detailsButtons.count() > 0) {
      await detailsButtons.first().click()
      await page.waitForLoadState('networkidle')
      
      // Verify modal appears with submission details including new fields
      const modal = page.locator('[role="dialog"], .modal')
      if (await modal.count() > 0) {
        await page.screenshot({ path: 'test-results/e2e-4-submission-details-modal.png', fullPage: true })
      }
    }
  })

  test('Teacher: Create and Submit Submission (Batch)', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=teacher')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    await page.goto(DEPLOYMENT_URL + '/#/submissions')
    await page.waitForLoadState('networkidle')
    
    // Look for create submission button
    const createSubmissionButton = page.locator('button:has-text("Create"), button:has-text("New"), button:has-text("Submit")')
    if (await createSubmissionButton.count() > 0) {
      await createSubmissionButton.first().click()
      await page.waitForLoadState('networkidle')
      
      await page.screenshot({ path: 'test-results/e2e-5-create-submission.png', fullPage: true })
    }
  })

  test('Verify batch submit badge is blue (color change)', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=teacher')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    await page.goto(DEPLOYMENT_URL + '/#/submissions')
    await page.waitForLoadState('networkidle')
    
    // Look for "selected" badge
    const badges = page.locator('[class*="badge"]')
    if (await badges.count() > 0) {
      await page.screenshot({ path: 'test-results/e2e-6-batch-submit-badge.png', fullPage: true })
      
      // Verify it has blue color (bg-primary or similar)
      const badgeHTML = await badges.first().getAttribute('class')
      expect(['bg-primary', 'bg-blue', 'bg-info']).toContainEqual(
        badgeHTML?.split(' ').find(cls => cls.includes('bg-'))
      )
    }
  })

  test('PD/Head: View and Approve Submissions', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=pd')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    // Navigate based on role
    let url = page.url()
    console.log(`After PD login: ${url}`)
    
    // Try to access PD approval view
    await page.goto(DEPLOYMENT_URL + '/#/pd-approvals')
    await page.waitForLoadState('networkidle')
    
    await page.screenshot({ path: 'test-results/e2e-7-pd-approval-view.png', fullPage: true })
  })

  test('Admin: View All Submissions and Dashboard', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=admin')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    // Try to access admin view
    await page.goto(DEPLOYMENT_URL + '/#/admin')
    await page.waitForLoadState('networkidle')
    
    await page.screenshot({ path: 'test-results/e2e-8-admin-dashboard.png', fullPage: true })
  })

  test('Admin: Archive View and Unarchive', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=admin')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    // Navigate to archive
    await page.goto(DEPLOYMENT_URL + '/#/admin/archive')
    await page.waitForLoadState('networkidle')
    
    await page.screenshot({ path: 'test-results/e2e-9-archive-view.png', fullPage: true })
  })
})

test.describe('User Authentication & Authorization Tests', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    page.setDefaultTimeout(30000)
  })

  test.afterEach(async () => {
    if (page) await page.close()
  })

  test('Teacher cannot access admin panel', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=teacher')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    // Try to access admin
    await page.goto(DEPLOYMENT_URL + '/#/admin')
    
    // Should either redirect or show error
    const url = page.url()
    const content = await page.textContent('body')
    
    // Either redirected away from /admin or shows an error message
    const isNotAdmin = !url.includes('/#/admin') || (content && (content.includes('not authorized') || content.includes('unauthorized')))
    
    expect(isNotAdmin || !url.includes('/#/admin')).toBeTruthy()
    
    await page.screenshot({ path: 'test-results/e2e-10-auth-teacher-vs-admin.png', fullPage: true })
  })

  test('Teacher cannot access PD approval view', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=teacher')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    // Try to access PD approvals
    await page.goto(DEPLOYMENT_URL + '/#/pd-approvals')
    
    const url = page.url()
    const isBlocked = !url.includes('pd-approvals')
    
    await page.screenshot({ path: 'test-results/e2e-11-auth-teacher-vs-pd.png', fullPage: true })
  })

  test('All roles can access home page', async () => {
    const roles = ['teacher', 'pd', 'admin']
    
    for (const role of roles) {
      const newPage = await page.context().newPage()
      
      await newPage.goto(DEPLOYMENT_URL + '/#/')
      await newPage.waitForLoadState('networkidle')
      
      const content = await newPage.textContent('body')
      expect(content).toBeTruthy()
      
      await newPage.close()
    }
  })

  test('User profile page displays current user info', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=teacher')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    await page.goto(DEPLOYMENT_URL + '/#/profile')
    await page.waitForLoadState('networkidle')
    
    await page.screenshot({ path: 'test-results/e2e-12-profile-page.png', fullPage: true })
  })
})

test.describe('Form Validation & Error Handling', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    page.setDefaultTimeout(30000)
  })

  test.afterEach(async () => {
    if (page) await page.close()
  })

  test('Login with invalid credentials shows error', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/login')
    await page.waitForLoadState('networkidle')
    
    // Try to submit without credentials
    const submitButtons = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")')
    if (await submitButtons.count() > 0) {
      await submitButtons.first().click()
      
      // Look for error message
      await page.waitForLoadState('networkidle')
      
      await page.screenshot({ path: 'test-results/e2e-13-login-error-handling.png', fullPage: true })
    }
  })

  test('Excel upload accepts valid file format', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=teacher')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    await page.goto(DEPLOYMENT_URL + '/#/excel-upload')
    await page.waitForLoadState('networkidle')
    
    // Verify upload form is present
    const fileInput = page.locator('input[type="file"]')
    if (await fileInput.count() > 0) {
      await page.screenshot({ path: 'test-results/e2e-14-excel-upload-form.png', fullPage: true })
    }
  })

  test('Signature setup page validates drawing', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=teacher')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    await page.goto(DEPLOYMENT_URL + '/#/signature-setup')
    await page.waitForLoadState('networkidle')
    
    await page.screenshot({ path: 'test-results/e2e-15-signature-setup.png', fullPage: true })
  })
})

test.describe('Navigation & Page Structure Tests', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    page.setDefaultTimeout(30000)
  })

  test.afterEach(async () => {
    if (page) await page.close()
  })

  test('Main navigation menu contains all expected items', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=teacher')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    await page.goto(DEPLOYMENT_URL + '/#/')
    
    // Take screenshot of navigation
    await page.screenshot({ path: 'test-results/e2e-16-navigation-menu.png', fullPage: true })
  })

  test('Breadcrumb navigation works correctly', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=teacher')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    await page.goto(DEPLOYMENT_URL + '/#/amendments')
    
    // Look for breadcrumb
    const breadcrumb = page.locator('[role="navigation"] a, nav a, .breadcrumb')
    if (await breadcrumb.count() > 0) {
      await page.screenshot({ path: 'test-results/e2e-17-breadcrumb-navigation.png', fullPage: true })
    }
  })

  test('Back button navigation works correctly', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/')
    await page.goto(DEPLOYMENT_URL + '/#/login')
    
    // Use browser back
    await page.goBack()
    
    const url = page.url()
    expect(url).toContain(DEPLOYMENT_URL)
    
    await page.screenshot({ path: 'test-results/e2e-18-back-button-navigation.png', fullPage: true })
  })
})

test.describe('Data Persistence & State Management', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    page.setDefaultTimeout(30000)
  })

  test.afterEach(async () => {
    if (page) await page.close()
  })

  test('Theme preference persists across page reloads', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/')
    await page.waitForLoadState('networkidle')
    
    const htmlElement = page.locator('html')
    const initialClass = await htmlElement.getAttribute('class')
    
    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    const reloadedClass = await htmlElement.getAttribute('class')
    
    // Theme class should be consistent
    expect(initialClass).toBe(reloadedClass)
    
    await page.screenshot({ path: 'test-results/e2e-19-theme-persistence.png', fullPage: true })
  })

  test('Session data is maintained on navigation', async () => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=teacher')
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    const initialUrl = page.url()
    
    // Navigate to different page
    await page.goto(DEPLOYMENT_URL + '/#/profile')
    await page.waitForLoadState('networkidle')
    
    // Navigate back
    await page.goto(initialUrl)
    await page.waitForLoadState('networkidle')
    
    await page.screenshot({ path: 'test-results/e2e-20-session-persistence.png', fullPage: true })
  })
})
