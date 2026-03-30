import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAmendmentStore } from './amendmentStore'
import { useAuthStore } from './authStore'

function setupDemoUser(role = 'Programme Director') {
  const auth = useAuthStore()
  auth.setAuth('demo_token_test', { name: 'Demo User', role })
}

function setupRealUser() {
  const auth = useAuthStore()
  auth.setAuth('real-token-abc', { name: 'Real User', role: 'Programme Director' })
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ─── Demo user CRUD ───────────────────────────────────────────────

describe('amendmentStore – fetchAmendments (demo PD user)', () => {
  it('populates amendments with PD demo data', async () => {
    setupDemoUser('Programme Director')
    const store = useAmendmentStore()
    await store.fetchAmendments()
    expect(store.amendments.length).toBeGreaterThan(0)
    expect(store.loading).toBe(false)
    expect(store.error).toBe('')
  })

  it('populates amendments with admin demo data for admin role', async () => {
    setupDemoUser('admin')
    const store = useAmendmentStore()
    await store.fetchAmendments()
    expect(store.amendments.length).toBeGreaterThan(0)
  })
})

describe('amendmentStore – createAmendment (demo user)', () => {
  it('adds a new amendment to the list', async () => {
    setupDemoUser()
    const store = useAmendmentStore()
    await store.fetchAmendments()
    const before = store.amendments.length

    const newAmendment = await store.createAmendment({
      student_no: '99999',
      student_name: 'Test Student',
      course_code: 'TEST101',
      original_grade: 'I',
      new_grade: 'A',
      reason_type: 'conversion',
    })

    expect(store.amendments.length).toBe(before + 1)
    expect(newAmendment.student_no).toBe('99999')
    expect(newAmendment.status).toBe('Pending')
    expect(newAmendment._id).toMatch(/^demo_/)
  })

  it('throws for admin user', async () => {
    setupDemoUser('admin')
    const store = useAmendmentStore()
    await expect(store.createAmendment({ student_no: '1' })).rejects.toThrow(/Admin accounts cannot/)
  })
})

describe('amendmentStore – updateAmendment (demo user)', () => {
  it('updates an existing amendment in place', async () => {
    setupDemoUser()
    const store = useAmendmentStore()
    await store.fetchAmendments()
    const first = store.amendments[0]

    const updated = await store.updateAmendment(first._id, { new_grade: 'B+' })
    expect(updated.new_grade).toBe('B+')
    expect(store.amendments.find(a => a._id === first._id)?.new_grade).toBe('B+')
  })

  it('throws when amendment id is not found', async () => {
    setupDemoUser()
    const store = useAmendmentStore()
    await store.fetchAmendments()
    await expect(store.updateAmendment('nonexistent-id', { new_grade: 'C' })).rejects.toThrow('Amendment not found')
  })

  it('throws for admin user', async () => {
    setupDemoUser('admin')
    const store = useAmendmentStore()
    await expect(store.updateAmendment('id1', {})).rejects.toThrow(/Admin accounts cannot/)
  })
})

describe('amendmentStore – deleteAmendment (demo user)', () => {
  it('removes the amendment from the list', async () => {
    setupDemoUser()
    const store = useAmendmentStore()
    await store.fetchAmendments()
    const first = store.amendments[0]
    const before = store.amendments.length

    await store.deleteAmendment(first._id)
    expect(store.amendments.length).toBe(before - 1)
    expect(store.amendments.find(a => a._id === first._id)).toBeUndefined()
  })

  it('throws for admin user', async () => {
    setupDemoUser('admin')
    const store = useAmendmentStore()
    await expect(store.deleteAmendment('id1')).rejects.toThrow(/Admin accounts cannot/)
  })
})

describe('amendmentStore – importExcel (demo user)', () => {
  it('throws explaining that import is unavailable in demo mode', async () => {
    setupDemoUser()
    const store = useAmendmentStore()
    await expect(store.importExcel(new File([''], 'test.xlsx'))).rejects.toThrow(/demo mode/)
  })
})

// ─── Real user (API-backed) CRUD ─────────────────────────────────

describe('amendmentStore – fetchAmendments (real user, API)', () => {
  it('fetches amendments from API and stores them', async () => {
    setupRealUser()
    const mockData = [{ _id: 'api_1', student_no: '11111', status: 'Pending' }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    })

    const store = useAmendmentStore()
    await store.fetchAmendments()
    expect(store.amendments).toEqual(mockData)
  })

  it('sets error when API call fails', async () => {
    setupRealUser()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' }),
    })

    const store = useAmendmentStore()
    await store.fetchAmendments()
    expect(store.error).toBeTruthy()
  })
})

describe('amendmentStore – createAmendment (real user, API)', () => {
  it('posts to API and prepends result to amendments', async () => {
    setupRealUser()
    const created = { _id: 'new_1', student_no: '22222', status: 'Pending' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => created,
    })

    const store = useAmendmentStore()
    const result = await store.createAmendment({ student_no: '22222' })
    expect(result._id).toBe('new_1')
    expect(store.amendments[0]).toEqual(created)
  })

  it('throws with server error message when API returns not-ok', async () => {
    setupRealUser()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Validation failed', errors: ['course_code required'] }),
    })

    const store = useAmendmentStore()
    await expect(store.createAmendment({})).rejects.toThrow('Validation failed')
  })
})

describe('amendmentStore – deleteAmendment (real user, API)', () => {
  it('calls DELETE API and removes amendment from local list', async () => {
    setupRealUser()
    const store = useAmendmentStore()
    // Pre-populate store
    store.amendments = [{ _id: 'api_del_1', student_no: '33333' }]

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })

    await store.deleteAmendment('api_del_1')
    expect(store.amendments.find(a => a._id === 'api_del_1')).toBeUndefined()
  })
})
