import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './authStore'
import { apiFetch } from '@/utils/api'

const DEMO_SUBMISSIONS = [
  {
    _id: 'ds1',
    title: 'Sem 1 Grade Corrections — COMP',
    description: 'Batch grade amendments for COMP department Semester 1 2025-2026',
    status: 'Approved',
    amendment_ids: ['demo_1', 'demo_2', 'demo_9'],
    amendment_count: 3,
    submitted_by: 'Dr. Martin Choy',
    submitted_by_name: 'Dr. Martin Choy',
    created_at: new Date(Date.now() - 6*24*60*60*1000).toISOString(),
    submitted_at: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
    approved_at: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
    approved_by_name: 'Prof. Programme Director',
    printed: true,
    printed_at: new Date(Date.now() - 2*24*60*60*1000).toISOString()
  },
  {
    _id: 'ds2',
    title: 'Makeup Exam Batch — Spring 2026',
    description: 'Students who completed makeup examinations in Spring 2026',
    status: 'Submitted',
    amendment_ids: ['demo_3', 'demo_8'],
    amendment_count: 2,
    submitted_by: 'Dr. David Lee',
    submitted_by_name: 'Dr. David Lee',
    created_at: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
    submitted_at: new Date(Date.now() - 2*24*60*60*1000).toISOString()
  },
  {
    _id: 'ds3',
    title: 'Deferred Assessment — COMP3050',
    description: 'Temporary grade conversions for deferred assessments',
    status: 'Draft',
    amendment_ids: ['demo_4'],
    amendment_count: 1,
    submitted_by: 'Dr. James Park',
    submitted_by_name: 'Dr. James Park',
    created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString()
  },
  {
    _id: 'ds4',
    title: 'Appeal Results — Sem 1',
    description: 'Grade appeals processed for Semester 1',
    status: 'Rejected',
    amendment_ids: ['demo_7'],
    amendment_count: 1,
    submitted_by: 'Dr. Susan Black',
    submitted_by_name: 'Dr. Susan Black',
    rejection_reason: 'Missing instructor signature for row 1. Please resubmit with complete documentation.',
    created_at: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
    submitted_at: new Date(Date.now() - 6*24*60*60*1000).toISOString(),
    rejected_at: new Date(Date.now() - 4*24*60*60*1000).toISOString()
  },
  {
    _id: 'ds5',
    title: 'Supplementary Exam — COMP4010',
    description: 'Supplementary examination results for Machine Learning course',
    status: 'Draft',
    amendment_ids: ['demo_5'],
    amendment_count: 1,
    submitted_by: 'Dr. Rachel Kim',
    submitted_by_name: 'Dr. Rachel Kim',
    created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString()
  },
  {
    _id: 'ds6',
    title: 'OS & Distributed Sys — Batch',
    description: 'Corrections for Operating Systems and Distributed Systems courses',
    status: 'Draft',
    amendment_ids: ['demo_10', 'demo_11'],
    amendment_count: 2,
    submitted_by: 'Dr. Henry Adams',
    submitted_by_name: 'Dr. Henry Adams',
    created_at: new Date(Date.now() - 9*24*60*60*1000).toISOString()
  },
  {
    _id: 'ds7',
    title: 'Deferred & Review — Mixed',
    description: 'Deferred assessments and instructor reviews for multiple courses',
    status: 'Submitted',
    amendment_ids: ['demo_12', 'demo_14'],
    amendment_count: 2,
    submitted_by: 'Dr. David Lee',
    submitted_by_name: 'Dr. David Lee',
    created_at: new Date(Date.now() - 4*24*60*60*1000).toISOString(),
    submitted_at: new Date(Date.now() - 3*24*60*60*1000).toISOString()
  },
  {
    _id: 'ds8',
    title: 'Computer Vision Supplementary',
    description: 'Supplementary exam result for COMP4045',
    status: 'Draft',
    amendment_ids: ['demo_13'],
    amendment_count: 1,
    submitted_by: 'Dr. Rachel Kim',
    submitted_by_name: 'Dr. Rachel Kim',
    created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString()
  }
]

