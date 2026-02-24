<script setup>
import { onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useNotificationStore } from '@/stores/notificationStore'
import HelpAssistant from '@/components/HelpAssistant.vue'

const router = useRouter()
const auth = useAuthStore()
const themeStore = useThemeStore()
const notif = useNotificationStore()

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
    <nav
      class="navbar navbar-expand-lg sticky-top glass-nav"
      :class="themeStore.theme === 'dark' ? 'navbar-dark' : 'navbar-light'"
    >
      <div class="container">

        <!-- Brand -->
        <router-link class="navbar-brand d-flex align-items-center gap-2" to="/">
          <img src="@/assets/logo.png" alt="HKBU" height="36" />
        </router-link>

        <!-- Mobile toggler -->
        <button
          class="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNav">

          <!-- ── Left nav tabs (only when logged in) ── -->
          <ul class="navbar-nav me-auto gap-1" v-if="auth.isLoggedIn">

            <!-- 1. Home -->
            <li class="nav-item">
              <router-link class="nav-link nav-tab" to="/" exact-active-class="active">
                <i class="bi bi-house-door me-1"></i>Home
              </router-link>
            </li>

            <!-- 2. Amendments (dropdown) -->
            <li class="nav-item dropdown">
              <a
                class="nav-link nav-tab dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                :class="{
                  active:
                    $route.path === '/amendments' ||
                    $route.path === '/submissions' ||
                    $route.path === '/excel-upload'
                }"
              >
                <i class="bi bi-pencil-square me-1"></i>Amendments
              </a>
              <ul class="dropdown-menu dropdown-menu-animated mt-1">
                <li>
                  <router-link class="dropdown-item" to="/amendments" active-class="active">
                    <i class="bi bi-file-earmark-text me-2 text-primary"></i>Amendment Form
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/submissions" active-class="active">
                    <i class="bi bi-send me-2 text-success"></i>Submissions
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/excel-upload" active-class="active">
                    <i class="bi bi-file-earmark-excel me-2 text-info"></i>Excel Upload
                  </router-link>
                </li>
              </ul>
            </li>

            <!-- 3. Feedback -->
            <li class="nav-item">
              <router-link class="nav-link nav-tab" to="/feedback" active-class="active">
                <i class="bi bi-chat-dots me-1"></i>Feedback
              </router-link>
            </li>

            <!-- 4. Admin (admin role only) -->
            <li class="nav-item" v-if="auth.isAdmin">
              <router-link class="nav-link nav-tab" to="/admin" active-class="active">
                <i class="bi bi-shield-lock me-1"></i>Admin
              </router-link>
            </li>

          </ul>

          <!-- ── Right controls ── -->
          <div class="d-flex align-items-center gap-2 ms-auto">

            <!-- Theme toggle -->
            <button
              class="btn btn-icon btn-sm"
              @click="themeStore.toggleTheme"
              :title="themeStore.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            >
              <i class="bi" :class="themeStore.theme === 'dark' ? 'bi-sun' : 'bi-moon'"></i>
            </button>

            <!-- Notifications -->
            <div v-if="auth.isLoggedIn" class="dropdown">
              <button
                class="btn btn-icon btn-sm position-relative"
                data-bs-toggle="dropdown"
                aria-label="Notifications"
              >
                <i class="bi bi-bell"></i>
                <span
                  v-if="notif.unreadCount > 0"
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style="font-size: 0.6rem"
                >
                  {{ notif.unreadCount }}
                </span>
              </button>
              <ul
                class="dropdown-menu dropdown-menu-end dropdown-menu-animated"
                style="width: 320px; max-height: 400px; overflow-y: auto"
              >
                <li class="px-3 py-2 d-flex justify-content-between align-items-center">
                  <strong>Notifications</strong>
                  <button
                    v-if="notif.unreadCount > 0"
                    class="btn btn-sm btn-link p-0 text-decoration-none"
                    @click="notif.markAllRead()"
                  >
                    Mark all read
                  </button>
                </li>
                <li><hr class="dropdown-divider my-1" /></li>
                <li v-if="notif.notifications.length === 0" class="px-3 py-2 text-muted text-center small">
                  No notifications
                </li>
                <li v-for="n in notif.notifications" :key="n._id">
                  <a
                    class="dropdown-item py-2"
                    :class="{ 'fw-bold': !n.read }"
                    href="#"
                    @click.prevent="notif.markAsRead(n._id)"
                  >
                    <div class="fw-semibold small">{{ n.title }}</div>
                    <div class="text-muted small text-wrap">{{ n.message }}</div>
                    <div class="text-muted" style="font-size: 0.7rem">
                      {{ new Date(n.created_at).toLocaleString() }}
                    </div>
                  </a>
                </li>
              </ul>
            </div>

            <!-- User dropdown -->
            <div v-if="auth.isLoggedIn" class="dropdown">
              <button
                class="btn btn-sm btn-primary dropdown-toggle d-flex align-items-center gap-1"
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-person-circle"></i>
                <span class="d-none d-sm-inline">{{ auth.userName }}</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end dropdown-menu-animated">
                <li class="px-3 py-1">
                  <span class="small text-muted text-capitalize">{{ auth.user?.role }}</span>
                </li>
                <li><hr class="dropdown-divider my-1" /></li>
                <li>
                  <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i>Logout
                  </a>
                </li>
              </ul>
            </div>

            <!-- Login button (logged-out state) -->
            <router-link v-if="!auth.isLoggedIn" to="/login" class="btn btn-sm btn-primary">
              <i class="bi bi-box-arrow-in-right me-1"></i>HKBU Login
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

/* ── Glassmorphism navbar ── */
.glass-nav {
  background: rgba(255, 255, 255, 0.82) !important;
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border-bottom: 1px solid rgba(12, 142, 235, 0.12);
  box-shadow: 0 2px 20px rgba(12, 142, 235, 0.07);
}
.navbar-dark.glass-nav {
  background: rgba(10, 22, 40, 0.82) !important;
  border-bottom: 1px solid rgba(0, 180, 216, 0.18);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.35);
}

/* ── Nav tabs ── */
.nav-tab {
  border-radius: 8px;
  padding: 0.45rem 0.9rem;
  font-weight: 500;
  font-size: 1.08rem;
  transition: background 0.18s, color 0.18s;
}
.navbar-light .nav-tab:hover {
  background: rgba(12, 142, 235, 0.08);
  color: #0c8eeb !important;
}
.navbar-light .nav-tab.active {
  background: rgba(12, 142, 235, 0.13);
  color: #0c8eeb !important;
}
.navbar-dark .nav-tab:hover {
  background: rgba(0, 180, 216, 0.13);
  color: #00b4d8 !important;
}
.navbar-dark .nav-tab.active {
  background: rgba(0, 180, 216, 0.18);
  color: #00b4d8 !important;
}

/* ── Icon-only button ── */
.btn-icon {
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  color: inherit;
  transition: background 0.18s, border-color 0.18s;
}
.btn-icon:hover {
  background: rgba(12, 142, 235, 0.1);
  border-color: rgba(12, 142, 235, 0.25);
}
.navbar-dark .btn-icon:hover {
  background: rgba(0, 180, 216, 0.15);
  border-color: rgba(0, 180, 216, 0.3);
}

/* ── Dropdown animation ── */
.dropdown-menu-animated {
  animation: fadeSlideDown 0.18s ease;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
@keyframes fadeSlideDown {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.dropdown-item {
  border-radius: 6px;
  margin: 2px 4px;
  width: calc(100% - 8px);
  transition: background 0.15s;
}
</style>
