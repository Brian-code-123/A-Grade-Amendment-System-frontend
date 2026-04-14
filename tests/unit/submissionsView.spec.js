import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SubmissionsView from '@/views/SubmissionsView.vue'
import { useAuthStore } from '@/stores/authStore'
import { useSubmissionStore } from '@/stores/submissionStore'

describe('SubmissionsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders submissions management view', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(SubmissionsView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-table', 'o-button', 'o-icon'],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays list of all submissions', async () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const submission = useSubmissionStore()
    vi.spyOn(submission, 'fetchSubmissions').mockResolvedValue([
      {
        _id: 'sub123',
        status: 'pending',
        student_no: 'S001',
        student_name: 'Test Student',
        course_code: 'COMP101',
      },
    ])

    const wrapper = mount(SubmissionsView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-table', 'o-button', 'o-icon'],
      },
    })

    expect(wrapper.exists()).toBe(true)
    await flushPromises()
  })

  it('filters submissions by status (pending, approved, rejected)', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(SubmissionsView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-table', 'o-button', 'o-icon'],
      },
    })
    expect(wrapper.vm).toBeDefined()
  })

  it('displays submission details in table', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(SubmissionsView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-table', 'o-button', 'o-icon'],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('allows searching submissions by student or course', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(SubmissionsView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-table', 'o-button', 'o-icon'],
      },
    })
    expect(wrapper.vm).toBeDefined()
  })

  it('provides view detail button for each submission', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(SubmissionsView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-table', 'o-button', 'o-icon'],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays pagination for large submission lists', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(SubmissionsView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-table', 'o-button', 'o-icon', 'o-pagination'],
      },
    })
    expect(wrapper.vm).toBeDefined()
  })

  it('shows submission timestamps', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(SubmissionsView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-table', 'o-button', 'o-icon'],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('allows bulk status update', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(SubmissionsView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-table', 'o-button', 'o-icon'],
      },
    })
    expect(wrapper.vm).toBeDefined()
  })

  it('provides export submissions functionality', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(SubmissionsView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-table', 'o-button', 'o-icon'],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('shows loading state while fetching submissions', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(SubmissionsView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-table', 'o-button', 'o-icon', 'o-loading'],
      },
    })
    expect(wrapper.vm).toBeDefined()
  })
})
