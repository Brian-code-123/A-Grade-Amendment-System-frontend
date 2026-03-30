/**
 * Screenshot Capture Script
 *
 * Captures comprehensive screenshots of all modules and user-facing functions
 * in the A-Grade Amendment System frontend.
 *
 * Usage:
 *   1. Start the dev server:  npm run dev
 *   2. Run this script:       node scripts/capture-screenshots.js
 *
 * Output: screenshots/ directory (relative to project root)
 */

import { chromium } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SCREENSHOTS_DIR = path.join(ROOT, 'screenshots')
const BASE_URL = 'http://localhost:5173'

// ─── Demo user fixtures ────────────────────────────────────────────────────
// A simple 1x1 transparent PNG used as a placeholder signature so the router
// does not redirect non-admin users to /profile for signature setup.
const DUMMY_SIGNATURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

const DEMO_USERS = {
  admin: {
    token: 'demo_token_admin_screenshots',
    user: { email: 'admin@hkbu.edu.hk', name: 'Administrator', role: 'admin' }
  },
  teacher: {
    token: 'demo_token_teacher_screenshots',
    user: {
      email: 'teacher@hkbu.edu.hk',
      name: 'Dr. Jane Smith',
      role: 'teacher',
      signature: DUMMY_SIGNATURE
    }
  },
  head: {
    token: 'demo_token_head_screenshots',
    user: {
      email: 'head.dept@hkbu.edu.hk',
      name: 'Prof. David Wong',
      role: 'Head',
      signature: DUMMY_SIGNATURE
    }
  },
  pd: {
    token: 'demo_token_pd_screenshots',
    user: {
      email: 'martin.choy@hkbu.edu.hk',
      name: 'Dr. Martin Choy',
      role: 'Programme Director',
      signature: DUMMY_SIGNATURE
    }
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

async function injectAuth(page, roleKey) {
  const { token, user } = DEMO_USERS[roleKey]
  await page.addInitScript(
    ({ token, user }) => {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    { token, user }
  )
}

async function clearAuth(page) {
  await page.addInitScript(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  })
}

async function goto(page, url, { waitFor = 'networkidle', timeout = 15000 } = {}) {
  await page.goto(url, { waitUntil: waitFor, timeout })
  // Extra settle time for animations / Vue re-renders
  await page.waitForTimeout(1200)
}

async function shot(page, filename, element = null) {
  const dest = path.join(SCREENSHOTS_DIR, filename)
  const options = { path: dest, fullPage: !element }
  if (element) {
    await element.screenshot(options)
  } else {
    await page.screenshot(options)
  }
  console.log(`  ✓  ${filename}`)
}

async function setViewport(page, width = 1440, height = 900) {
  await page.setViewportSize({ width, height })
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })

  try {
    // ══════════════════════════════════════════════════════════════════════
    // 1.  PUBLIC / AUTH PAGES  (no auth required)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n── Public / Auth pages ──')
    {
      const ctx = await browser.newContext()
      const page = ctx.newPage ? await ctx.newPage() : await browser.newPage()
      await setViewport(page)

      // 01 – Login page (default Login tab)
      await clearAuth(page)
      await goto(page, `${BASE_URL}/login`)
      await shot(page, '01-login-page.png')

      // 02 – Login page – Register tab
      const registerTab = page.locator('text=Register', { exact: false }).first()
      if (await registerTab.isVisible().catch(() => false)) {
        await registerTab.click()
        await page.waitForTimeout(600)
        await shot(page, '02-login-register-tab.png')
      }

      // 03 – Login error state (submit empty form)
      const loginTab = page.locator('text=Login', { exact: false }).first()
      if (await loginTab.isVisible().catch(() => false)) await loginTab.click()
      await page.waitForTimeout(400)
      // Fill email/password then attempt to log in (no code → triggers error)
      const emailInput = page.locator('input[type="email"]').first()
      const passwordInput = page.locator('input[type="password"]').first()
      if (await emailInput.isVisible().catch(() => false)) {
        await emailInput.fill('test@hkbu.edu.hk')
        await passwordInput.fill('wrongpassword')
        const loginBtn = page.locator('button[type="submit"]').first()
        if (await loginBtn.isVisible().catch(() => false)) {
          await loginBtn.click()
          await page.waitForTimeout(800)
          await shot(page, '03-login-error-state.png')
        }
      }

      // 04 – Demo Login page (auto-redirects – capture before redirect)
      await goto(page, `${BASE_URL}/demo-login`, { waitFor: 'domcontentloaded' })
      await page.waitForTimeout(300)
      await shot(page, '04-demo-login-page.png')

      // 05 – Demo Verify page
      await goto(page, `${BASE_URL}/demo-verify`)
      await shot(page, '05-demo-verify-page.png')

      // 06 – Demo Verify – error state (wrong captcha answer)
      const captchaInput = page.locator('input[type="number"]').first()
      if (await captchaInput.isVisible().catch(() => false)) {
        await captchaInput.fill('99')
        const verifyBtn = page.locator('button[type="submit"]').first()
        if (await verifyBtn.isVisible().catch(() => false)) {
          await verifyBtn.click()
          await page.waitForTimeout(600)
          await shot(page, '06-demo-verify-error-state.png')
        }
      }

      await ctx.close()
    }

    // ══════════════════════════════════════════════════════════════════════
    // 2.  ADMIN ROLE PAGES
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n── Admin role pages ──')
    {
      const ctx = await browser.newContext()
      const page = await ctx.newPage()
      await setViewport(page)
      await injectAuth(page, 'admin')

      // 07 – Home dashboard (admin)
      await goto(page, `${BASE_URL}/`)
      await shot(page, '07-home-dashboard-admin.png')

      // 08 – Navbar / navigation (admin – zoom in on nav)
      const navbar = page.locator('nav, .navbar, header').first()
      if (await navbar.isVisible().catch(() => false)) {
        await shot(page, '08-navbar-admin.png', navbar)
      }

      // 09 – Amendment list (admin)
      await goto(page, `${BASE_URL}/amendments`)
      await shot(page, '09-amendments-list-admin.png')

      // 10 – Amendment search / filter state
      const searchInput = page
        .locator('input[placeholder*="search" i], input[placeholder*="filter" i]')
        .first()
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('CS')
        await page.waitForTimeout(800)
        await shot(page, '10-amendments-search-filter.png')
        await searchInput.clear()
      }

      // 11 – Excel upload page
      await goto(page, `${BASE_URL}/excel-upload`)
      await shot(page, '11-excel-upload-page.png')

      // 12 – Submissions page (admin)
      await goto(page, `${BASE_URL}/submissions`)
      await shot(page, '12-submissions-admin.png')

      // 13 – Admin dashboard (Users tab default)
      await goto(page, `${BASE_URL}/admin`)
      await shot(page, '13-admin-dashboard.png')

      // 14 – Admin dashboard – try other tabs
      const allTabs = await page.locator('[role="tab"], .nav-link, .tab-btn').all()
      for (let i = 1; i < Math.min(allTabs.length, 5); i++) {
        try {
          const tabText = (await allTabs[i].textContent()).trim().replace(/\s+/g, '-').toLowerCase()
          if (!tabText) continue
          await allTabs[i].click()
          await page.waitForTimeout(700)
          await shot(page, `14-admin-tab-${tabText.substring(0, 20)}.png`)
        } catch {
          // ignore individual tab failures
        }
      }

      // 15 – Admin archive page
      await goto(page, `${BASE_URL}/admin/archive`)
      await shot(page, '15-admin-archive.png')

      // 16 – Profile page (admin)
      await goto(page, `${BASE_URL}/profile`)
      await shot(page, '16-profile-admin.png')

      // 17 – Theme toggle – dark mode (admin home)
      const themeToggle = page
        .locator(
          'button[aria-label*="theme" i], button[title*="theme" i], .theme-toggle, [data-testid="theme-toggle"]'
        )
        .first()
      if (await themeToggle.isVisible().catch(() => false)) {
        await themeToggle.click()
        await page.waitForTimeout(600)
        await goto(page, `${BASE_URL}/`)
        await shot(page, '17-home-dark-mode-admin.png')
        // Toggle back to light
        if (await themeToggle.isVisible().catch(() => false)) {
          await themeToggle.click()
          await page.waitForTimeout(400)
        }
      }

      // 18 – Notifications dropdown
      const notifBtn = page
        .locator(
          'button[aria-label*="notif" i], .notification-btn, [data-testid="notifications"]'
        )
        .first()
      if (await notifBtn.isVisible().catch(() => false)) {
        await notifBtn.click()
        await page.waitForTimeout(600)
        await shot(page, '18-notifications-dropdown-admin.png')
        await page.keyboard.press('Escape')
      }

      await ctx.close()
    }

    // ══════════════════════════════════════════════════════════════════════
    // 3.  TEACHER ROLE PAGES  (non-admin, has signature)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n── Teacher role pages ──')
    {
      const ctx = await browser.newContext()
      const page = await ctx.newPage()
      await setViewport(page)
      await injectAuth(page, 'teacher')

      // 19 – Home dashboard (teacher)
      await goto(page, `${BASE_URL}/`)
      await shot(page, '19-home-dashboard-teacher.png')

      // 20 – Navbar (teacher)
      const navbar = page.locator('nav, .navbar, header').first()
      if (await navbar.isVisible().catch(() => false)) {
        await shot(page, '20-navbar-teacher.png', navbar)
      }

      // 21 – Amendment list (teacher)
      await goto(page, `${BASE_URL}/amendments`)
      await shot(page, '21-amendments-list-teacher.png')

      // 22 – Create / new amendment button – look for form/modal
      const createBtn = page
        .locator(
          'button:has-text("New"), button:has-text("Create"), button:has-text("Add"), a:has-text("New Amendment")'
        )
        .first()
      if (await createBtn.isVisible().catch(() => false)) {
        await createBtn.click()
        await page.waitForTimeout(900)
        await shot(page, '22-amendment-create-form.png')
        // Close modal/drawer
        await page.keyboard.press('Escape')
        await page.waitForTimeout(400)
      }

      // 23 – Submissions page (teacher)
      await goto(page, `${BASE_URL}/submissions`)
      await shot(page, '23-submissions-teacher.png')

      // 24 – PDF Editor page (teacher only – admin is blocked)
      await goto(page, `${BASE_URL}/pdf-editor`)
      await shot(page, '24-pdf-editor-teacher.png')

      // 25 – Signature Setup page (teacher)
      await goto(page, `${BASE_URL}/signature-setup`)
      await shot(page, '25-signature-setup-teacher.png')

      // 26 – Profile page (teacher)
      await goto(page, `${BASE_URL}/profile`)
      await shot(page, '26-profile-teacher.png')

      // 27 – Profile edit form interaction
      const editBtn = page
        .locator('button:has-text("Edit"), button:has-text("Update Profile")')
        .first()
      if (await editBtn.isVisible().catch(() => false)) {
        await editBtn.click()
        await page.waitForTimeout(600)
        await shot(page, '27-profile-edit-form-teacher.png')
        await page.keyboard.press('Escape')
      }

      await ctx.close()
    }

    // ══════════════════════════════════════════════════════════════════════
    // 4.  HEAD ROLE PAGES
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n── Head role pages ──')
    {
      const ctx = await browser.newContext()
      const page = await ctx.newPage()
      await setViewport(page)
      await injectAuth(page, 'head')

      // 28 – Home dashboard (head)
      await goto(page, `${BASE_URL}/`)
      await shot(page, '28-home-dashboard-head.png')

      // 29 – Navbar (head)
      const navbar = page.locator('nav, .navbar, header').first()
      if (await navbar.isVisible().catch(() => false)) {
        await shot(page, '29-navbar-head.png', navbar)
      }

      // 30 – PD Approvals page (head only)
      await goto(page, `${BASE_URL}/pd-approvals`)
      await shot(page, '30-pd-approvals-head.png')

      // 31 – PD Approvals – attempt to expand / open a row
      const firstRow = page
        .locator('table tbody tr, .approval-card, .list-group-item')
        .first()
      if (await firstRow.isVisible().catch(() => false)) {
        await firstRow.click()
        await page.waitForTimeout(700)
        await shot(page, '31-pd-approvals-detail-head.png')
        await page.keyboard.press('Escape')
      }

      await ctx.close()
    }

    // ══════════════════════════════════════════════════════════════════════
    // 5.  PROGRAMME DIRECTOR ROLE PAGES
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n── Programme Director role pages ──')
    {
      const ctx = await browser.newContext()
      const page = await ctx.newPage()
      await setViewport(page)
      await injectAuth(page, 'pd')

      // 32 – Home dashboard (PD)
      await goto(page, `${BASE_URL}/`)
      await shot(page, '32-home-dashboard-pd.png')

      // 33 – Amendment list (PD)
      await goto(page, `${BASE_URL}/amendments`)
      await shot(page, '33-amendments-list-pd.png')

      // 34 – PDF Editor (PD)
      await goto(page, `${BASE_URL}/pdf-editor`)
      await shot(page, '34-pdf-editor-pd.png')

      // 35 – Submissions (PD)
      await goto(page, `${BASE_URL}/submissions`)
      await shot(page, '35-submissions-pd.png')

      await ctx.close()
    }

    // ══════════════════════════════════════════════════════════════════════
    // 6.  ACCESS CONTROL / REDIRECT STATES
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n── Access control / redirects ──')
    {
      const ctx = await browser.newContext()
      const page = await ctx.newPage()
      await setViewport(page)

      // 36 – Unauthenticated access to protected route → redirected to login
      await clearAuth(page)
      await goto(page, `${BASE_URL}/amendments`, { waitFor: 'domcontentloaded' })
      await page.waitForTimeout(1000)
      await shot(page, '36-unauthenticated-redirect-to-login.png')

      // 37 – Non-admin access to admin route → redirected to home
      await injectAuth(page, 'teacher')
      await page.reload()
      await goto(page, `${BASE_URL}/admin`, { waitFor: 'domcontentloaded' })
      await page.waitForTimeout(1000)
      await shot(page, '37-non-admin-redirect-from-admin.png')

      await ctx.close()
    }

    // ══════════════════════════════════════════════════════════════════════
    // 7.  MOBILE VIEWPORT  (admin role – key pages)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n── Mobile viewport ──')
    {
      const ctx = await browser.newContext()
      const page = await ctx.newPage()
      await page.setViewportSize({ width: 390, height: 844 }) // iPhone 14
      await injectAuth(page, 'admin')

      // 38 – Login page (mobile)
      await clearAuth(page)
      await page.reload()
      await goto(page, `${BASE_URL}/login`)
      await shot(page, '38-mobile-login-page.png')

      // 39 – Home dashboard (mobile, admin)
      await injectAuth(page, 'admin')
      await page.reload()
      await goto(page, `${BASE_URL}/`)
      await shot(page, '39-mobile-home-dashboard-admin.png')

      // 40 – Mobile hamburger / collapsed menu
      const menuBtn = page
        .locator(
          '.navbar-toggler, button[aria-label*="menu" i], button[aria-label*="nav" i]'
        )
        .first()
      if (await menuBtn.isVisible().catch(() => false)) {
        await menuBtn.click()
        await page.waitForTimeout(500)
        await shot(page, '40-mobile-navbar-open.png')
        await menuBtn.click()
      }

      await ctx.close()
    }
  } finally {
    await browser.close()
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  const files = fs.readdirSync(SCREENSHOTS_DIR).filter((f) => f.endsWith('.png'))
  console.log(`\n✅  Done – ${files.length} screenshot(s) saved to screenshots/\n`)
  files.forEach((f) => console.log(`   ${f}`))
}

main().catch((err) => {
  console.error('Screenshot capture failed:', err)
  process.exit(1)
})