const PD_DEMO_SUBMISSIONS = [
  {
    _id: 'pds1',
    title: 'SE Grade Conversions — Sem 1',
    description: 'Temporary grade conversions for COMP3047 Software Engineering',
    status: 'Draft',
    amendment_ids: ['pd_1', 'pd_2'],
    amendment_count: 2,
    submitted_by: 'Dr. Martin Choy',
    submitted_by_name: 'Dr. Martin Choy',
    created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString()
  },
  {
    _id: 'pds2',
    title: 'Cloud Computing Review — Sem 2',
    description: 'Grade review for COMP4055 Cloud Computing',
    status: 'Draft',
    amendment_ids: ['pd_3'],
    amendment_count: 1,
    submitted_by: 'Dr. Martin Choy',
    submitted_by_name: 'Dr. Martin Choy',
    created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString()
  },
  {
    _id: 'pds3',
    title: 'Supplementary Exam — Info Security',
    description: 'Supplementary examination result for COMP3080',
    status: 'Submitted',
    amendment_ids: ['pd_4'],
    amendment_count: 1,
    submitted_by: 'Dr. Martin Choy',
    submitted_by_name: 'Dr. Martin Choy',
    created_at: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
    submitted_at: new Date(Date.now() - 4*24*60*60*1000).toISOString()
  },
  {
    _id: 'pds4',
    title: 'SE Lab Deferred — Ethan Mok',
    description: 'Deferred lab assignment conversion for COMP3047',
    status: 'Draft',
    amendment_ids: ['pd_5'],
    amendment_count: 1,
    submitted_by: 'Dr. Martin Choy',
    submitted_by_name: 'Dr. Martin Choy',
    created_at: new Date(Date.now() - 6*24*60*60*1000).toISOString()
  },
  {
    _id: 'pds5',
    title: 'NLP Appeal — Fiona Chan',
    description: 'Grade appeal for COMP4060 Natural Language Processing',
    status: 'Draft',
    amendment_ids: ['pd_6'],
    amendment_count: 1,
    submitted_by: 'Dr. Martin Choy',
    submitted_by_name: 'Dr. Martin Choy',
    created_at: new Date(Date.now() - 4*24*60*60*1000).toISOString()
  },
  {
    _id: 'pds6',
    title: 'Compiler & Cloud Batch — Makeup/Supp',
    description: 'Makeup and supplementary exam results for multiple students',
    status: 'Draft',
    amendment_ids: ['pd_7', 'pd_8'],
    amendment_count: 2,
    submitted_by: 'Dr. Martin Choy',
    submitted_by_name: 'Dr. Martin Choy',
    created_at: new Date(Date.now() - 3*24*60*60*1000).toISOString()
  },
  {
    _id: 'pds7',
    title: 'Web Dev Deferred — Ivan Leung',
    description: 'Deferred final assessment conversion for COMP3050',
    status: 'Draft',
    amendment_ids: ['pd_9'],
    amendment_count: 1,
    submitted_by: 'Dr. Martin Choy',
    submitted_by_name: 'Dr. Martin Choy',
    created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString()
  },
  {
    _id: 'pds_rej1',
    title: 'Compiler Design Appeal — Mary Wong',
    description: 'Grade appeal for COMP3090 Compiler Design',
    status: 'Rejected',
    amendment_ids: ['pd_rej_1'],
    amendment_count: 1,
    submitted_by: 'Dr. Martin Choy',
    submitted_by_name: 'Dr. Martin Choy',
    rejection_reason: 'Missing supporting documentation. Please attach the original exam paper and resubmit with complete evidence.',
    created_at: new Date(Date.now() - 8*24*60*60*1000).toISOString(),
    submitted_at: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
    rejected_at: new Date(Date.now() - 5*24*60*60*1000).toISOString()
  }
]

const DEMO_SUBMISSIONS_STORAGE_KEY = 'demo_shared_submissions_v1'

