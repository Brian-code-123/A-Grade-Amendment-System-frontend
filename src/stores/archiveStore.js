import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'
import { apiFetch } from '@/utils/api'

async function readError(res, fallback) {
  try {
    const data = await res.json()
    return data?.message || fallback
  } catch {
    return fallback
  }
}

export const useArchiveStore = defineStore('archive', () => {
  // Semester definitions: { id, name, startDate, endDate }
  const semesters = ref([])

  // Archived submission IDs grouped by semester: { semesterId: [submissionId, ...] }
  const archivedMap = ref({})

  // All archived submission IDs (flat set)
  const archivedIds = computed(() => {
    const ids = new Set()
    for (const arr of Object.values(archivedMap.value)) {
      arr.forEach(id => ids.add(id))
    }
    return ids
  })

  // Real sessions keep the archive on the server. Demo sessions have no API, so they keep it
  // in this browser (the only place the old, browser-only version was ever stored).
  const isDemo = () => Boolean(useAuthStore().token?.startsWith('demo_token_'))

  function persistDemo() {
    localStorage.setItem('archive_semesters', JSON.stringify(semesters.value))
    localStorage.setItem('archive_map', JSON.stringify(archivedMap.value))
  }

  async function request(path, method, body) {
    const auth = useAuthStore()
    const res = await apiFetch('/api/archive' + path, {
      method,
      headers: auth.authHeaders(),
      body: body === undefined ? undefined : JSON.stringify(body)
    })
    if (!res.ok) throw new Error(await readError(res, 'Archive request failed'))
    return res.json()
  }

  async function load() {
    if (isDemo()) {
      try {
        semesters.value = JSON.parse(localStorage.getItem('archive_semesters') || '[]')
        archivedMap.value = JSON.parse(localStorage.getItem('archive_map') || '{}')
      } catch {
        semesters.value = []
        archivedMap.value = {}
      }
      return
    }
    const state = await request('', 'GET')
    semesters.value = state.semesters || []
    archivedMap.value = state.archivedMap || {}
  }

  async function addSemester(name, startDate, endDate) {
    if (isDemo()) {
      const id = 'sem_' + Date.now()
      semesters.value.push({ id, name, startDate, endDate })
      persistDemo()
      return id
    }
    const sem = await request('/semesters', 'POST', { name, startDate, endDate })
    semesters.value.push(sem)
    return sem.id
  }

  async function removeSemester(id) {
    if (!isDemo()) await request('/semesters/' + encodeURIComponent(id), 'DELETE')
    semesters.value = semesters.value.filter(s => s.id !== id)
    delete archivedMap.value[id]
    if (isDemo()) persistDemo()
  }

  async function updateSemester(id, name, startDate, endDate) {
    if (!isDemo()) await request('/semesters/' + encodeURIComponent(id), 'PUT', { name, startDate, endDate })
    const sem = semesters.value.find(s => s.id === id)
    if (sem) {
      sem.name = name
      sem.startDate = startDate
      sem.endDate = endDate
      if (isDemo()) persistDemo()
    }
  }

  /**
   * Archive the submissions created inside the semester's date range. The server decides which
   * ones match; demo sessions pass their local submissions as the second argument instead.
   * @returns {Promise<number>} how many submissions were newly archived
   */
  async function archiveBySemester(semesterId, demoSubmissions = []) {
    if (!isDemo()) {
      const result = await request('/semesters/' + encodeURIComponent(semesterId) + '/archive', 'POST')
      await load()
      return result.archived
    }

    const sem = semesters.value.find(s => s.id === semesterId)
    if (!sem) return 0
    const start = new Date(sem.startDate)
    const end = new Date(sem.endDate)
    end.setHours(23, 59, 59, 999)
    const matching = demoSubmissions.filter(s => {
      const d = new Date(s.created_at)
      return d >= start && d <= end && !archivedIds.value.has(s._id)
    })
    if (matching.length === 0) return 0
    if (!archivedMap.value[semesterId]) archivedMap.value[semesterId] = []
    matching.forEach(s => archivedMap.value[semesterId].push(s._id))
    persistDemo()
    return matching.length
  }

  async function unarchive(submissionIds) {
    if (!isDemo()) await request('/unarchive', 'POST', { submissionIds })
    for (const semId of Object.keys(archivedMap.value)) {
      archivedMap.value[semId] = archivedMap.value[semId].filter(id => !submissionIds.includes(id))
      if (archivedMap.value[semId].length === 0) delete archivedMap.value[semId]
    }
    if (isDemo()) persistDemo()
  }

  function isArchived(submissionId) {
    return archivedIds.value.has(submissionId)
  }

  function getArchivedSubmissions(submissions, semesterId) {
    if (semesterId) {
      const ids = archivedMap.value[semesterId] || []
      return submissions.filter(s => ids.includes(s._id))
    }
    return submissions.filter(s => archivedIds.value.has(s._id))
  }

  return {
    semesters,
    archivedMap,
    archivedIds,
    load,
    addSemester,
    removeSemester,
    updateSemester,
    archiveBySemester,
    unarchive,
    isArchived,
    getArchivedSubmissions,
  }
})
