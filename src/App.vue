<script setup>
import { onMounted, computed, ref } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useNotificationStore } from '@/stores/notificationStore'
import HelpAssistant from '@/components/HelpAssistant.vue'

const router = useRouter()
const route = useRoute()
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

const isAuthRoute = computed(() =>
  ['/login', '/demo-login', '/demo-verify', '/auth/callback', '/auth-callback'].includes(route.path)
)

const userInitials = computed(() => {
  const name = auth.user?.name || auth.userName || ''
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'
})

const userRoleLabel = computed(() => {
  const role = auth.user?.role
  if (!role) return ''
  if (role === 'Programme Director') return 'Teacher'
  if (role === 'Head') return 'Programme Director'
  if (role === 'admin') return 'Admin'
  return role
})

// Local dropdown open state to ensure dropdowns work even if Bootstrap JS
// dropdown behaviour isn't available in some dev environments.
const amendmentsOpen = ref(false)

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-wrapper">
    <nav
      v-if="!isAuthRoute"
      class="navbar navbar-expand-lg sticky-top app-nav"
      :class="themeStore.theme === 'dark' ? 'navbar-dark' : 'navbar-light'"
    >
      <div class="container">

        <!-- Brand -->
        <router-link class="navbar-brand d-flex align-items-center gap-2" to="/">
          <img src="@/assets/logo.png" alt="HKBU Logo" class="nav-logo" />
          <span class="nav-divider"></span>
          <span class="nav-brand-text">Grade Amendment System</span>
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

            <!-- 2. Amendments (dropdown) — hidden for Programme Director (Head) and Admin -->
            <li class="nav-item dropdown" v-if="!auth.isHead && !auth.isAdmin" :class="{ show: amendmentsOpen }">
              <button
                class="nav-link nav-tab dropdown-toggle btn btn-link"
                type="button"
                @click.prevent="amendmentsOpen = !amendmentsOpen"
                aria-expanded="false"
                :class="{
                  active:
                    $route.path === '/amendments' ||
                    $route.path === '/submissions' ||
                    $route.path === '/excel-upload'
                }"
              >
                <i class="bi bi-pencil-square me-1"></i>Amendments
              </button>
              <ul class="dropdown-menu dropdown-menu-animated mt-1" :class="{ show: amendmentsOpen }">
                <li>
                  <router-link class="dropdown-item" to="/amendments" active-class="active" @click="amendmentsOpen = false">
                    <i class="bi bi-file-earmark-text me-2 text-primary"></i>Amendment Form
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/submissions" active-class="active" @click="amendmentsOpen = false">
                    <i class="bi bi-send me-2 text-success"></i>Submissions
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/excel-upload" active-class="active" @click="amendmentsOpen = false">
                    <i class="bi bi-file-earmark-excel me-2 text-info"></i>Excel Upload
                  </router-link>
                </li>
              </ul>
            </li>

            <!-- 3. PDF Editor (hidden for admin) -->
            <li class="nav-item" v-if="!auth.isAdmin">
              <router-link class="nav-link nav-tab" to="/pdf-editor" active-class="active">
                <i class="bi bi-pencil-square me-1"></i>PDF Editor
              </router-link>
            </li>

            <!-- 4. Approvals (Programme Director / Head role only) -->
            <li class="nav-item" v-if="auth.isHead">
              <router-link class="nav-link nav-tab" to="/pd-approvals" active-class="active">
                <i class="bi bi-check2-circle me-1"></i>Approvals
              </router-link>
            </li>

            <!-- 5. Admin (admin role only) -->
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
                class="btn user-btn dropdown-toggle d-flex align-items-center gap-2"
                data-bs-toggle="dropdown"
              >
                <span class="user-avatar">{{ userInitials }}</span>
                <span class="d-none d-md-inline user-name">{{ auth.userName }}</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end dropdown-menu-animated">
                <li class="px-3 py-1">
                  <span class="small text-muted">{{ userRoleLabel }}</span>
                </li>
                <li><hr class="dropdown-divider my-1" /></li>
                <li>
                  <router-link class="dropdown-item" to="/profile">
                    <i class="bi bi-person-circle me-2"></i>Profile
                  </router-link>
                </li>
                <li v-if="auth.isDemoUser">
                  <a class="dropdown-item" href="#" @click.prevent="auth.switchRole()">
                    <i class="bi bi-arrow-left-right me-2 text-warning"></i>
                    Switch to {{ auth.user?.role === 'admin' ? 'Teacher' : auth.user?.role === 'Head' ? 'Teacher' : 'Admin' }}
                  </a>
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
            <router-link v-if="!auth.isLoggedIn" to="/login" class="btn nav-login-btn">
              <i class="bi bi-box-arrow-in-right me-1"></i>Sign In
            </router-link>

          </div>
        </div>
      </div>
    </nav>

    <main class="flex-grow-1">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer v-if="route.path !== '/' && !isAuthRoute" class="text-center py-2 border-top">
      <small class="text-muted opacity-60">&copy; 2026 HKBU Academic Registry</small>
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

/* ── Page transitions ── */
.page-enter-active { animation: pageIn 0.22s cubic-bezier(.4,0,.2,1); }
.page-leave-active { animation: pageOut 0.18s cubic-bezier(.4,0,.2,1) forwards; }
@keyframes pageIn  { from { opacity:0; transform:translateY(8px);  } to { opacity:1; transform:translateY(0); } }
@keyframes pageOut { to   { opacity:0; transform:translateY(-6px); } }

