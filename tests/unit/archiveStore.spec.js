import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useArchiveStore } from '@/stores/archiveStore'

describe('archiveStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds, updates and removes semesters', () => {
    vi.spyOn(Date, 'now').mockReturnValue(12345)
    const store = useArchiveStore()

    const id = store.addSemester('Sem 1', '2026-01-01', '2026-03-31')
    expect(id).toBe('sem_12345')
    expect(store.semesters).toHaveLength(1)

    store.updateSemester(id, 'Sem 1 Updated', '2026-01-10', '2026-04-01')
    expect(store.semesters[0].name).toBe('Sem 1 Updated')

    store.removeSemester(id)
    expect(store.semesters).toHaveLength(0)
  })

  it('archives and unarchives submissions by semester range', () => {
    const store = useArchiveStore()
    const semId = store.addSemester('AY Window', '2026-01-01', '2026-01-31')

    const submissions = [
      { _id: 's1', created_at: '2026-01-15T10:00:00.000Z' },
      { _id: 's2', created_at: '2026-02-01T10:00:00.000Z' },
    ]

    const count = store.archiveBySemester(semId, submissions)
    expect(count).toBe(1)
    expect(store.isArchived('s1')).toBe(true)
    expect(store.isArchived('s2')).toBe(false)

    const archived = store.getArchivedSubmissions(submissions, semId)
    expect(archived.map((s) => s._id)).toEqual(['s1'])

    store.unarchive(['s1'])
    expect(store.isArchived('s1')).toBe(false)
  })
})
