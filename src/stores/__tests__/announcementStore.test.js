import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAnnouncementStore } from '../announcementStore'
import { useAuthStore } from '../authStore'

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) }
}

describe('announcementStore with a real session', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('loads announcements for a visitor who is not signed in', async () => {
    globalThis.fetch = vi.fn(async () => jsonResponse([
      { _id: 'a1', category: 'Latest Policy Updates', type: 'warning', title: 'T', message: 'M', date: '2026-10-01' }
    ]))
    const store = useAnnouncementStore()
    await store.load()
    expect(store.items).toHaveLength(1)
    expect(globalThis.fetch.mock.calls[0][0]).toContain('/api/announcements')
    expect(store.byCategory('Latest Policy Updates')).toHaveLength(1)
    expect(store.byCategory('System Maintenance Notification')).toHaveLength(0)
  })

  it('creates and deletes through the API with the admin token', async () => {
    useAuthStore().setAuth('real-token', { name: 'Admin', email: 'a@example.com', role: 'admin' })
    const created = { _id: 'a2', category: 'System Announcements/Messages', type: 'info', title: 'Hi', message: 'There', date: '2026-10-02' }
    globalThis.fetch = vi.fn(async (url, options = {}) => {
      if (options.method === 'POST') return jsonResponse(created, 201)
      if (options.method === 'DELETE') return jsonResponse({ ok: true })
      return jsonResponse([])
    })
    const store = useAnnouncementStore()
    await store.create({ category: created.category, type: 'info', title: 'Hi', message: 'There' })
    expect(store.items[0]._id).toBe('a2')
    expect(globalThis.fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer real-token')
    await store.remove('a2')
    expect(store.items).toHaveLength(0)
  })

  it('keeps the list unchanged and throws the server message when creating fails', async () => {
    useAuthStore().setAuth('real-token', { name: 'T', email: 't@example.com', role: 'Teacher' })
    globalThis.fetch = vi.fn(async () => jsonResponse({ message: 'Forbidden: insufficient role' }, 403))
    const store = useAnnouncementStore()
    await expect(store.create({ category: 'x', type: 'info', title: 't', message: 'm' })).rejects.toThrow('Forbidden: insufficient role')
    expect(store.items).toHaveLength(0)
  })

  it('does not fail the page when loading fails', async () => {
    globalThis.fetch = vi.fn(async () => { throw new Error('offline') })
    const store = useAnnouncementStore()
    await store.load()
    expect(store.items).toEqual([])
  })
})

describe('announcementStore in demo mode', () => {
  it('uses sample announcements without calling the API', async () => {
    localStorage.clear()
    setActivePinia(createPinia())
    useAuthStore().setAuth('demo_token_admin', { name: 'Demo', email: 'd@example.com', role: 'admin' })
    globalThis.fetch = vi.fn(async () => { throw new Error('demo mode must not call the API') })
    const store = useAnnouncementStore()
    await store.load()
    expect(store.items.length).toBeGreaterThan(0)
    await store.create({ category: 'Latest Policy Updates', type: 'info', title: 'Demo', message: 'Local only' })
    expect(store.items[0].title).toBe('Demo')
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})
