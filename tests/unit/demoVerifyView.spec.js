import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const pushMock = vi.fn()
const setAuthMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    setAuth: setAuthMock,
  }),
}))

import DemoVerifyView from '@/views/DemoVerifyView.vue'

describe('DemoVerifyView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    pushMock.mockReset()
    setAuthMock.mockReset()
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows error on wrong answer and logs in on correct answer', async () => {
    const wrapper = mount(DemoVerifyView)

    await wrapper.find('input[placeholder="Enter the result"]').setValue('999')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Incorrect verification code')

    await wrapper.find('input[placeholder="Enter the result"]').setValue('2')
    await wrapper.find('form').trigger('submit.prevent')

    vi.advanceTimersByTime(900)

    expect(setAuthMock).toHaveBeenCalledTimes(1)
    const [, user] = setAuthMock.mock.calls[0]
    expect(user.role).toBe('admin')
    expect(pushMock).toHaveBeenCalledWith('/')
  })
})
