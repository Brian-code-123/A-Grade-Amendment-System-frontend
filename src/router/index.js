import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/views/AuthCallbackView.vue')
    },
    {
      path: '/amendments',
      name: 'amendments',
      component: () => import('@/views/AmendmentListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/excel-upload',
      name: 'excel-upload',
      component: () => import('@/views/ExcelUploadView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/submissions',
      name: 'submissions',
      component: () => import('@/views/SubmissionsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/feedback',
      name: 'feedback',
      component: () => import('@/views/FeedbackView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/signature-setup',
      name: 'signature-setup',
      component: () => import('@/views/SignatureSetupView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/pdf-calibration',
      name: 'pdf-calibration',
      component: () => import('@/views/PDFCalibrationView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  // 如果需要認證但沒有token，重定向到登入
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  // 如果需要admin但用戶不是admin，重定向到首頁
  if (to.meta.requiresAdmin && user?.role !== 'admin') {
    next('/')
    return
  }

  // 檢查簽名設定 - 如果用戶已登入但未設定簽名，且不在profile頁面或login頁面，則導向profile
  if (
    token &&
    user &&
    !user.signature &&
    to.name !== 'profile' &&
    to.name !== 'login' &&
    to.name !== 'auth-callback' &&
    to.meta.requiresAuth
  ) {
    next('/profile')
    return
  }

  next()
})

export default router
