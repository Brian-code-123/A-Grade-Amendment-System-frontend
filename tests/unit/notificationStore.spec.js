import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'

describe('notificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('loads and updates demo notifications', async () => {
    const auth = useAuthStore()
    auth.setAuth('demo_token_pd', { name: 'Dr. Demo', role: 'Programme Director' })

    const store = useNotificationStore()
    await store.fetchNotifications()
    expect(store.notifications.length).toBeGreaterThan(0)
    expect(store.unreadCount).toBeGreaterThan(0)

    const firstUnread = store.notifications.find((n) => !n.read)
    await store.markAsRead(firstUnread._id)
    expect(store.notifications.find((n) => n._id === firstUnread._id)?.read).toBe(true)

    await store.markAllRead()
    expect(store.unreadCount).toBe(0)
    expect(store.notifications.every((n) => n.read)).toBe(true)
  })
})
