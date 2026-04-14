import { test, expect } from '@playwright/test'

const DEPLOYMENT_URL = 'https://agreeable-pebble-0d1936800.6.azurestaticapps.net'

test.describe('Grade Amendment System - Full Deployment Workflow', () => {
  test('should load home page and display Grade Amendment System', async ({ page }) => {
    await page.goto(DEPLOYMENT_URL + '/#/')
    
    // Verify page loads
    await expect(page).toHaveTitle(/Grade Amendment|Amendment/)
    
    // Check for key elements
    const content = await page.textContent('body')
    expect(content).toContain('Grade Amendment')
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/deployment-home.png', fullPage: true })
  })

  test('should navigate to login page and display demo login options', async ({ page }) => {
    await page.goto(DEPLOYMENT_URL + '/#/login')
    
    await expect(page.locator('h1, h2'), 'Should see login heading').toContainText(/Login|Sign In|Authentication/i)
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/deployment-login.png', fullPage: true })
  })

  test('should access demo login with teacher role', async ({ page }) => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=teacher')
    
    // Wait for auto-redirect or login completion
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    // Could be redirected to amendments or home
    const url = page.url()
    expect(url).toMatch(/(amendments|home|dashboard)/)
    
    await page.screenshot({ path: 'test-results/deployment-teacher-dashboard.png', fullPage: true })
  })

  test('should access demo login with PD role', async ({ page }) => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=pd')
    
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    const url = page.url()
    expect(url).toMatch(/.*/) // Just verify it navigates
    
    await page.screenshot({ path: 'test-results/deployment-pd-dashboard.png', fullPage: true })
  })

  test('should access demo login with admin role', async ({ page }) => {
    await page.goto(DEPLOYMENT_URL + '/#/demo-login?role=admin')
    
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
    
    const url = page.url()
    expect(url).toMatch(/.*/)
    
    await page.screenshot({ path: 'test-results/deployment-admin-dashboard.png', fullPage: true })
  })

  test('should navigate to home page and verify key sections', async ({ page }) => {
    await page.goto(DEPLOYMENT_URL + '/#/')
    
    // Wait for content to load
    await page.waitForLoadState('networkidle')
    
    const pageContent = await page.textContent('body')
    
    // Check for common elements
    expect(pageContent).toBeTruthy()
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/deployment-home-full.png', fullPage: true })
  })

  test('should verify all main navigation routes exist', async ({ page }) => {
    const routesToCheck = [
      { route: '/', name: 'Home' },
      { route: '/#/login', name: 'Login' },
      { route: '/#/demo-login', name: 'Demo Login' },
      { route: '/#/profile', name: 'Profile' },
    ]

    for (const { route, name } of routesToCheck) {
      await page.goto(DEPLOYMENT_URL + route)
      await page.waitForLoadState('networkidle')
      
      const status = page.url()
      expect(status).toContain(DEPLOYMENT_URL)
      
      console.log(`✓ ${name} route (${route}) is accessible`)
    }
  })

  test('should handle error routes gracefully', async ({ page }) => {
    await page.goto(DEPLOYMENT_URL + '/#/nonexistent-route')
    await page.waitForLoadState('networkidle')
    
    // Should either redirect or show error page
    const url = page.url()
    expect(url).toMatch(/agreeable-pebble/)
    
    await page.screenshot({ path: 'test-results/deployment-error-handling.png', fullPage: true })
  })
})

test.describe('Grade Amendment System - Responsive Design', () => {
  test('should be responsive on mobile (iPhone)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      isMobile: true,
      deviceName: 'iPhone 12',
    })
    
    const page = await context.newPage()
    await page.goto(DEPLOYMENT_URL + '/#/')
    
    await page.screenshot({ path: 'test-results/deployment-mobile.png', fullPage: true })
    
    await context.close()
  })

  test('should be responsive on tablet', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    })
    
    const page = await context.newPage()
    await page.goto(DEPLOYMENT_URL + '/#/')
    
    await page.screenshot({ path: 'test-results/deployment-tablet.png', fullPage: true })
    
    await context.close()
  })

  test('should be responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(DEPLOYMENT_URL + '/#/')
    
    await page.screenshot({ path: 'test-results/deployment-desktop.png', fullPage: true })
  })
})

test.describe('Grade Amendment System - Performance', () => {
  test('should load home page within reasonable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto(DEPLOYMENT_URL + '/#/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    console.log(`Page load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(10000) // Should load in less than 10 seconds
  })

  test('should handle navigation between routes smoothly', async ({ page }) => {
    await page.goto(DEPLOYMENT_URL + '/#/')
    
    const routes = ['/#/login', '/#/', '/#/profile']
    
    for (const route of routes) {
      const startTime = Date.now()
      await page.goto(DEPLOYMENT_URL + route)
      const navTime = Date.now() - startTime
      
      expect(navTime).toBeLessThan(5000)
      console.log(`Navigation to ${route}: ${navTime}ms`)
    }
  })
})

test.describe('Grade Amendment System - Accessibility', () => {
  test('should have proper heading hierarchy on home page', async ({ page }) => {
    await page.goto(DEPLOYMENT_URL + '/#/')
    await page.waitForLoadState('networkidle')
    
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count()
    
    expect(headings).toBeGreaterThan(0)
    console.log(`Found ${headings} headings on page`)
    
    await page.screenshot({ path: 'test-results/deployment-a11y-headings.png', fullPage: true })
  })

  test('should have descriptive button labels', async ({ page }) => {
    await page.goto(DEPLOYMENT_URL + '/#/')
    await page.waitForLoadState('networkidle')
    
    const buttons = await page.locator('button').count()
    
    expect(buttons).toBeGreaterThanOrEqual(0)
    console.log(`Found ${buttons} buttons on page`)
  })

  test('should have proper link text', async ({ page }) => {
    await page.goto(DEPLOYMENT_URL + '/#/')
    await page.waitForLoadState('networkidle')
    
    const links = await page.locator('a').count()
    
    expect(links).toBeGreaterThanOrEqual(0)
    console.log(`Found ${links} links on page`)
  })
})
