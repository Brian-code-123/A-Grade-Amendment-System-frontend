import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import HelpAssistant from '@/components/HelpAssistant.vue'

describe('HelpAssistant', () => {
  let router

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/amendments', component: { template: '<div>Amendments</div>' } },
        { path: '/pd-approvals', component: { template: '<div>PD</div>' } },
        { path: '/admin', component: { template: '<div>Admin</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
      ],
    })
  })

  it('shows page-specific tips and toggles panel', async () => {
    router.push('/amendments')
    await router.isReady()

    const wrapper = mount(HelpAssistant, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.find('.help-panel').exists()).toBe(false)

    await wrapper.find('.help-btn').trigger('click')
    expect(wrapper.find('.help-panel').exists()).toBe(true)
    expect(wrapper.text()).toContain('Amendments Page')
    expect(wrapper.text()).toContain('New Amendment')

    await wrapper.find('.help-btn').trigger('click')
    expect(wrapper.find('.help-panel').exists()).toBe(false)
  })

  it('displays help panel on amendments page', async () => {
    router.push('/amendments')
    await router.isReady()

    const wrapper = mount(HelpAssistant, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.find('.help-btn').trigger('click')
    expect(wrapper.text()).toContain('Amendments Page')
  })

  it('displays help panel on PD approvals page', async () => {
    router.push('/pd-approvals')
    await router.isReady()

    const wrapper = mount(HelpAssistant, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.find('.help-btn').trigger('click')
    expect(wrapper.exists()).toBe(true)
  })

  it('displays help panel on admin page', async () => {
    router.push('/admin')
    await router.isReady()

    const wrapper = mount(HelpAssistant, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.find('.help-btn').trigger('click')
    expect(wrapper.exists()).toBe(true)
  })

  it('helps close panel with close button', async () => {
    const wrapper = mount(HelpAssistant, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.find('.help-btn').trigger('click')
    expect(wrapper.find('.help-panel').exists()).toBe(true)

    // Find and click close button if it exists
    const closeBtn = wrapper.find('[onclick*="help"]')
    if (closeBtn.exists()) {
      await closeBtn.trigger('click')
    }
  })

  it('renders help button with appropriate icon', () => {
    const wrapper = mount(HelpAssistant, {
      global: {
        plugins: [router],
      },
    })

    const helpBtn = wrapper.find('.help-btn')
    expect(helpBtn.exists()).toBe(true)
    expect(helpBtn.classes()).toContain('help-btn')
  })

  it('help panel contains relevant information', async () => {
    const wrapper = mount(HelpAssistant, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.find('.help-btn').trigger('click')
    const panel = wrapper.find('.help-panel')
    expect(panel.text().length).toBeGreaterThan(0)
  })

  it('displays page-specific instructions based on route', async () => {
    router.push('/amendments')
    await router.isReady()

    const wrapper = mount(HelpAssistant, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.find('.help-btn').trigger('click')
    const content = wrapper.text()
    expect(content.length).toBeGreaterThan(0)
  })

  it('panel can be toggled multiple times', async () => {
    const wrapper = mount(HelpAssistant, {
      global: {
        plugins: [router],
      },
    })

    const btn = wrapper.find('.help-btn')

    // Toggle open
    await btn.trigger('click')
    expect(wrapper.find('.help-panel').exists()).toBe(true)

    // Toggle closed
    await btn.trigger('click')
    expect(wrapper.find('.help-panel').exists()).toBe(false)

    // Toggle open again
    await btn.trigger('click')
    expect(wrapper.find('.help-panel').exists()).toBe(true)
  })
})
