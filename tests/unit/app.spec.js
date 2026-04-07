import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const pushMock = vi.fn()
const initThemeMock = vi.fn()
const toggleThemeMock = vi.fn()
const logoutMock = vi.fn()
const fetchMeMock = vi.fn()
const fetchNotificationsMock = vi.fn()
const fetchUnreadCountMock = vi.fn()
const markAsReadMock = vi.fn()
const markAllReadMock = vi.fn()

let authState
let notifState
let routeState

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
  useRoute: () => routeState,
  RouterView: { template: '<div />' },
}))

vi.mock('@/components/HelpAssistant.vue', () => ({
  default: { template: '<div class="help-assistant-stub" />' },
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => authState,
}))

vi.mock('@/stores/themeStore', () => ({
  useThemeStore: () => ({
    theme: 'light',
    initTheme: initThemeMock,
    toggleTheme: toggleThemeMock,
  }),
}))

vi.mock('@/stores/notificationStore', () => ({
  useNotificationStore: () => notifState,
}))

import App from '@/App.vue'

describe('App', () => {
  beforeEach(() => {
    pushMock.mockReset()
    initThemeMock.mockReset()
    toggleThemeMock.mockReset()
    logoutMock.mockReset()
    fetchMeMock.mockReset()
    fetchNotificationsMock.mockReset()
    fetchUnreadCountMock.mockReset()
    markAsReadMock.mockReset()
    markAllReadMock.mockReset()

    routeState = { path: '/amendments' }

    authState = {
      isLoggedIn: true,
      user: { name: 'Teacher Demo', role: 'teacher' },
      userName: 'Teacher Demo',
      isHead: false,
      isPD: false,
      isAdmin: false,
      isDemoUser: false,
      fetchMe: fetchMeMock,
      logout: logoutMock,
      switchRole: vi.fn(),
    }

    notifState = {
      unreadCount: 1,
      notifications: [
        {
          _id: 'n1',
          title: 'Approval required',
          message: 'Please review.',
          created_at: new Date().toISOString(),
          action_path: '/submissions',
          read: false,
        },
      ],
      fetchNotifications: fetchNotificationsMock,
      fetchUnreadCount: fetchUnreadCountMock,
      markAsRead: markAsReadMock,
      markAllRead: markAllReadMock,
    }
  })

  it('initializes app stores and handles notification open + logout', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
          transition: false,
        },
        mocks: {
          $route: { path: '/amendments' },
        },
      },
    })

    expect(initThemeMock).toHaveBeenCalled()
    expect(fetchMeMock).toHaveBeenCalled()
    expect(fetchNotificationsMock).toHaveBeenCalled()
    expect(fetchUnreadCountMock).toHaveBeenCalled()

    const notifItem = wrapper.find('a.dropdown-item.py-2')
    await notifItem.trigger('click')
    expect(markAsReadMock).toHaveBeenCalledWith('n1')
    expect(pushMock).toHaveBeenCalledWith('/submissions')

    const logoutLink = wrapper.find('a.dropdown-item.text-danger')
    await logoutLink.trigger('click')
    expect(logoutMock).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/login')
  })

  it('shows sign in entry for logged-out user', () => {
    authState.isLoggedIn = false
    authState.user = null

    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
          transition: false,
        },
        mocks: {
          $route: { path: '/login' },
        },
      },
    })

    expect(wrapper.text()).toContain('Sign In')
  })
})
