import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './authStore'
import { apiFetch } from '@/utils/api'

const DEMO_NOTIFICATIONS = [
  { _id: 'dn1', title: 'Grade Amendment Required', message: 'COMP3047 Software Engineering — Student John Smith has an incomplete (I) grade that needs to be resolved.', read: false, created_at: new Date(Date.now() - 1*60*60*1000).toISOString() },
  { _id: 'dn2', title: 'Appeal Received', message: 'Student Sarah Johnson has filed a grade appeal for COMP3048 Database Systems citing technical errors.', read: false, created_at: new Date(Date.now() - 3*60*60*1000).toISOString() },
  { _id: 'dn3', title: 'Submission Approved', message: 'Your submission "Sem 1 Grade Corrections — COMP" has been approved by the admin.', read: false, created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString() },
  { _id: 'dn4', title: 'Supplementary Exam Result', message: 'Thomas Brown completed the supplementary exam for COMP4010 Machine Learning. Score: 65.', read: true, created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
  { _id: 'dn5', title: 'Submission Rejected', message: 'Submission "Makeup Exam Batch" was rejected. Reason: Missing instructor signature for row 3.', read: true, created_at: new Date(Date.now() - 4*24*60*60*1000).toISOString() },
  { _id: 'dn6', title: 'New Temporary Grades', message: '3 students in COMP3050 Web Development assigned temporary NR grades pending deferred assessments.', read: true, created_at: new Date(Date.now() - 5*24*60*60*1000).toISOString() }
]

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)

  const isDemoUser = () => {
    const auth = useAuthStore()
    return auth.token?.startsWith('demo_token_')
  }

  async function fetchNotifications() {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) return
    loading.value = true

    if (isDemoUser()) {
      notifications.value = DEMO_NOTIFICATIONS
      unreadCount.value = DEMO_NOTIFICATIONS.filter(n => !n.read).length
      loading.value = false
      return
    }

    try {
      const res = await apiFetch('/api/notifications', { headers: auth.authHeaders() })
      if (res.ok) notifications.value = await res.json()
    } catch (e) { /* ignore */ } finally {
      loading.value = false
    }
  }

  async function fetchUnreadCount() {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) return

    if (isDemoUser()) {
      unreadCount.value = notifications.value.filter(n => !n.read).length
      return
    }

    try {
      const res = await apiFetch('/api/notifications/unread-count', { headers: auth.authHeaders() })
      if (res.ok) {
        const data = await res.json()
        unreadCount.value = data.count
      }
    } catch (e) { /* ignore */ }
  }

  async function markAsRead(id) {
    if (isDemoUser()) {
      const n = notifications.value.find(n => n._id === id)
      if (n) n.read = true
      unreadCount.value = notifications.value.filter(n => !n.read).length
      return
    }

    const auth = useAuthStore()
    await apiFetch('/api/notifications/' + id + '/read', { method: 'POST', headers: auth.authHeaders() })
    const n = notifications.value.find(n => n._id === id)
    if (n) n.read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }

  async function markAllRead() {
    if (isDemoUser()) {
      notifications.value.forEach(n => n.read = true)
      unreadCount.value = 0
      return
    }

    const auth = useAuthStore()
    await apiFetch('/api/notifications/read-all', { method: 'POST', headers: auth.authHeaders() })
    notifications.value.forEach(n => n.read = true)
    unreadCount.value = 0
  }

  return { notifications, unreadCount, loading, fetchNotifications, fetchUnreadCount, markAsRead, markAllRead }
})
