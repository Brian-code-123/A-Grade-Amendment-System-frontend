import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AmendmentsView from '@/views/AmendmentsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Home - Grade Amendment System'
      }
    },
    {
      path: '/amendments',
      name: 'amendments',
      component: AmendmentsView,
      meta: {
        title: 'Amendments - Grade Amendment System'
      }
    }
  ]
})

// Update page title
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Grade Amendment System'
  next()
})

export default router
