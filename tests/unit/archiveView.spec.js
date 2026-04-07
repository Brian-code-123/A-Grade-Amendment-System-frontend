import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

const pushMock = vi.fn()
const fetchSubmissionsMock = vi.fn()
const fetchAmendmentsMock = vi.fn()
const unarchiveMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('@/stores/archiveStore', () => ({
  useArchiveStore: () => ({
    semesters: [
      { id: 'sem1', name: 'Term 1', startDate: '2026-01-01', endDate: '2026-03-01' },
    ],
    getArchivedSubmissions: () => [
      {
        _id: 's1',
        title: 'Batch 1',
        submitted_by_name: 'Dr Test',
        status: 'Submitted',
        amendment_count: 2,
        created_at: '2026-01-20T10:00:00.000Z',
      },
    ],
    unarchive: unarchiveMock,
  }),
}))

vi.mock('@/stores/submissionStore', () => ({
  useSubmissionStore: () => ({
    submissions: [],
    fetchSubmissions: fetchSubmissionsMock,
  }),
}))

vi.mock('@/stores/amendmentStore', () => ({
  useAmendmentStore: () => ({
    fetchAmendments: fetchAmendmentsMock,
  }),
}))

import ArchiveView from '@/views/ArchiveView.vue'

describe('ArchiveView', () => {
  beforeEach(() => {
    pushMock.mockReset()
    fetchSubmissionsMock.mockReset()
    fetchAmendmentsMock.mockReset()
    unarchiveMock.mockReset()
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
  })

  it('loads archived submissions and supports unarchive + navigation', async () => {
    const wrapper = mount(ArchiveView)

    expect(fetchSubmissionsMock).toHaveBeenCalled()
    expect(fetchAmendmentsMock).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Archived Submissions')
    expect(wrapper.text()).toContain('Batch 1')

    await wrapper.get('button[title="Unarchive"]').trigger('click')
    expect(unarchiveMock).toHaveBeenCalledWith(['s1'])

    const backBtn = wrapper.findAll('button').find((b) => b.text().includes('Back to Admin'))
    await backBtn.trigger('click')
    expect(pushMock).toHaveBeenCalledWith('/admin')
  })
})
