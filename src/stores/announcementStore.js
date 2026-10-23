import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './authStore'
import { apiFetch } from '@/utils/api'

// Shown to demo sessions only, which never talk to the real API.
const DEMO_ANNOUNCEMENTS = [
  { _id: 'demo-1', category: 'System Announcements/Messages', type: 'info', title: 'System Update', message: 'Grade Amendment System has been updated with new features and improvements.', date: '2026-03-10' },
  { _id: 'demo-2', category: 'Latest Policy Updates', type: 'warning', title: 'Grade Amendment Policy Update', message: 'New deadline for grade amendments: 30 days from course end date.', date: '2026-03-07' },
  { _id: 'demo-3', category: 'System Maintenance Notification', type: 'danger', title: 'Scheduled Maintenance', message: 'System maintenance every Sunday 23:00-24:00 (HKT). Please plan accordingly.', date: '2026-03-10' }
]

async function readError(res, fallback) {
  try {
    const data = await res.json()
    return data?.message || fallback
  } catch {
    return fallback
  }
}

export const useAnnouncementStore = defineStore('announcement', () => {
  const items = ref([])

  const isDemo = () => Boolean(useAuthStore().token?.startsWith('demo_token_'))

  // Announcements are public, so this works before sign-in. A failed load leaves the page usable.
  async function load() {
    if (isDemo()) {
      if (items.value.length === 0) items.value = DEMO_ANNOUNCEMENTS.map((a) => ({ ...a }))
      return
    }
    try {
      const res = await apiFetch('/api/announcements')
      if (!res.ok) return
      const data = await res.json()
      items.value = Array.isArray(data) ? data : []
    } catch {
      // Keep whatever is already shown.
    }
  }

  async function create(form) {
    const payload = { category: form.category, type: form.type, title: form.title, message: form.message }
    if (isDemo()) {
      const local = { _id: 'demo-' + Date.now(), ...payload, date: new Date().toISOString().slice(0, 10) }
      items.value.unshift(local)
      return local
    }
    const auth = useAuthStore()
    const res = await apiFetch('/api/announcements', {
      method: 'POST',
      headers: auth.authHeaders(),
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(await readError(res, 'Failed to create announcement'))
    const created = await res.json()
    items.value.unshift(created)
    return created
  }

  async function remove(id) {
    if (!isDemo()) {
      const auth = useAuthStore()
      const res = await apiFetch('/api/announcements/' + encodeURIComponent(id), {
        method: 'DELETE',
        headers: auth.authHeaders()
      })
      if (!res.ok) throw new Error(await readError(res, 'Failed to delete announcement'))
    }
    items.value = items.value.filter((a) => a._id !== id)
  }

  const byCategory = (category) => items.value.filter((a) => a.category === category)

  return { items, load, create, remove, byCategory }
})
