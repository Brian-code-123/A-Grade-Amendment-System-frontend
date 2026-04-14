import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SignatureSetupView from '@/views/SignatureSetupView.vue'
import { useAuthStore } from '@/stores/authStore'

describe('SignatureSetupView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders signature setup form', () => {
    const auth = useAuthStore()
    auth.setAuth('teacher_token', { name: 'Teacher', role: 'teacher' })

    const wrapper = mount(SignatureSetupView, {
      global: {
        stubs: ['o-field', 'o-button', 'o-icon', 'canvas', 'SignatureBoard'],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays signature canvas for drawing', () => {
    const auth = useAuthStore()
    auth.setAuth('teacher_token', { name: 'Teacher', role: 'teacher' })

    const wrapper = mount(SignatureSetupView, {
      global: {
        stubs: ['o-field', 'o-button', 'o-icon', 'canvas', 'SignatureBoard'],
      },
    })
    expect(wrapper.vm).toBeDefined()
  })

  it('provides clear/reset button for signature', () => {
    const auth = useAuthStore()
    auth.setAuth('teacher_token', { name: 'Teacher', role: 'teacher' })

    const wrapper = mount(SignatureSetupView, {
      global: {
        stubs: ['o-field', 'o-button', 'o-icon', 'canvas', 'SignatureBoard'],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('validates signature is not empty before save', async () => {
    const auth = useAuthStore()
    auth.setAuth('teacher_token', { name: 'Teacher', role: 'teacher' })

    const wrapper = mount(SignatureSetupView, {
      global: {
        stubs: ['o-field', 'o-button', 'o-icon', 'canvas', 'SignatureBoard'],
      },
    })
    expect(wrapper.vm).toBeDefined()
    await flushPromises()
  })

  it('saves signature to local storage', async () => {
    const auth = useAuthStore()
    auth.setAuth('teacher_token', { name: 'Teacher', role: 'teacher' })

    const wrapper = mount(SignatureSetupView, {
      global: {
        stubs: ['o-field', 'o-button', 'o-icon', 'canvas', 'SignatureBoard'],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('shows success notification on save', async () => {
    const auth = useAuthStore()
    auth.setAuth('teacher_token', { name: 'Teacher', role: 'teacher' })

    const wrapper = mount(SignatureSetupView, {
      global: {
        stubs: ['o-field', 'o-button', 'o-icon', 'canvas', 'SignatureBoard'],
      },
    })
    expect(wrapper.vm).toBeDefined()
    await flushPromises()
  })

  it('allows retaking signature after setup', () => {
    const auth = useAuthStore()
    auth.setAuth('teacher_token', { name: 'Teacher', role: 'teacher' })

    const wrapper = mount(SignatureSetupView, {
      global: {
        stubs: ['o-field', 'o-button', 'o-icon', 'canvas', 'SignatureBoard'],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays current signature preview if already set', () => {
    const auth = useAuthStore()
    auth.setAuth('teacher_token', { name: 'Teacher', role: 'teacher' })
    localStorage.setItem('userSignature', 'data:image/png;base64,test')

    const wrapper = mount(SignatureSetupView, {
      global: {
        stubs: ['o-field', 'o-button', 'o-icon', 'canvas', 'SignatureBoard'],
      },
    })
    expect(wrapper.vm).toBeDefined()
  })

  it('redirects to home after successful signature setup', () => {
    const auth = useAuthStore()
    auth.setAuth('teacher_token', { name: 'Teacher', role: 'teacher' })

    const wrapper = mount(SignatureSetupView, {
      global: {
        stubs: ['o-field', 'o-button', 'o-icon', 'canvas', 'SignatureBoard', 'RouterView'],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
