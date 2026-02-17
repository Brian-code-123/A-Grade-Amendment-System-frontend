import { createRouter, createWebHistory } from 'vue-router'
<<<<<<< HEAD
import HomeView from '../views/HomeView.vue'
=======
import HomeView from '@/views/HomeView.vue'
import AmendmentsView from '@/views/AmendmentsView.vue'
>>>>>>> 790780857e7104a65d2fff80315a2a9ab205cfed

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
<<<<<<< HEAD


{
    path: '/login',
    name: 'login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/LoginView.vue')
},

  ]
})


=======
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
>>>>>>> 790780857e7104a65d2fff80315a2a9ab205cfed

export default router
