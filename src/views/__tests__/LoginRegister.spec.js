import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LoginView from '../LoginView.vue'
import { useAuthStore } from '@/stores/authStore'

const routerMock = { replace: vi.fn(), push: vi.fn() }
vi.mock('vue-router', () => ({ useRouter: () => routerMock }))

async function openRegister() {
  const wrapper = mount(LoginView)
  const registerTab = wrapper.findAll('button').find((b) => b.text() === 'Register')
  await registerTab.trigger('click')
  return wrapper
}

async function fill(wrapper, password) {
  await wrapper.find('input[type="text"]').setValue('Dr Test')
  await wrapper.find('input[type="email"]').setValue('test@life.hkbu.edu.hk')
  const [pw, confirm] = wrapper.findAll('input[type="password"]')
  await pw.setValue(password)
  await confirm.setValue(password)
}

describe('LoginView registration', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    routerMock.replace.mockClear()
  })

  it('does not offer a role choice (roles are assigned by the backend)', async () => {
    const wrapper = await openRegister()
    expect(wrapper.find('select').exists()).toBe(false)
    expect(wrapper.html()).not.toContain('>admin<')
  })

  it('states the 10 character password rule', async () => {
    const wrapper = await openRegister()
    expect(wrapper.find('input[placeholder*="10 characters"]').exists()).toBe(true)
  })

  it('rejects a short password before calling the backend', async () => {
    const auth = useAuthStore()
    auth.register = vi.fn()
    const wrapper = await openRegister()
    await fill(wrapper, 'short12')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('at least 10 characters')
    expect(auth.register).not.toHaveBeenCalled()
  })

  it('registers without sending a role', async () => {
    const auth = useAuthStore()
    auth.register = vi.fn().mockResolvedValue({})
    const wrapper = await openRegister()
    await fill(wrapper, 'long-enough-password')
    await wrapper.find('form').trigger('submit')
    expect(auth.register).toHaveBeenCalledWith('Dr Test', 'test@life.hkbu.edu.hk', 'long-enough-password')
  })
})
