import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useArchiveStore } from './archiveStore'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

const makeSubmissions = () => [
  { _id: 's1', title: 'Sub 1', created_at: '2024-09-15T10:00:00.000Z' },
  { _id: 's2', title: 'Sub 2', created_at: '2024-10-20T10:00:00.000Z' },
  { _id: 's3', title: 'Sub 3', created_at: '2025-02-01T10:00:00.000Z' },
]

describe('archiveStore – addSemester', () => {
  it('adds a semester and returns its id', () => {
    const store = useArchiveStore()
    const id = store.addSemester('Sem 1 2024-25', '2024-09-01', '2025-01-31')
    expect(id).toMatch(/^sem_/)
    expect(store.semesters).toHaveLength(1)
    expect(store.semesters[0].name).toBe('Sem 1 2024-25')
  })

  it('persists semesters to localStorage', () => {
    const store = useArchiveStore()
    store.addSemester('Sem A', '2024-01-01', '2024-06-30')
    const persisted = JSON.parse(localStorage.getItem('archive_semesters'))
    expect(persisted).toHaveLength(1)
    expect(persisted[0].name).toBe('Sem A')
  })
})

describe('archiveStore – removeSemester', () => {
  it('removes the semester from the list', () => {
    const store = useArchiveStore()
    const id = store.addSemester('Sem B', '2024-01-01', '2024-06-30')
    store.removeSemester(id)
    expect(store.semesters).toHaveLength(0)
  })

  it('also removes the archive map entry for that semester', () => {
    const store = useArchiveStore()
    const id = store.addSemester('Sem C', '2024-09-01', '2025-01-31')
    store.archiveBySemester(id, makeSubmissions())
    expect(Object.keys(store.archivedMap)).toContain(id)
    store.removeSemester(id)
    expect(Object.keys(store.archivedMap)).not.toContain(id)
  })
})

describe('archiveStore – updateSemester', () => {
  it('updates name and dates of an existing semester', () => {
    const store = useArchiveStore()
    const id = store.addSemester('Old Name', '2024-01-01', '2024-06-30')
    store.updateSemester(id, 'New Name', '2024-02-01', '2024-07-31')
    const sem = store.semesters.find(s => s.id === id)
    expect(sem.name).toBe('New Name')
    expect(sem.startDate).toBe('2024-02-01')
  })
})

describe('archiveStore – archiveBySemester', () => {
  it('archives submissions within the semester date range', () => {
    const store = useArchiveStore()
    const id = store.addSemester('Sem 1 2024-25', '2024-09-01', '2025-01-31')
    const count = store.archiveBySemester(id, makeSubmissions())
    // s1 (Sep) and s2 (Oct) fall within Sem 1 range
    expect(count).toBe(2)
    expect(store.archivedMap[id]).toContain('s1')
    expect(store.archivedMap[id]).toContain('s2')
    expect(store.archivedMap[id]).not.toContain('s3')
  })

  it('does not archive the same submission twice', () => {
    const store = useArchiveStore()
    const id = store.addSemester('Sem 1 2024-25', '2024-09-01', '2025-01-31')
    store.archiveBySemester(id, makeSubmissions())
    const secondCount = store.archiveBySemester(id, makeSubmissions())
    expect(secondCount).toBe(0)
  })

  it('returns 0 when no submissions match the date range', () => {
    const store = useArchiveStore()
    const id = store.addSemester('Future Sem', '2030-01-01', '2030-06-30')
    const count = store.archiveBySemester(id, makeSubmissions())
    expect(count).toBe(0)
  })
})

describe('archiveStore – isArchived', () => {
  it('returns true for archived submission', () => {
    const store = useArchiveStore()
    const id = store.addSemester('Sem 1', '2024-09-01', '2025-01-31')
    store.archiveBySemester(id, makeSubmissions())
    expect(store.isArchived('s1')).toBe(true)
  })

  it('returns false for non-archived submission', () => {
    const store = useArchiveStore()
    expect(store.isArchived('nonexistent')).toBe(false)
  })
})

describe('archiveStore – unarchive', () => {
  it('removes specified submissions from the archive', () => {
    const store = useArchiveStore()
    const id = store.addSemester('Sem 1', '2024-09-01', '2025-01-31')
    store.archiveBySemester(id, makeSubmissions())
    store.unarchive(['s1'])
    expect(store.isArchived('s1')).toBe(false)
    expect(store.isArchived('s2')).toBe(true)
  })

  it('removes the semester key when all submissions are unarchived', () => {
    const store = useArchiveStore()
    const id = store.addSemester('Sem 1', '2024-09-01', '2025-01-31')
    store.archiveBySemester(id, makeSubmissions())
    store.unarchive(['s1', 's2'])
    expect(Object.keys(store.archivedMap)).not.toContain(id)
  })
})

describe('archiveStore – getArchivedSubmissions', () => {
  it('returns archived submissions for a specific semester', () => {
    const store = useArchiveStore()
    const id = store.addSemester('Sem 1', '2024-09-01', '2025-01-31')
    store.archiveBySemester(id, makeSubmissions())
    const archived = store.getArchivedSubmissions(makeSubmissions(), id)
    expect(archived.map(s => s._id)).toEqual(expect.arrayContaining(['s1', 's2']))
    expect(archived.find(s => s._id === 's3')).toBeUndefined()
  })

  it('returns all archived submissions when no semesterId is provided', () => {
    const store = useArchiveStore()
    const id = store.addSemester('Sem 1', '2024-09-01', '2025-01-31')
    store.archiveBySemester(id, makeSubmissions())
    const all = store.getArchivedSubmissions(makeSubmissions())
    expect(all.length).toBe(2)
  })
})
