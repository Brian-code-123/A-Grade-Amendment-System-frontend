import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/amendments' }),
}))

import HelpAssistant from '@/components/HelpAssistant.vue'

describe('HelpAssistant', () => {
  it('shows page-specific tips and toggles panel', async () => {
    const wrapper = mount(HelpAssistant)

    expect(wrapper.find('.help-panel').exists()).toBe(false)

    await wrapper.find('.help-btn').trigger('click')
    expect(wrapper.find('.help-panel').exists()).toBe(true)
    expect(wrapper.text()).toContain('Amendments Page')
    expect(wrapper.text()).toContain('New Amendment')

    await wrapper.find('.help-btn').trigger('click')
    expect(wrapper.find('.help-panel').exists()).toBe(false)
  })
})
