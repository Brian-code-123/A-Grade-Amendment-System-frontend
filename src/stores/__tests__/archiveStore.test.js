import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useArchiveStore } from '../archiveStore'
import { useAuthStore } from '../authStore'

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) }
}

// Tiny fake of the server so the store is tested against its real contract.
function fakeServer() {
  const state = { semesters: [], archivedMap: {} }
  const calls = []
  const fetchMock = vi.fn(async (url, options = {}) => {
    const path = String(url).replace(/^https?:\/\/[^/]+/, '')
    const method = options.method || 'GET'
    calls.push(`${method} ${path}`)
    const body = options.body ? JSON.parse(options.body) : {}
    if (method === 'GET' && path === '/api/archive') return jsonResponse(state)
    if (method === 'POST' && path === '/api/archive/semesters') {
      const sem = { id: 'sem1', ...body }
      state.semesters.push(sem)
      return jsonResponse(sem, 201)
    }
    if (method === 'PUT' && path === '/api/archive/semesters/sem1') {
      Object.assign(state.semesters[0], body)
      return jsonResponse(state.semesters[0])
    }
    if (method === 'DELETE' && path === '/api/archive/semesters/sem1') {
      state.semesters = []
      state.archivedMap = {}
      return jsonResponse({ ok: true })
    }
    if (method === 'POST' && path === '/api/archive/semesters/sem1/archive') {
      state.archivedMap.sem1 = ['s1', 's2']
      return jsonResponse({ archived: 2 })
    }
    if (method === 'POST' && path === '/api/archive/unarchive') {
      state.archivedMap.sem1 = state.archivedMap.sem1.filter((id) => !body.submissionIds.includes(id))
      return jsonResponse({ unarchived: body.submissionIds.length })
    }
    return jsonResponse({ message: 'Semester not found.' }, 404)
  })
  return { state, calls, fetchMock }
}

describe('archiveStore with a real session', () => {
  let server
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    useAuthStore().setAuth('real-token', { name: 'Admin', email: 'a@example.com', role: 'admin' })
    server = fakeServer()
    globalThis.fetch = server.fetchMock
  })

  it('loads semesters and archived ids from the server, not from localStorage', async () => {
    localStorage.setItem('archive_semesters', JSON.stringify([{ id: 'old', name: 'Stale' }]))
    server.state.semesters = [{ id: 'sem1', name: 'Sem 1', startDate: '2026-01-01', endDate: '2026-05-31' }]
    server.state.archivedMap = { sem1: ['s1'] }
    const store = useArchiveStore()
    await store.load()
    expect(store.semesters.map((s) => s.id)).toEqual(['sem1'])
    expect(store.isArchived('s1')).toBe(true)
    expect(store.isArchived('s2')).toBe(false)
  })

  it('sends the session token with every request', async () => {
    await useArchiveStore().load()
    const headers = server.fetchMock.mock.calls[0][1].headers
    expect(headers.Authorization).toBe('Bearer real-token')
  })

  it('adds, updates and removes a semester through the API', async () => {
    const store = useArchiveStore()
    const id = await store.addSemester('Sem 1', '2026-01-01', '2026-05-31')
    expect(id).toBe('sem1')
    expect(store.semesters).toHaveLength(1)
    await store.updateSemester('sem1', 'Sem 1b', '2026-01-02', '2026-06-01')
    expect(store.semesters[0].name).toBe('Sem 1b')
    await store.removeSemester('sem1')
    expect(store.semesters).toHaveLength(0)
    expect(localStorage.getItem('archive_semesters')).toBeNull()
  })

  it('archives by semester on the server and reports how many were archived', async () => {
    const store = useArchiveStore()
    await store.addSemester('Sem 1', '2026-01-01', '2026-05-31')
    const count = await store.archiveBySemester('sem1')
    expect(count).toBe(2)
    expect(store.isArchived('s1')).toBe(true)
    expect(store.getArchivedSubmissions([{ _id: 's1' }, { _id: 's3' }], 'sem1').map((s) => s._id)).toEqual(['s1'])
  })

  it('unarchives through the API', async () => {
    const store = useArchiveStore()
    await store.addSemester('Sem 1', '2026-01-01', '2026-05-31')
    await store.archiveBySemester('sem1')
    await store.unarchive(['s1'])
    expect(store.isArchived('s1')).toBe(false)
    expect(store.isArchived('s2')).toBe(true)
  })

  it('surfaces the server message when a request fails', async () => {
    const store = useArchiveStore()
    await expect(store.archiveBySemester('missing')).rejects.toThrow('Semester not found.')
  })
})

describe('archiveStore in demo mode', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    useAuthStore().setAuth('demo_token_admin', { name: 'Demo', email: 'demo@example.com', role: 'admin' })
    globalThis.fetch = vi.fn(async () => { throw new Error('demo mode must not call the API') })
  })

  it('works locally without calling the API', async () => {
    const store = useArchiveStore()
    await store.load()
    const id = await store.addSemester('Demo Sem', '2026-01-01', '2026-12-31')
    const count = await store.archiveBySemester(id, [{ _id: 'd1', created_at: '2026-03-01T00:00:00Z' }])
    expect(count).toBe(1)
    expect(store.isArchived('d1')).toBe(true)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})