export const useSubmissionStore = defineStore('submission', () => {
  const submissions = ref([])
  const currentSubmission = ref(null)
  const loading = ref(false)
  const error = ref('')

  const isDemoUser = () => {
    const auth = useAuthStore()
    return auth.token?.startsWith('demo_token_')
  }

  const cloneDemoSubmissions = (items = []) => items.map(item => ({ ...item }))

  const readSharedDemoSubmissions = () => {
    try {
      const raw = localStorage.getItem(DEMO_SUBMISSIONS_STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return null
      return cloneDemoSubmissions(parsed)
    } catch {
      return null
    }
  }

  const persistSharedDemoSubmissions = (items = []) => {
    localStorage.setItem(DEMO_SUBMISSIONS_STORAGE_KEY, JSON.stringify(items))
  }

  const getSharedDemoSubmissions = () => {
    const stored = readSharedDemoSubmissions()
    if (stored) return stored
    const seeded = cloneDemoSubmissions(DEMO_SUBMISSIONS)
    persistSharedDemoSubmissions(seeded)
    return seeded
  }

  const getDemoSubmissionsByRole = (role) => {
    const shared = getSharedDemoSubmissions()
    if (role !== 'Programme Director') {
      return shared
    }

    const merged = [...shared]
    const existingIds = new Set(shared.map(s => s._id))
    for (const sample of PD_DEMO_SUBMISSIONS) {
      if (!existingIds.has(sample._id)) {
        merged.push({ ...sample })
      }
    }
    return merged
  }

  const setDemoSubmissionsByRole = (role) => {
    submissions.value = getDemoSubmissionsByRole(role)
  }

  const updateDemoSubmission = (id, mutateFn) => {
    const auth = useAuthStore()
    const shared = getSharedDemoSubmissions()
    const sharedIndex = shared.findIndex(s => s._id === id)

    if (sharedIndex >= 0) {
      const updated = mutateFn({ ...shared[sharedIndex] })
      shared[sharedIndex] = updated
      persistSharedDemoSubmissions(shared)
      setDemoSubmissionsByRole(auth.user?.role)
      return updated
    }

    const localIndex = submissions.value.findIndex(s => s._id === id)
    if (localIndex >= 0) {
      const localCopy = [...submissions.value]
      localCopy[localIndex] = mutateFn({ ...localCopy[localIndex] })
      submissions.value = localCopy
      return localCopy[localIndex]
    }

    return null
  }

  async function fetchSubmissions(query) {
    const auth = useAuthStore()
    loading.value = true
    error.value = ''

    if (isDemoUser()) {
      setDemoSubmissionsByRole(auth.user?.role)
      loading.value = false
      return
    }

    try {
      let url = '/api/submissions'
      const params = new URLSearchParams(query || {})
      // Ensure we fetch all statuses including Draft
      if (!params.has('status')) {
        params.append('includeAll', 'true')
      }
      const queryString = params.toString()
      if (queryString) url += '?' + queryString
      
      const res = await apiFetch(url, { headers: auth.authHeaders() })
      if (!res.ok) throw new Error('Failed to fetch submissions')
      submissions.value = await res.json()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchSubmission(id) {
    if (isDemoUser()) {
      const auth = useAuthStore()
      currentSubmission.value = getDemoSubmissionsByRole(auth.user?.role).find(s => s._id === id) || null
      return
    }

    const auth = useAuthStore()
    loading.value = true
    try {
      const res = await apiFetch('/api/submissions/' + id, { headers: auth.authHeaders() })
      if (!res.ok) throw new Error('Not found')
      currentSubmission.value = await res.json()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createSubmission(data) {
    if (isDemoUser()) {
      const auth = useAuthStore()
      const shared = getSharedDemoSubmissions()
      const newSub = {
        _id: 'ds_' + Date.now(),
        ...data,
        status: 'Draft',
        amendment_count: data.amendment_ids?.length || 0,
        submitted_by: auth.user?.name || 'Demo User',
        submitted_by_name: auth.user?.name || 'Demo User',
        created_at: new Date().toISOString()
      }
      const nextShared = [newSub, ...shared]
      persistSharedDemoSubmissions(nextShared)
      setDemoSubmissionsByRole(auth.user?.role)
      return newSub
    }

    const auth = useAuthStore()
    const res = await apiFetch('/api/submissions', {
      method: 'POST',
      headers: auth.authHeaders(),
      body: JSON.stringify(data)
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || 'Failed to create submission')
    
    // Add newly created draft submission to the store immediately
    if (result && result.status === 'Draft') {
      submissions.value.unshift(result)
    }
    
    return result
  }

  async function submitToAdmin(id) {
    if (isDemoUser()) {
      return updateDemoSubmission(id, (s) => ({
        ...s,
        status: 'Submitted',
        submitted_at: new Date().toISOString()
      }))
    }

    const auth = useAuthStore()
    const res = await apiFetch('/api/submissions/' + id + '/submit', {
      method: 'POST',
      headers: auth.authHeaders()
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || 'Submit failed')
    await fetchSubmissions()
    return result
  }

  async function approveSubmission(id) {
    const auth = useAuthStore()
    if (auth.user?.role === 'admin') {
      throw new Error('Admin accounts cannot approve amendment submissions')
    }

    if (isDemoUser()) {
      return updateDemoSubmission(id, (s) => ({
        ...s,
        status: 'Approved',
        approved_at: new Date().toISOString(),
        approved_by_name: auth.user?.name || 'Demo Reviewer'
      }))
    }

    const res = await apiFetch('/api/submissions/' + id + '/approve', {
      method: 'POST',
      headers: auth.authHeaders()
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || 'Approve failed')
    await fetchSubmissions()
    return result
  }

  async function rejectSubmission(id, reason) {
    const auth = useAuthStore()
    if (auth.user?.role === 'admin') {
      throw new Error('Admin accounts cannot reject amendment submissions')
    }

    if (isDemoUser()) {
      return updateDemoSubmission(id, (s) => ({
        ...s,
        status: 'Rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      }))
    }

    const res = await apiFetch('/api/submissions/' + id + '/reject', {
      method: 'POST',
      headers: auth.authHeaders(),
      body: JSON.stringify({ reason })
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || 'Reject failed')
    await fetchSubmissions()
    return result
  }

  async function resubmitSubmission(id) {
    if (isDemoUser()) {
      return updateDemoSubmission(id, (s) => {
        const next = { ...s, status: 'Submitted', submitted_at: new Date().toISOString() }
        delete next.rejection_reason
        delete next.rejected_at
        return next
      })
    }

    const auth = useAuthStore()
    const res = await apiFetch('/api/submissions/' + id + '/resubmit', {
      method: 'POST',
      headers: auth.authHeaders()
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || 'Resubmit failed')
    await fetchSubmissions()

    const updated = submissions.value.find(s => s._id === id)
    if (updated) {
      updated.status = 'Submitted'
      updated.submitted_at = result.submitted_at || new Date().toISOString()
      delete updated.rejection_reason
      delete updated.rejected_at
    }
    return result
  }

  async function markPrinted(id) {
    if (isDemoUser()) {
      return updateDemoSubmission(id, (s) => ({
        ...s,
        printed: true,
        printed_at: new Date().toISOString()
      }))
    }

    const auth = useAuthStore()
    const res = await apiFetch('/api/submissions/' + id + '/print', {
      method: 'POST',
      headers: auth.authHeaders()
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || 'Print failed')
    await fetchSubmissions()
    return result
  }

  async function sendPendingReminder() {
    const auth = useAuthStore()

    if (isDemoUser()) {
      const pendingCount = submissions.value.filter(s => s.status === 'Submitted').length
      if (pendingCount === 0) throw new Error('No pending submissions to remind')
      return { ok: true, pendingCount }
    }

    const res = await apiFetch('/api/submissions/reminder', {
      method: 'POST',
      headers: auth.authHeaders()
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || 'Failed to send reminder')
    return result
  }

  async function fetchReminderSettings() {
    const auth = useAuthStore()

    if (isDemoUser()) {
      return {
        pendingThresholdDays: 3,
        updated_at: null,
        updated_by: 'System'
      }
    }

    const res = await apiFetch('/api/settings/reminder', {
      headers: auth.authHeaders()
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || 'Failed to fetch reminder settings')
    return result
  }

  async function updateReminderSettings(payload) {
    const auth = useAuthStore()

    if (isDemoUser()) {
      return {
        ok: true,
        pendingThresholdDays: Number(payload?.pendingThresholdDays) || 3,
        updated_at: new Date().toISOString(),
        updated_by: auth.user?.name || 'Demo Admin'
      }
    }

    const res = await apiFetch('/api/settings/reminder', {
      method: 'PUT',
      headers: auth.authHeaders(),
      body: JSON.stringify(payload || {})
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || 'Failed to update reminder settings')
    return result
  }

  return { submissions, currentSubmission, loading, error, fetchSubmissions, fetchSubmission, createSubmission, submitToAdmin, approveSubmission, rejectSubmission, resubmitSubmission, markPrinted, sendPendingReminder, fetchReminderSettings, updateReminderSettings }
})
