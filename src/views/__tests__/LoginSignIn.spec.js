import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LoginView from '../LoginView.vue'
import { useAuthStore } from '@/stores/authStore'

const routerMock = { replace: vi.fn(), push: vi.fn() }
vi.mock('vue-router', () => ({ useRouter: () => routerMock }))

async function signInForm(code) {
  const wrapper = mount(LoginView)
  await wrapper.find('input[type="email"]').setValue('t@life.hkbu.edu.hk')
  await wrapper.find('input[type="password"]').setValue('correct-horse-1')
  if (code !== undefined) await wrapper.find('input[placeholder="6-digit code"]').setValue(code)
  return wrapper
}

describe('LoginView sign in needs the emailed code', () => {
  let auth
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    auth = useAuthStore()
    auth.login = vi.fn()
    auth.loginWithCode = vi.fn()
    routerMock.replace.mockClear()
  })

  it('asks for the code instead of signing in with the password alone', async () => {
    const wrapper = await signInForm()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(auth.login).not.toHaveBeenCalled()
    expect(auth.loginWithCode).not.toHaveBeenCalled()
    expect(wrapper.text()).toMatch(/verification code/i)
  })

  it('marks the code field as required before a code is sent', async () => {
    const wrapper = await signInForm()
    expect(wrapper.find('input[placeholder="6-digit code"]').attributes('required')).toBeDefined()
  })

  it('signs in with the code and goes to the landing page', async () => {
    auth.loginWithCode.mockResolvedValue({})
    const wrapper = await signInForm('123456')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(auth.loginWithCode).toHaveBeenCalledWith('t@life.hkbu.edu.hk', 'correct-horse-1', '123456')
    expect(routerMock.replace).toHaveBeenCalled()
  })

  it('shows the error and never falls back to password-only when the code is wrong', async () => {
    auth.loginWithCode.mockRejectedValue(new Error('Invalid or expired verification code.'))
    const wrapper = await signInForm('000000')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(auth.login).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Invalid or expired verification code.')
    expect(routerMock.replace).not.toHaveBeenCalled()
  })
})

describe('authStore password-only login', () => {
  it('is gone, so no screen can sign in without a code', () => {
    setActivePinia(createPinia())
    expect(useAuthStore().login).toBeUndefined()
  })
})
