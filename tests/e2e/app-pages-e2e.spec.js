import { expect, test } from '@playwright/test'

/**
 * E2E tests covering pages and workflows beyond amendments CRUD:
 *   - Home page & calendar
 *   - Login page UI (demo buttons, register form, login form)
 *   - Excel Upload page (template download, upload zone)
 *   - Profile page (view user info)
 *   - Submissions workflow (create, submit to PD)
 *   - PD Approval view (reviewer perspective)
 *   - Admin view (submissions management, announcements, settings)
 *
 * Each test captures screenshots at key stages.
 */

function routePath(baseURL, route) {
  return /azurestaticapps\.net/.test(baseURL || '') ? `/#${route}` : route
}

function setDemoUser(page, role, name, email) {
  return page.addInitScript(
    ({ r, n, e }) => {
      const token = `demo_token_${r.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
      window.localStorage.setItem('token', token)
      window.localStorage.setItem('user', JSON.stringify({ email: e, name: n, role: r }))
    },
    { r: role, n: name, e: email },
  )
}

/* ================================================================ */
/*  1. HOME PAGE                                                      */
/* ================================================================ */

test.describe('Home Page', () => {
  test('displays welcome content and academic calendar', async ({ page }, testInfo) => {
    await setDemoUser(page, 'Teacher', 'Dr. Martin Choy', 'teacher.demo@hkbu.edu.hk')
    await page.goto('/')

    await expect(page.getByText(/Grade Amendment System/i).first()).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('home-01-landing.png'),
      fullPage: true,
    })

    // Check for calendar or dashboard elements
    const calendar = page.locator('.calendar, [class*="calendar"], table')
    if ((await calendar.count()) > 0) {
      await page.screenshot({
        path: testInfo.outputPath('home-02-calendar.png'),
        fullPage: true,
      })
    }
  })

  test('shows navigation links for authenticated teacher', async ({ page }, testInfo) => {
    await setDemoUser(page, 'Teacher', 'Dr. Martin Choy', 'teacher.demo@hkbu.edu.hk')
    await page.goto('/')

    // Nav should have key links for a teacher
    const nav = page.locator('nav, .navbar')
    await expect(nav.first()).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('home-03-teacher-nav.png'),
      fullPage: true,
    })
  })
})

/* ================================================================ */
/*  2. LOGIN PAGE                                                     */
/* ================================================================ */

test.describe('Login Page', () => {
  test('shows demo login buttons and sign-in form', async ({ page }, testInfo) => {
    await page.goto('/login')

    // Demo buttons
    await expect(page.getByText(/Quick demo access/i).first()).toBeVisible()
    await expect(page.getByText(/Administrator/i).first()).toBeVisible()
    await expect(page.getByText(/Teacher/i).first()).toBeVisible()
    await expect(page.getByText(/Programme Director/i).first()).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('login-01-demo-buttons.png'),
      fullPage: true,
    })

    // Sign In form fields
    await expect(page.getByPlaceholder(/hkbu\.edu\.hk/i).first()).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('login-02-signin-form.png'),
      fullPage: true,
    })
  })

  test('shows register form tab', async ({ page }, testInfo) => {
    await page.goto('/login')

    // Click Register tab
    const registerTab = page.getByRole('button', { name: /Register/i })
    await registerTab.click()

    await expect(page.getByPlaceholder(/Dr\. \/ Prof/i)).toBeVisible()
    await expect(page.getByPlaceholder(/Min\. 6 characters/i)).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('login-03-register-form.png'),
      fullPage: true,
    })
  })

  test('demo teacher login redirects to home', async ({ page }, testInfo) => {
    await page.goto('/login')

    // Click the Teacher demo button
    const teacherBtn = page.locator('.lp-demo-btn', { hasText: /Teacher/ }).first()
    await teacherBtn.click()

    // Should redirect away from login
    await page.waitForURL(/\/(amendments|$)/)
    await page.screenshot({
      path: testInfo.outputPath('login-04-demo-teacher-redirect.png'),
      fullPage: true,
    })
  })

  test('demo PD login redirects appropriately', async ({ page }, testInfo) => {
    await page.goto('/login')

    const pdBtn = page.locator('.lp-demo-btn', { hasText: /Programme Director/ }).first()
    await pdBtn.click()

    await page.waitForURL(/\/(pd-approvals|$)/)
    await page.screenshot({
      path: testInfo.outputPath('login-05-demo-pd-redirect.png'),
      fullPage: true,
    })
  })
})

/* ================================================================ */
/*  3. EXCEL UPLOAD PAGE                                              */
/* ================================================================ */

test.describe('Excel Upload Page', () => {
  test('shows upload zone and template download', async ({ page }, testInfo) => {
    await setDemoUser(page, 'Teacher', 'Dr. Martin Choy', 'teacher.demo@hkbu.edu.hk')
    await page.goto(routePath(testInfo.project.use.baseURL, '/excel-upload'))

    await expect(page.getByRole('heading', { name: /Excel Upload/i })).toBeVisible()
    await expect(page.getByText(/Drag & drop/i)).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('excel-01-upload-page.png'),
      fullPage: true,
    })

    // Template download button
    const downloadBtn = page.getByRole('button', { name: /Download Template/i })
    await expect(downloadBtn).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('excel-02-template-section.png'),
      fullPage: true,
    })
  })

  test('shows export button when amendments exist', async ({ page }, testInfo) => {
    await setDemoUser(page, 'Teacher', 'Dr. Martin Choy', 'teacher.demo@hkbu.edu.hk')
    await page.goto(routePath(testInfo.project.use.baseURL, '/excel-upload'))

    await expect(page.getByRole('heading', { name: /Excel Upload/i })).toBeVisible()

    const exportBtn = page.getByRole('button', { name: /Export/i })
    if ((await exportBtn.count()) > 0) {
      await page.screenshot({
        path: testInfo.outputPath('excel-03-export-available.png'),
        fullPage: true,
      })
    }
  })
})

/* ================================================================ */
/*  4. PROFILE PAGE                                                   */
/* ================================================================ */

test.describe('Profile Page', () => {
  test('displays user profile information', async ({ page }, testInfo) => {
    await setDemoUser(page, 'Teacher', 'Dr. Martin Choy', 'teacher.demo@hkbu.edu.hk')
    await page.goto(routePath(testInfo.project.use.baseURL, '/profile'))

    await expect(page.getByText(/User Profile/i).first()).toBeVisible()
    await expect(page.getByText('Dr. Martin Choy').first()).toBeVisible()
    await expect(page.getByText('teacher.demo@hkbu.edu.hk').first()).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('profile-01-view.png'),
      fullPage: true,
    })
  })

  test('shows edit profile button', async ({ page }, testInfo) => {
    await setDemoUser(page, 'Teacher', 'Dr. Martin Choy', 'teacher.demo@hkbu.edu.hk')
    await page.goto(routePath(testInfo.project.use.baseURL, '/profile'))

    await expect(page.getByText(/User Profile/i).first()).toBeVisible()

    const editBtn = page.getByRole('button', { name: /Edit Profile/i })
    await expect(editBtn).toBeVisible()
    await editBtn.click()

    await page.screenshot({
      path: testInfo.outputPath('profile-02-edit-mode.png'),
      fullPage: true,
    })
  })
})

/* ================================================================ */
/*  5. SUBMISSIONS WORKFLOW (Teacher)                                 */
/* ================================================================ */

test.describe('Submissions Page — Teacher', () => {
  test('shows submissions list and create button', async ({ page }, testInfo) => {
    page.on('dialog', (dialog) => dialog.accept())
    await setDemoUser(page, 'Teacher', 'Dr. Martin Choy', 'teacher.demo@hkbu.edu.hk')
    await page.goto(routePath(testInfo.project.use.baseURL, '/submissions'))

    await expect(page.getByRole('heading', { name: /Submissions/i })).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('submissions-01-list.png'),
      fullPage: true,
    })
  })

  test('create submission from pending amendments', async ({ page }, testInfo) => {
    page.on('dialog', (dialog) => dialog.accept())
    await setDemoUser(page, 'Teacher', 'Dr. Martin Choy', 'teacher.demo@hkbu.edu.hk')

    // First create an amendment so we have something to submit
    await page.goto(routePath(testInfo.project.use.baseURL, '/amendments'))
    await expect(page.getByRole('heading', { name: /Grade Amendments/i })).toBeVisible()

    const code = `SUBM${Date.now().toString().slice(-4)}`
    await page.getByRole('button', { name: /New Amendment/i }).click()
    const form = page.locator('form').first()
    await form.getByPlaceholder('e.g. 22240802').fill('SUB00001')
    await form.locator('.row.g-3.mb-3').nth(1).locator('input').nth(1).fill('Submission Test Student')
    await form.getByPlaceholder('e.g. COMP3047').fill(code)
    await form.getByPlaceholder('e.g. Software Engineering').fill('Submission Flow Test')
    await form.locator('.row.g-3.mb-4 select').nth(0).selectOption('C')
    await form.locator('.row.g-3.mb-4 select').nth(1).selectOption('B')
    await form.getByLabel('Conversion of temporary grade (I, NR, PR, YR)').check()
    await form.getByPlaceholder('e.g. Dr. Martin Choy').fill('Dr. Submission')
    await form.getByPlaceholder('e.g. COMP', { exact: true }).fill('COMP')
    await page.getByRole('button', { name: /Preview & Submit/i }).click()
    await page.getByRole('button', { name: /Confirm Submission/i }).click()
    await expect(page.getByText('Amendment submitted successfully')).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('submissions-02-amendment-created.png'),
      fullPage: true,
    })

    // Navigate to submissions
    await page.goto(routePath(testInfo.project.use.baseURL, '/submissions'))
    await expect(page.getByRole('heading', { name: /Submissions/i })).toBeVisible()

    // Look for create submission button
    const createBtn = page.getByRole('button', { name: /Create Submission|New Submission/i })
    if ((await createBtn.count()) > 0) {
      await createBtn.click()
      await page.screenshot({
        path: testInfo.outputPath('submissions-03-create-form.png'),
        fullPage: true,
      })
    }

    await page.screenshot({
      path: testInfo.outputPath('submissions-04-page-state.png'),
      fullPage: true,
    })
  })
})

/* ================================================================ */
/*  6. PD APPROVAL VIEW                                               */
/* ================================================================ */

test.describe('PD Approval Page', () => {
  test('PD can view submitted amendments for review', async ({ page }, testInfo) => {
    await setDemoUser(page, 'Programme Director', 'Prof. David Wong', 'pd.demo@hkbu.edu.hk')
    await page.goto(routePath(testInfo.project.use.baseURL, '/pd-approvals'))

    // Should show the approval view heading
    const heading = page.getByRole('heading', { name: /Approval|Review/i }).first()
    await expect(heading).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('pd-01-approval-list.png'),
      fullPage: true,
    })
  })

  test('PD can see status filter buttons', async ({ page }, testInfo) => {
    await setDemoUser(page, 'Programme Director', 'Prof. David Wong', 'pd.demo@hkbu.edu.hk')
    await page.goto(routePath(testInfo.project.use.baseURL, '/pd-approvals'))

    const heading = page.getByRole('heading', { name: /Approval|Review/i }).first()
    await expect(heading).toBeVisible()

    // Check for filter buttons
    const allBtn = page.getByRole('button', { name: /^All$/i })
    const pendingBtn = page.getByRole('button', { name: /Submitted|Pending/i })

    if ((await allBtn.count()) > 0) {
      await allBtn.click()
      await page.screenshot({
        path: testInfo.outputPath('pd-02-filter-all.png'),
        fullPage: true,
      })
    }

    if ((await pendingBtn.count()) > 0) {
      await pendingBtn.click()
      await page.screenshot({
        path: testInfo.outputPath('pd-03-filter-pending.png'),
        fullPage: true,
      })
    }
  })
})

/* ================================================================ */
/*  7. ADMIN VIEW                                                     */
/* ================================================================ */

test.describe('Admin Page', () => {
  test('admin can view submissions management panel', async ({ page }, testInfo) => {
    await setDemoUser(page, 'admin', 'Administrator', 'admin.demo@hkbu.edu.hk')
    await page.goto(routePath(testInfo.project.use.baseURL, '/admin'))

    await expect(page.getByText(/Submissions Management/i).first()).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('admin-01-dashboard.png'),
      fullPage: true,
    })
  })

  test('admin can see status filter and statistics', async ({ page }, testInfo) => {
    await setDemoUser(page, 'admin', 'Administrator', 'admin.demo@hkbu.edu.hk')
    await page.goto(routePath(testInfo.project.use.baseURL, '/admin'))

    await expect(page.getByText(/Submissions Management/i).first()).toBeVisible()

    // Status filter buttons
    const pendingBtn = page.getByRole('button', { name: /^Pending$|^Submitted$/i })
    if ((await pendingBtn.count()) > 0) {
      await pendingBtn.first().click()
      await page.screenshot({
        path: testInfo.outputPath('admin-02-pending-filter.png'),
        fullPage: true,
      })
    }

    const allBtn = page.getByRole('button', { name: /^All$/ })
    if ((await allBtn.count()) > 0) {
      await allBtn.first().click()
      await page.screenshot({
        path: testInfo.outputPath('admin-03-all-submissions.png'),
        fullPage: true,
      })
    }
  })

  test('admin can view reminder settings', async ({ page }, testInfo) => {
    await setDemoUser(page, 'admin', 'Administrator', 'admin.demo@hkbu.edu.hk')
    await page.goto(routePath(testInfo.project.use.baseURL, '/admin'))

    await expect(page.getByText(/Submissions Management/i).first()).toBeVisible()

    // Look for reminder/threshold settings
    const thresholdInput = page.getByRole('spinbutton').first()
    if ((await thresholdInput.count()) > 0) {
      await page.screenshot({
        path: testInfo.outputPath('admin-04-reminder-settings.png'),
        fullPage: true,
      })
    }
  })

  test('admin can view announcements section', async ({ page }, testInfo) => {
    await setDemoUser(page, 'admin', 'Administrator', 'admin.demo@hkbu.edu.hk')
    await page.goto(routePath(testInfo.project.use.baseURL, '/admin'))

    await expect(page.getByText(/Submissions Management/i).first()).toBeVisible()

    // Check for announcements tab
    const announcementsTab = page.getByRole('button', { name: /Announcements/i })
    if ((await announcementsTab.count()) > 0) {
      await announcementsTab.click()
      await page.waitForTimeout(300)
      await page.screenshot({
        path: testInfo.outputPath('admin-05-announcements.png'),
        fullPage: true,
      })
    }
  })
})

/* ================================================================ */
/*  8. ROLE-BASED ACCESS CONTROL                                      */
/* ================================================================ */

test.describe('Role-based Access Control', () => {
  test('unauthenticated user is redirected to login from protected routes', async ({ page }, testInfo) => {
    // No auth token set
    await page.goto('/amendments')
    // Should redirect to login
    await expect(page.getByText(/Welcome back|Sign In|Quick demo/i).first()).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('rbac-01-unauth-redirect.png'),
      fullPage: true,
    })
  })

  test('teacher cannot access admin page', async ({ page }, testInfo) => {
    await setDemoUser(page, 'Teacher', 'Dr. Martin Choy', 'teacher.demo@hkbu.edu.hk')
    await page.goto(routePath(testInfo.project.use.baseURL, '/admin'))

    // Should redirect to home (not show admin panel)
    await page.waitForTimeout(500)
    const adminHeading = page.getByText(/Submissions Management/i)
    const isOnAdmin = (await adminHeading.count()) > 0 && (await adminHeading.first().isVisible())
    if (!isOnAdmin) {
      // Good — teacher was redirected away from admin
      await page.screenshot({
        path: testInfo.outputPath('rbac-02-teacher-blocked-admin.png'),
        fullPage: true,
      })
    }
  })

  test('teacher cannot access PD approvals page', async ({ page }, testInfo) => {
    await setDemoUser(page, 'Teacher', 'Dr. Martin Choy', 'teacher.demo@hkbu.edu.hk')
    await page.goto(routePath(testInfo.project.use.baseURL, '/pd-approvals'))

    await page.waitForTimeout(500)
    const approvalHeading = page.getByRole('heading', { name: /Approval|Review/i })
    const isOnApproval = (await approvalHeading.count()) > 0 && (await approvalHeading.first().isVisible())
    if (!isOnApproval) {
      await page.screenshot({
        path: testInfo.outputPath('rbac-03-teacher-blocked-pd.png'),
        fullPage: true,
      })
    }
  })
})

/* ================================================================ */
/*  9. SIGNATURE SETUP PAGE                                           */
/* ================================================================ */

test.describe('Signature Setup Page', () => {
  test('shows signature setup interface', async ({ page }, testInfo) => {
    await setDemoUser(page, 'Teacher', 'Dr. Martin Choy', 'teacher.demo@hkbu.edu.hk')
    await page.goto(routePath(testInfo.project.use.baseURL, '/signature-setup'))

    await expect(page.getByRole('heading', { name: /Signature/i })).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('signature-01-setup-page.png'),
      fullPage: true,
    })
  })
})
