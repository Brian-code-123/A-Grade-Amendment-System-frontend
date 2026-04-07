import { beforeEach, describe, expect, it } from 'vitest'
import router from '@/router'

describe('router guards', () => {
  beforeEach(async () => {
    localStorage.clear()
    await router.replace('/')
  })

  it('redirects unauthenticated users to login for protected routes', async () => {
    await router.push('/amendments')
    expect(router.currentRoute.value.fullPath).toBe('/login')
  })

  it('blocks admin users from PDF editor', async () => {
    localStorage.setItem('token', 'demo_token_admin')
    localStorage.setItem('user', JSON.stringify({ role: 'admin', name: 'Admin' }))

    await router.push('/pdf-editor')
    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('requires signature setup for non-demo non-admin users', async () => {
    localStorage.setItem('token', 'real_token_1')
    localStorage.setItem('user', JSON.stringify({ role: 'Teacher', name: 'Teacher No Sign' }))

    await router.push('/submissions')
    expect(router.currentRoute.value.fullPath).toBe('/profile')
  })

  it('allows demo users without signature to access protected pages', async () => {
    localStorage.setItem('token', 'demo_token_pd_1')
    localStorage.setItem('user', JSON.stringify({ role: 'Programme Director', name: 'Demo PD' }))

    await router.push('/amendments')
    expect(router.currentRoute.value.fullPath).toBe('/amendments')
  })
})
