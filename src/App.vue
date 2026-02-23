<script setup>
import { onMounted, computed } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useNotificationStore } from '@/stores/notificationStore'
import HelpAssistant from '@/components/HelpAssistant.vue'

const router = useRouter()
const auth = useAuthStore()
const themeStore = useThemeStore()
const notif = useNotificationStore()

const navLinks = computed(() => {
  if (!auth.isLoggedIn) return []
  const links = [
    { to: '/amendments', label: 'Amendments', icon: 'bi-pencil-square' },
    { to: '/submissions', label: 'Submissions', icon: 'bi-send' }
  ]
  if (auth.isAdmin) {
    links.push({ to: '/admin', label: 'Admin', icon: 'bi-shield-lock' })
  }
  return links
})

onMounted(() => {
  themeStore.initTheme()
  if (auth.isLoggedIn) {
    auth.fetchMe()
    notif.fetchNotifications()
    notif.fetchUnreadCount()
  }
})

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-wrapper">
    <nav class="navbar navbar-expand-lg sticky-top glass-nav" :class="themeStore.theme === 'dark' ? 'navbar-dark' : 'navbar-light'">
      <div class="container">
        <router-link class="navbar-brand d-flex align-items-center" to="/">
          <img src="@/assets/logo.png" alt="HKBU" height="36" class="me-2" />
        </router-link>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item" v-for="link in navLinks" :key="link.to">
              <router-link class="nav-link" :to="link.to" active-class="active">
                <i class="bi" :class="link.icon"></i> {{ link.label }}
              </router-link>
            </li>
          </ul>

          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-secondary" @click="themeStore.toggleTheme" :title="themeStore.theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'">
              <i class="bi" :class="themeStore.theme === 'dark' ? 'bi-sun' : 'bi-moon'"></i>
            </button>

            <div v-if="auth.isLoggedIn" class="dropdown">
              <button class="btn btn-sm btn-outline-secondary position-relative" data-bs-toggle="dropdown">
                <i class="bi bi-bell"></i>
                <span v-if="notif.unreadCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size:0.6rem">
                  {{ notif.unreadCount }}
                </span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end" style="width:320px;max-height:400px;overflow-y:auto">
                <li class="dropdown-header d-flex justify-content-between align-items-center">
                  <strong>Notifications</strong>
                  <button class="btn btn-sm btn-link p-0" @click="notif.markAllRead()" v-if="notif.unreadCount > 0">Mark all read</button>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li v-if="notif.notifications.length === 0" class="px-3 py-2 text-muted text-center">No notifications</li>
                <li v-for="n in notif.notifications" :key="n._id">
                  <a class="dropdown-item py-2" :class="{ 'fw-bold': !n.read }" href="#" @click.prevent="notif.markAsRead(n._id)">
                    <div class="fw-semibold small">{{ n.title }}</div>
                    <div class="text-muted small text-wrap">{{ n.message }}</div>
                    <div class="text-muted" style="font-size:0.7rem">{{ new Date(n.created_at).toLocaleString() }}</div>
                  </a>
                </li>
              </ul>
            </div>

            <div v-if="auth.isLoggedIn" class="dropdown">
              <button class="btn btn-sm btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle"></i> {{ auth.userName }}
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><span class="dropdown-item-text small text-muted">{{ auth.user?.role }}</span></li>
                <li><hr class="dropdown-divider"></li>
                <li><router-link class="dropdown-item" to="/excel-upload"><i class="bi bi-file-earmark-excel"></i> Excel Upload</router-link></li>
                <li><router-link class="dropdown-item" to="/feedback"><i class="bi bi-chat-dots"></i> Feedback</router-link></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" @click.prevent="handleLogout"><i class="bi bi-box-arrow-right"></i> Logout</a></li>
              </ul>
            </div>

            <router-link v-if="!auth.isLoggedIn" to="/login" class="btn btn-sm btn-primary">
              <i class="bi bi-box-arrow-in-right"></i> HKBU Login
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="flex-grow-1">
      <RouterView />
    </main>

    <footer class="text-center py-3 border-top mt-4">
      <small class="text-muted">&copy; 2026 HKBU Grade Amendment System</small>
    </footer>

    <HelpAssistant />
  </div>
</template>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Glassmorphism navbar */
.glass-nav {
  background: rgba(255,255,255,0.75) !important;
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border-bottom: 1px solid rgba(12,142,235,0.12);
  box-shadow: 0 2px 20px rgba(12,142,235,0.07);
}

.navbar-dark.glass-nav {
  background: rgba(10,22,40,0.72) !important;
  border-bottom: 1px solid rgba(0,180,216,0.18);
  box-shadow: 0 2px 20px rgba(0,0,0,0.35);
}
</style>
