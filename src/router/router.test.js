import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import router from './index'

function clearStorage() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

function setStorageUser(token, user) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

beforeEach(async () => {
  clearStorage()
  // Reset the router to the home route before each test
  await router.push('/')
  await router.isReady()
})

afterEach(() => {
  clearStorage()
})

describe('router – unauthenticated access', () => {
  it('redirects unauthenticated user from /amendments to /login', async () => {
    await router.push('/amendments')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('redirects unauthenticated user from /submissions to /login', async () => {
    await router.push('/submissions')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('redirects unauthenticated user from /admin to /login', async () => {
    await router.push('/admin')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('allows unauthenticated user to access /login', async () => {
    await router.push('/login')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/login')
  })
})

describe('router – admin access control', () => {
  it('redirects non-admin to / when accessing /admin', async () => {
    setStorageUser('tok', { name: 'PD', role: 'Programme Director', signature: 'sig' })
    await router.push('/admin')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('allows admin to access /admin', async () => {
    setStorageUser('tok', { name: 'Admin', role: 'admin' })
    await router.push('/admin')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/admin')
  })
})

describe('router – PDF editor blocked for admin', () => {
  it('redirects admin from /pdf-editor to /', async () => {
    setStorageUser('tok', { name: 'Admin', role: 'admin' })
    await router.push('/pdf-editor')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('allows non-admin to access /pdf-editor when signature is set', async () => {
    setStorageUser('tok', { name: 'PD', role: 'Programme Director', signature: 'data:image/png;base64,abc' })
    await router.push('/pdf-editor')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/pdf-editor')
  })
})

describe('router – signature requirement', () => {
  it('redirects non-demo user without signature to /profile on authenticated routes', async () => {
    setStorageUser('real-token', { name: 'PD', role: 'Programme Director' })
    await router.push('/amendments')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/profile')
  })

  it('skips signature check for demo users', async () => {
    setStorageUser('demo_token_xyz', { name: 'Demo', role: 'Programme Director' })
    await router.push('/amendments')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/amendments')
  })

  it('skips signature redirect when already on /profile', async () => {
    setStorageUser('real-token', { name: 'PD', role: 'Programme Director' })
    await router.push('/profile')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/profile')
  })
})

describe('router – admin signature-setup redirect', () => {
  it('redirects admin from /signature-setup to /profile', async () => {
    setStorageUser('tok', { name: 'Admin', role: 'admin' })
    await router.push('/signature-setup')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/profile')
  })
})

describe('router – Head access', () => {
  it('redirects non-Head user from /pd-approvals to /', async () => {
    setStorageUser('tok', { name: 'PD', role: 'Programme Director', signature: 'sig' })
    await router.push('/pd-approvals')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('allows Head user to access /pd-approvals', async () => {
    setStorageUser('tok', { name: 'Head User', role: 'Head', signature: 'sig' })
    await router.push('/pd-approvals')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/pd-approvals')
  })
})
