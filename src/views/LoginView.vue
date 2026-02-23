<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { getMsalInstance, loginRequest } from '@/auth/msalConfig'

const auth = useAuthStore()
const router = useRouter()

if (auth.isLoggedIn) router.replace('/')

const tab = ref('login')
const loading = ref(false)
const error = ref('')
const msalReady = ref(false)

const loginForm = ref({ email: '', password: '' })
const regForm = ref({ name: '', email: '', password: '', confirm: '', role: 'Programme Director' })

let msalInstance = null

onMounted(async () => {
  try {
    msalInstance = getMsalInstance()
    await msalInstance.initialize()
    msalReady.value = true
  } catch (e) {
    console.warn('MSAL init skipped:', e.message)
  }
})

async function loginWithHKBU() {
  error.value = ''
  if (!msalReady.value || !msalInstance) {
    error.value = 'Azure AD is not configured. Please set VITE_AZURE_CLIENT_ID in .env or use Demo Access.'
    return
  }
  loading.value = true
  try {
    const response = await msalInstance.loginPopup(loginRequest)
    const account = response.account
    const tokenResponse = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account
    })
    const msalUser = {
      email: account.username,
      name: account.name || account.username,
      role: 'admin'
    }
    auth.setAuth(tokenResponse.accessToken, msalUser)
    router.push('/')
  } catch (e) {
    if (e.errorCode === 'user_cancelled') {
      error.value = ''
    } else {
      error.value = 'HKBU login failed: ' + (e.errorMessage || e.message)
    }
  } finally {
    loading.value = false
  }
}

function demoLogin() {
  const demoToken = 'demo_token_' + Date.now()
  const demoUser = {
    email: '22240802@life.hkbu.edu.hk',
    name: 'Admin User',
    role: 'admin'
  }
  auth.setAuth(demoToken, demoUser)
  router.push('/')
}

