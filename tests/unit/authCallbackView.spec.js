import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

const replaceMock = vi.fn()
const setAuthMock = vi.fn()
let routeState

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useRoute: () => routeState,
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    setAuth: setAuthMock,
  }),
}))

import AuthCallbackView from '@/views/AuthCallbackView.vue'

function mountView() {
  return mount(AuthCallbackView, {
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>',
        },
      },
    },
  })
}

describe('AuthCallbackView', () => {
  beforeEach(() => {
    replaceMock.mockReset()
    setAuthMock.mockReset()
  })

  it('processes token callback and redirects teacher to amendments', async () => {
    routeState = {
      query: {
        token: 'token-123',
        user: encodeURIComponent(JSON.stringify({ name: 'Teacher', role: 'teacher' })),
      },
    }

    mountView()
    await nextTick()

    expect(setAuthMock).toHaveBeenCalledWith('token-123', { name: 'Teacher', role: 'teacher' })
    expect(replaceMock).toHaveBeenCalledWith('/amendments')
  })

  it('shows error and does not redirect when callback parsing fails', async () => {
    routeState = {
      query: {
        token: 'token-123',
        user: '%',
      },
    }

    const wrapper = mountView()
    await nextTick()
    expect(wrapper.text()).toContain('Login Failed')
    expect(wrapper.text()).toContain('Failed to process login')
  })

  it('redirects to login when callback has no token', async () => {
    routeState = {
      query: {},
    }

    mountView()
    await nextTick()
    expect(replaceMock).toHaveBeenCalledWith('/login')
  })
})
