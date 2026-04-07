import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    token: 'demo_token_test',
    authHeaders: () => ({ Authorization: 'Bearer demo_token_test' }),
  }),
}))

vi.mock('@/utils/api', () => ({
  apiFetch: vi.fn(),
}))

import FeedbackView from '@/views/FeedbackView.vue'

describe('FeedbackView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('loads demo feedbacks and supports local demo submission', async () => {
    const wrapper = mount(FeedbackView)

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Your Feedback History')
    expect(wrapper.text()).toContain('Great system!')

    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Subject and message are required')

    await wrapper.find('input[placeholder="Brief summary..."]').setValue('Nice UX')
    await wrapper.find('textarea[placeholder="Describe your feedback in detail..."]').setValue('Really easy to use')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Feedback submitted successfully!')
    expect(wrapper.text()).toContain('Nice UX')
  })
})
