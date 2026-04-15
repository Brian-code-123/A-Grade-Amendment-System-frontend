import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useSubmissionStore } from '@/stores/submissionStore'

describe('submissionStore', () => {
  beforeEach(() => {
    localStorage.removeItem('demo_shared_submissions_v1')
    setActivePinia(createPinia())
  })

  it('supports demo submission workflow operations', async () => {
    const auth = useAuthStore()
    auth.setAuth('demo_token_pd_1', { name: 'Dr. Demo', role: 'Programme Director' })

    const store = useSubmissionStore()
    await store.fetchSubmissions()

    const created = await store.createSubmission({
      title: 'Demo Batch',
      description: 'Created in unit test',
      amendment_ids: ['demo_1', 'demo_2'],
    })

    expect(created.status).toBe('Draft')
    expect(created.amendment_count).toBe(2)

    await store.submitToAdmin(created._id)
    expect(store.submissions.find((s) => s._id === created._id)?.status).toBe('Submitted')

    await store.rejectSubmission(created._id, 'Missing attachment')
    expect(store.submissions.find((s) => s._id === created._id)?.status).toBe('Rejected')

    await store.resubmitSubmission(created._id)
    expect(store.submissions.find((s) => s._id === created._id)?.status).toBe('Submitted')

    await store.markPrinted(created._id)
    expect(store.submissions.find((s) => s._id === created._id)?.printed).toBe(true)
  })

  it('prevents admin users from approving/rejecting', async () => {
    const auth = useAuthStore()
    auth.setAuth('demo_token_admin', { name: 'Admin', role: 'admin' })

    const store = useSubmissionStore()
    await expect(store.approveSubmission('demo')).rejects.toThrow(
      'Admin accounts cannot approve amendment submissions',
    )
    await expect(store.rejectSubmission('demo', 'no')).rejects.toThrow(
      'Admin accounts cannot reject amendment submissions',
    )
  })

  it('syncs demo teacher submissions into PD review list', async () => {
    setActivePinia(createPinia())
    const teacherAuth = useAuthStore()
    teacherAuth.setAuth('demo_token_teacher_1', { name: 'Teacher Demo', role: 'Teacher' })

    const teacherStore = useSubmissionStore()
    await teacherStore.fetchSubmissions()

    const created = await teacherStore.createSubmission({
      title: 'Shared Demo Case',
      description: 'Teacher created this case',
      amendment_ids: ['demo_1'],
    })
    await teacherStore.submitToAdmin(created._id)

    setActivePinia(createPinia())
    const pdAuth = useAuthStore()
    pdAuth.setAuth('demo_token_pd_1', { name: 'PD Demo', role: 'Programme Director' })

    const pdStore = useSubmissionStore()
    await pdStore.fetchSubmissions()
    expect(pdStore.submissions.find((s) => s._id === created._id)?.status).toBe('Submitted')

    await pdStore.approveSubmission(created._id)

    setActivePinia(createPinia())
    const teacherAuthReloaded = useAuthStore()
    teacherAuthReloaded.setAuth('demo_token_teacher_2', { name: 'Teacher Demo', role: 'Teacher' })

    const teacherStoreReloaded = useSubmissionStore()
    await teacherStoreReloaded.fetchSubmissions()
    expect(teacherStoreReloaded.submissions.find((s) => s._id === created._id)?.status).toBe('Approved')
  })
})
