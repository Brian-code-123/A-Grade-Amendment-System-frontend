import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useAmendmentStore } from '@/stores/amendmentStore'

describe('amendmentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('supports demo CRUD for teacher/PD users', async () => {
    const auth = useAuthStore()
    auth.setAuth('demo_token_pd_1', { name: 'Teacher Demo', role: 'Programme Director' })

    const store = useAmendmentStore()
    await store.fetchAmendments()
    expect(store.amendments.length).toBeGreaterThan(0)

    const created = await store.createAmendment({
      academic_year: '2025-2026',
      term: '1',
      student_no: 'S998877',
      student_name: 'Unit Test',
      course_code: 'COMP9999',
      course_title: 'Testing',
      original_grade: 'B',
      new_grade: 'A',
      reason_type: 'conversion',
      instructor_name: 'Teacher Demo',
      department: 'COMP',
    })

    expect(created._id.startsWith('demo_')).toBe(true)

    const updated = await store.updateAmendment(created._id, { new_grade: 'A-' })
    expect(updated.new_grade).toBe('A-')

    await store.deleteAmendment(created._id)
    expect(store.amendments.find((a) => a._id === created._id)).toBeUndefined()
  })

  it('blocks admin accounts from changing amendments', async () => {
    const auth = useAuthStore()
    auth.setAuth('demo_token_admin_1', { name: 'Admin', role: 'admin' })

    const store = useAmendmentStore()
    await expect(store.createAmendment({ course_code: 'COMP1' })).rejects.toThrow(
      'Admin accounts cannot modify amendment requests',
    )
  })

  it('does not allow excel import in demo mode', async () => {
    const auth = useAuthStore()
    auth.setAuth('demo_token_pd_2', { name: 'Teacher Demo', role: 'Programme Director' })

    const store = useAmendmentStore()
    await expect(store.importExcel(new File(['x'], 'demo.xlsx'))).rejects.toThrow(
      'Excel import is not available in demo mode',
    )
  })

  it('captures API errors for fetchAmendments', async () => {
    const auth = useAuthStore()
    auth.setAuth('token_real', { name: 'Teacher', role: 'Programme Director' })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })))

    const store = useAmendmentStore()
    await store.fetchAmendments()
    expect(store.error).toContain('Failed to fetch amendments')
  })
})