/* ═══════════════════════════════════════
   APP NAVBAR — Professional academic bar
   ═══════════════════════════════════════ */
.app-nav {
  height: 56px;
  background: #ffffff !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  z-index: 1000;
}
.navbar-dark.app-nav {
  background: #101826 !important;
  border-bottom: 1px solid rgba(122,154,184,0.08);
  box-shadow: 0 1px 12px rgba(0,0,0,0.28);
}

/* Brand */
.navbar-brand {
  padding: 0;
  margin-right: 1.5rem;
  flex-shrink: 0;
}
.nav-logo {
  height: 30px;
  width: auto;
  max-width: 140px;
  object-fit: contain;
  display: block;
}
.nav-divider {
  display: inline-block;
  width: 1px;
  height: 20px;
  background: rgba(0,0,0,0.15);
  vertical-align: middle;
  flex-shrink: 0;
}
.navbar-dark .nav-divider { background: rgba(148,168,184,0.18); }
.nav-brand-text {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1a2d3d;
  letter-spacing: 0.01em;
  line-height: 1.2;
  white-space: nowrap;
}
.navbar-dark .nav-brand-text { color: #c7d2db; }

/* ── Nav tabs — underline indicator style ── */
.nav-tab {
  position: relative;
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 14px;
  font-size: 0.935rem;
  font-weight: 500;
  color: #5a6a7a;
  border-radius: 0;
  white-space: nowrap;
  transition: color 0.18s;
  text-decoration: none;
}
.nav-tab::after {
  content: '';
  position: absolute;
  bottom: 0; left: 10px; right: 10px;
  height: 2.5px;
  background: #0c8eeb;
  border-radius: 2px 2px 0 0;
  transform: scaleX(0);
  transition: transform 0.2s cubic-bezier(.4,0,.2,1);
}
.nav-tab:hover { color: #0c8eeb; }
.nav-tab:hover::after { transform: scaleX(0.6); opacity: 0.5; }
.nav-tab.active { color: #0c8eeb !important; font-weight: 600; }
.nav-tab.active::after { transform: scaleX(1) !important; opacity: 1 !important; }

/* Dropdown toggle (extends nav-tab) */
.nav-tab.dropdown-toggle.btn {
  background: transparent;
  box-shadow: none;
  border: none;
}
.navbar-dark .nav-tab { color: #94a8b8; }
.navbar-dark .nav-tab:hover,
.navbar-dark .nav-tab.active { color: #b2c5d2 !important; }
.navbar-dark .nav-tab::after { background: #8aa7bb; }

/* ── Icon-only button ── */
.btn-icon {
  width: 34px; height: 34px;
  padding: 0;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  color: inherit;
  transition: background 0.18s, border-color 0.18s;
}
.btn-icon:hover {
  background: rgba(12, 142, 235, 0.08);
  border-color: rgba(12, 142, 235, 0.2);
  color: #0c8eeb;
}
.navbar-dark .btn-icon:hover {
  background: rgba(0, 180, 216, 0.14);
  border-color: rgba(0, 180, 216, 0.28);
  color: #00b4d8;
}

/* ── User avatar button ── */
.user-btn {
  display: flex;
  align-items: center;
  background: transparent;
  border: 1.5px solid rgba(12,142,235,0.25);
  border-radius: 40px;
  padding: 3px 10px 3px 3px;
  transition: all 0.18s;
  gap: 6px;
  box-shadow: none;
}
.user-btn:hover {
  border-color: var(--sky-500);
  background: rgba(12,142,235,0.05);
}
.navbar-dark .user-btn { border-color: rgba(122,154,184,0.24); }
.navbar-dark .user-btn:hover { border-color: #8aa7bb; background: rgba(126,162,189,0.08); }
.user-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0c8eeb, #36a9fa);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}
.navbar-dark .user-avatar { background: linear-gradient(135deg, #7a9cb6, #617d93); }
.user-name {
  font-size: 0.912rem;
  font-weight: 500;
  color: #1a2d3d;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.navbar-dark .user-name { color: #c7d2db; }

/* ── Login button ── */
.nav-login-btn {
  padding: 0.38rem 1rem;
  font-size: 0.923rem;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #0c8eeb, #36a9fa);
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(12,142,235,0.28);
  transition: all 0.18s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.nav-login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(12,142,235,0.38);
  color: #fff;
}
.navbar-dark .nav-login-btn { background: linear-gradient(135deg, #7a9cb6, #617d93); box-shadow: 0 2px 8px rgba(97,125,147,0.26); }

/* ── Dropdown animation ── */
.dropdown-menu-animated {
  animation: fadeSlideDown 0.16s ease;
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
[data-bs-theme="dark"] .dropdown-menu-animated {
  box-shadow: 0 8px 28px rgba(0,0,0,0.34);
  border-color: rgba(122,154,184,0.08);
}
@keyframes fadeSlideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.dropdown-item {
  border-radius: 6px;
  margin: 2px 4px;
  width: calc(100% - 8px);
  font-size: 0.945rem;
  transition: background 0.15s;
}
</style>
