import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/demo-login',
      name: 'demo-login',
      component: () => import('@/views/DemoLoginView.vue')
    },
    {
      path: '/demo-verify',
      name: 'demo-verify',
      component: () => import('@/views/DemoVerifyView.vue')
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
      meta: { requiresAuth: true, blockedForAdmin: true }
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
      path: '/pdf-editor',
      name: 'pdf-editor',
      component: () => import('@/views/PDFEditorView.vue'),
      meta: { requiresAuth: true, blockedForAdmin: true }
    },
    {
      path: '/signature-setup',
      name: 'signature-setup',
      component: () => import('@/views/SignatureSetupView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/pd-approvals',
      name: 'pd-approvals',
      component: () => import('@/views/PDApprovalView.vue'),
      meta: { requiresAuth: true, requiresReviewer: true }
    },
    {
      path: '/admin/archive',
      name: 'admin-archive',
      component: () => import('@/views/ArchiveView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  // If authentication is required but no token exists, redirect to login
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  // If admin role is required but user is not admin, redirect to home page
  if (to.meta.requiresAdmin && user?.role !== 'admin') {
    next('/')
    return
  }

  // Admin users cannot access PDF Editor
  if (to.meta.blockedForAdmin && user?.role === 'admin') {
    next('/')
    return
  }

  // If reviewer role is required but user is not Programme Director/Head, redirect to home page
  if (to.meta.requiresReviewer && user?.role !== 'Head' && user?.role !== 'Programme Director') {
    next('/')
    return
  }

  // Admin role should not access signature setup page
  if (to.name === 'signature-setup' && user?.role === 'admin') {
    next('/profile')
    return
  }

  // Check signature setup - if user is logged in but hasn't set up signature,
  // and not on profile or login page, redirect to profile page
  // Demo users (demo_token_) skip signature check
  if (
    token &&
    !token.startsWith('demo_token_') &&
    user &&
    user.role !== 'admin' &&
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
