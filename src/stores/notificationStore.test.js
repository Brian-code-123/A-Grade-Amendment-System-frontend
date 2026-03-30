import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from './notificationStore'
import { useAuthStore } from './authStore'

function setupDemoUser() {
  const auth = useAuthStore()
  auth.setAuth('demo_token_notif', { name: 'Demo User', role: 'Programme Director' })
}

function setupRealUser() {
  const auth = useAuthStore()
  auth.setAuth('real-token-notif', { name: 'Real User', role: 'Programme Director' })
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('notificationStore – fetchNotifications (demo user)', () => {
  it('loads demo notifications', async () => {
    setupDemoUser()
    const store = useNotificationStore()
    await store.fetchNotifications()
    expect(store.notifications.length).toBeGreaterThan(0)
    expect(store.loading).toBe(false)
  })

  it('sets unreadCount from demo data', async () => {
    setupDemoUser()
    const store = useNotificationStore()
    await store.fetchNotifications()
    const expectedUnread = store.notifications.filter(n => !n.read).length
    expect(store.unreadCount).toBe(expectedUnread)
  })
})

describe('notificationStore – fetchNotifications (not logged in)', () => {
  it('does nothing when user is not logged in', async () => {
    const store = useNotificationStore()
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    await store.fetchNotifications()
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(store.notifications).toHaveLength(0)
  })
})

describe('notificationStore – markAsRead (demo user)', () => {
  it('marks a single notification as read and decrements unreadCount', async () => {
    setupDemoUser()
    const store = useNotificationStore()
    await store.fetchNotifications()
    const unread = store.notifications.find(n => !n.read)
    if (!unread) return

    const countBefore = store.unreadCount
    await store.markAsRead(unread._id)
    expect(store.notifications.find(n => n._id === unread._id)?.read).toBe(true)
    expect(store.unreadCount).toBe(countBefore - 1)
  })
})

describe('notificationStore – markAllRead (demo user)', () => {
  it('marks all notifications as read and resets unreadCount to 0', async () => {
    setupDemoUser()
    const store = useNotificationStore()
    await store.fetchNotifications()
    await store.markAllRead()
    expect(store.notifications.every(n => n.read)).toBe(true)
    expect(store.unreadCount).toBe(0)
  })
})

describe('notificationStore – fetchNotifications (real user, API)', () => {
  it('calls the API and stores notifications', async () => {
    setupRealUser()
    const mockData = [{ _id: 'n1', title: 'Test', message: 'msg', read: false }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    })

    const store = useNotificationStore()
    await store.fetchNotifications()
    expect(store.notifications).toEqual(mockData)
  })

  it('ignores API errors gracefully', async () => {
    setupRealUser()
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))

    const store = useNotificationStore()
    await store.fetchNotifications()
    // Should not throw; notifications remain empty
    expect(store.notifications).toHaveLength(0)
  })
})