async function handleLogin() {
  error.value = ''
  if (!loginForm.value.email || !loginForm.value.password) {
    error.value = 'Please enter your email and password.'
    return
  }
  loading.value = true
  try {
    await auth.login(loginForm.value.email, loginForm.value.password)
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  error.value = ''
  if (!regForm.value.name || !regForm.value.email || !regForm.value.password) {
    error.value = 'Please fill in all fields.'
    return
  }
  if (regForm.value.password !== regForm.value.confirm) {
    error.value = 'Passwords do not match.'
    return
  }
  if (regForm.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters.'
    return
  }
  loading.value = true
  try {
    await auth.register(regForm.value.name, regForm.value.email, regForm.value.password, regForm.value.role)
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-bg">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-5 col-lg-4">

          <!-- Logo + title -->
          <div class="text-center mb-4">
            <div class="logo-pill d-inline-block mb-3">
              <img src="@/assets/logo.png" alt="HKBU" class="login-logo" style="height:52px" />
            </div>
            <h5 class="fw-bold mb-0">Grade Amendment System</h5>
            <small class="text-muted">Hong Kong Baptist University</small>
          </div>

          <!-- Glass card -->
          <div class="glass-card">

            <!-- HKBU SSO button -->
            <button class="btn-hkbu-sso w-100 mb-2" @click="loginWithHKBU">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 23 23" fill="currentColor" class="me-2">
                <path d="M0 0h11v11H0zM12 0h11v11H12zM0 12h11v11H0zM12 12h11v11H12z"/>
              </svg>
              Sign in with HKBU Account
            </button>

            <!-- Demo quick login -->
            <button class="btn-demo w-100 mb-4" @click="demoLogin">
              <i class="bi bi-lightning-charge me-2"></i>
              Quick Demo Access
            </button>

            <!-- divider -->
            <div class="divider-text mb-4">
              <span>or use email</span>
            </div>

            <!-- Tabs -->
            <div class="glass-tabs mb-4">
              <button :class="['glass-tab', tab === 'login' ? 'active' : '']" @click="tab = 'login'">Sign In</button>
              <button :class="['glass-tab', tab === 'register' ? 'active' : '']" @click="tab = 'register'">Register</button>
            </div>

            <!-- Error -->
            <div v-if="error" class="alert alert-danger py-2 small mb-3">{{ error }}</div>

            <!-- Login form -->
            <form v-if="tab === 'login'" @submit.prevent="handleLogin">
              <div class="mb-3">
                <label class="form-label small fw-semibold">Email</label>
                <input v-model="loginForm.email" type="email" class="glass-input" placeholder="you@hkbu.edu.hk" required />
              </div>
              <div class="mb-4">
                <label class="form-label small fw-semibold">Password</label>
                <input v-model="loginForm.password" type="password" class="glass-input" placeholder="••••••••" required />
              </div>
              <button type="submit" class="btn-primary-glass w-100" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Sign In
              </button>
            </form>

            <!-- Register form -->
            <form v-if="tab === 'register'" @submit.prevent="handleRegister">
              <div class="mb-3">
                <label class="form-label small fw-semibold">Full Name</label>
                <input v-model="regForm.name" type="text" class="glass-input" placeholder="Your name" required />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Email</label>
                <input v-model="regForm.email" type="email" class="glass-input" placeholder="you@hkbu.edu.hk" required />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Role</label>
                <select v-model="regForm.role" class="glass-input">
                  <option>Programme Director</option>
                  <option>admin</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Password</label>
                <input v-model="regForm.password" type="password" class="glass-input" placeholder="Min. 6 characters" required />
              </div>
              <div class="mb-4">
                <label class="form-label small fw-semibold">Confirm Password</label>
                <input v-model="regForm.confirm" type="password" class="glass-input" placeholder="Repeat password" required />
              </div>
              <button type="submit" class="btn-primary-glass w-100" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Create Account
              </button>
            </form>

          </div><!-- /glass-card -->

          <div class="text-center mt-3">
            <small class="text-muted opacity-75">Secured by Microsoft Azure AD</small>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page background */
.login-bg {
  min-height: 100vh;
  background: radial-gradient(ellipse at 20% 50%, rgba(12,142,235,0.12) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 10%, rgba(54,169,250,0.10) 0%, transparent 50%);
}

[data-bs-theme="dark"] .login-bg {
  background: radial-gradient(ellipse at 20% 50%, rgba(0,180,216,0.12) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 10%, rgba(0,144,184,0.10) 0%, transparent 50%);
}

/* Logo pill */
.logo-pill {
  background: rgba(255,255,255,0.9);
  border-radius: 12px;
  padding: 8px 20px;
  box-shadow: 0 2px 16px rgba(12,142,235,0.12);
}

[data-bs-theme="dark"] .logo-pill {
  background: rgba(255,255,255,0.88);
  box-shadow: 0 0 20px rgba(0,180,216,0.25);
}

/* Glass card */
.glass-card {
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(24px) saturate(1.8);
  -webkit-backdrop-filter: blur(24px) saturate(1.8);
  border: 1px solid rgba(255,255,255,0.55);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 40px rgba(12,142,235,0.10), 0 1px 0 rgba(255,255,255,0.6) inset;
}

[data-bs-theme="dark"] .glass-card {
  background: rgba(13,31,60,0.65);
  backdrop-filter: blur(24px) saturate(1.6);
  -webkit-backdrop-filter: blur(24px) saturate(1.6);
  border: 1px solid rgba(0,180,216,0.18);
  box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(0,180,216,0.1) inset;
}

/* HKBU SSO button */
.btn-hkbu-sso {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1.25rem;
  background: linear-gradient(135deg, #0c8eeb, #36a9fa);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 16px rgba(12,142,235,0.35);
}

.btn-hkbu-sso:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 22px rgba(12,142,235,0.45);
}

[data-bs-theme="dark"] .btn-hkbu-sso {
  background: linear-gradient(135deg, #00b4d8, #0090b8);
  box-shadow: 0 4px 16px rgba(0,180,216,0.35);
}

/* Demo button */
.btn-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 1.25rem;
  background: linear-gradient(135deg, rgba(12,142,235,0.15), rgba(54,169,250,0.12));
  border: 2px solid rgba(12,142,235,0.35);
  color: #0070c9;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-demo:hover {
  background: linear-gradient(135deg, rgba(12,142,235,0.25), rgba(54,169,250,0.22));
  border-color: rgba(12,142,235,0.5);
  transform: translateY(-1px);
}

[data-bs-theme="dark"] .btn-demo {
  border-color: rgba(0,180,216,0.3);
  color: #00d6ff;
  background: linear-gradient(135deg, rgba(0,180,216,0.12), rgba(0,144,184,0.10));
}

[data-bs-theme="dark"] .btn-demo:hover {
  background: linear-gradient(135deg, rgba(0,180,216,0.22), rgba(0,144,184,0.18));
  border-color: rgba(0,180,216,0.5);
}

/* Divider */
.divider-text {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(100,130,160,0.7);
  font-size: 0.78rem;
}
.divider-text::before,
.divider-text::after {
  content: '';
  flex: 1;
  height: 1px;
  background: currentColor;
  opacity: 0.4;
}

/* Tabs */
.glass-tabs {
  display: flex;
  background: rgba(0,0,0,0.05);
  border-radius: 10px;
  padding: 4px;
  gap: 2px;
}

[data-bs-theme="dark"] .glass-tabs {
  background: rgba(255,255,255,0.06);
}

.glass-tab {
  flex: 1;
  padding: 0.45rem 0;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 500;
  color: #6c757d;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.glass-tab.active {
  background: rgba(255,255,255,0.9);
  color: #0c8eeb;
  font-weight: 600;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
}

[data-bs-theme="dark"] .glass-tab.active {
  background: rgba(0,180,216,0.18);
  color: #00b4d8;
}

/* Glass inputs */
.glass-input {
  width: 100%;
  padding: 0.6rem 0.9rem;
  background: rgba(255,255,255,0.6);
  border: 1px solid rgba(12,142,235,0.18);
  border-radius: 10px;
  font-size: 0.9rem;
  color: #2c3e50;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  backdrop-filter: blur(8px);
}

.glass-input:focus {
  border-color: #0c8eeb;
  box-shadow: 0 0 0 3px rgba(12,142,235,0.12);
  background: rgba(255,255,255,0.85);
}

[data-bs-theme="dark"] .glass-input {
  background: rgba(10,22,40,0.6);
  border-color: rgba(0,180,216,0.22);
  color: #cce8f4;
}

[data-bs-theme="dark"] .glass-input:focus {
  border-color: #00b4d8;
  box-shadow: 0 0 0 3px rgba(0,180,216,0.18);
  background: rgba(10,22,40,0.8);
}

.glass-input::placeholder {
  color: rgba(100,130,160,0.5);
}

/* Primary button */
.btn-primary-glass {
  padding: 0.65rem 1.25rem;
  background: linear-gradient(135deg, #0c8eeb, #36a9fa);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  box-shadow: 0 4px 14px rgba(12,142,235,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary-glass:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(12,142,235,0.4);
}

.btn-primary-glass:disabled {
  opacity: 0.65;
}

[data-bs-theme="dark"] .btn-primary-glass {
  background: linear-gradient(135deg, #00b4d8, #0090b8);
  box-shadow: 0 4px 14px rgba(0,180,216,0.3);
}
</style>
