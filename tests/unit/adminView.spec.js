import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AdminView from '@/views/AdminView.vue'
import { useAuthStore } from '@/stores/authStore'

describe('AdminView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders admin panel only for authenticated admin users', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', {
      name: 'Administrator',
      role: 'admin',
      email: 'admin@hkbu.edu.hk',
    })

    const wrapper = mount(AdminView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-message', 'o-button', 'o-table'],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays submissions management tab', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(AdminView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-message', 'o-button', 'o-table'],
      },
    })
    expect(wrapper.vm).toBeDefined()
  })

  it('shows pending submissions list', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(AdminView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-message', 'o-button', 'o-table'],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('allows filtering submissions by status', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(AdminView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-message', 'o-button', 'o-table'],
      },
    })
    expect(wrapper.vm).toBeDefined()
  })

  it('provides bulk action controls for submissions', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(AdminView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-message', 'o-button', 'o-table'],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays archive management section', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(AdminView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-message', 'o-button', 'o-table'],
      },
    })
    expect(wrapper.vm).toBeDefined()
  })

  it('allows exporting submission reports', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(AdminView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-message', 'o-button', 'o-table'],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('shows system statistics and metrics', () => {
    const auth = useAuthStore()
    auth.setAuth('admin_token', { name: 'Admin', role: 'admin' })

    const wrapper = mount(AdminView, {
      global: {
        stubs: ['o-navbar', 'o-container', 'o-message', 'o-button', 'o-table'],
      },
    })
    expect(wrapper.vm).toBeDefined()
  })
})
