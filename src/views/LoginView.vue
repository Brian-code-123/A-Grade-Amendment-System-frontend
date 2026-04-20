<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/utils/api'

const auth = useAuthStore()
const router = useRouter()

if (auth.isLoggedIn) router.replace(auth.resolveLandingRoute())

const tab = ref('login')
const loading = ref(false)
const error = ref('')

const loginForm = ref({ email: '', password: '', verificationCode: '' })
const regForm = ref({ name: '', email: '', password: '', confirm: '', role: 'Programme Director' })
const codeSent = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)

function demoLogin() {
  // 跳转到演示登录页面
  router.push('/demo-login')
}

async function sendVerificationCode() {
  error.value = ''
  if (!loginForm.value.email || !loginForm.value.password) {
    error.value = 'Please enter your email and password first.'
    return
  }
  
  sendingCode.value = true
  try {
    const res = await apiFetch('/api/auth/send-verification-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: loginForm.value.email, 
        password: loginForm.value.password 
      })
    })
    const contentType = (res.headers.get('content-type') || '').toLowerCase()
    const text = await res.text()

    if (!contentType.includes('application/json')) {
      const hostHint = window.location?.hostname?.endsWith('azurestaticapps.net')
        ? ' Set VITE_API_BASE_URL to your backend App Service URL and redeploy.'
        : ''
      throw new Error(`Verification API returned a non-JSON response.${hostHint}`)
    }

    let data = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      throw new Error('Verification API returned invalid JSON response.')
    }
    
    // Check for service unavailable (Azure not configured)
    if (res.status === 503) {
      const msg = data.instructions 
        ? `Email service not configured.\n${data.instructions}`
        : 'Email service is temporarily unavailable. Please contact IT support.'
      throw new Error(msg)
    }

    if (res.status === 429) {
      const wait = Number(data.retryAfterSeconds || 60)
      throw new Error(`Please wait ${wait} seconds before requesting another verification code.`)
    }
    
    if (!res.ok) throw new Error(data.message || 'Failed to send verification code')
    if (data?.simulated) {
      throw new Error('Verification email is in fallback mode. Check Azure email configuration and retry.')
    }
    
    codeSent.value = true
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (e) {
    error.value = e.message
  } finally {
    sendingCode.value = false
  }
}

function demoLoginPD() {
  const demoToken = 'demo_token_pd_' + Date.now()
  const demoUser = {
    email: 'martin.choy@hkbu.edu.hk',
    name: 'Dr. Martin Choy',
    role: 'Programme Director'
  }
  auth.setAuth(demoToken, demoUser)
  router.replace(auth.resolveLandingRoute(demoUser))
}

function demoLoginHead() {
  const demoToken = 'demo_token_head_' + Date.now()
  const demoUser = {
    email: 'head.dept@hkbu.edu.hk',
    name: 'Prof. David Wong',
    role: 'Head'
  }
  auth.setAuth(demoToken, demoUser)
  router.replace(auth.resolveLandingRoute(demoUser))
}

async function handleLogin() {
  error.value = ''
  if (!loginForm.value.email || !loginForm.value.password) {
    error.value = 'Please enter your email and password.'
    return
  }
  if (!loginForm.value.verificationCode) {
    error.value = 'Please enter the verification code sent to your email.'
    return
  }
  loading.value = true
  try {
    await auth.loginWithCode(
      loginForm.value.email, 
      loginForm.value.password, 
      loginForm.value.verificationCode
    )
    router.replace(auth.resolveLandingRoute())
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.value.email)) {
    error.value = 'Please enter a valid email address.'
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
    router.replace(auth.resolveLandingRoute())
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="lp-root">

    <!-- ═══════════════ LEFT PANEL ═══════════════ -->
    <aside class="lp-left">
      <!-- Decorative floating rings -->
      <div class="lp-ring lp-ring-1"></div>
      <div class="lp-ring lp-ring-2"></div>
      <div class="lp-ring lp-ring-3"></div>

      <div class="lp-left-content anim-in">
        <img src="@/assets/logo.png" alt="HKBU Logo" class="lp-logo floating" />
        <h1 class="lp-title">Grade Amendment<br>System</h1>
        <p class="lp-sub">Academic Registry · Hong Kong Baptist University</p>
        <div class="lp-rule"></div>
        <blockquote class="lp-verse">
          <p>Rejoice always, pray continually, give thanks in all circumstances.</p>
          <cite>— 1 Thessalonians 5:16–18</cite>
        </blockquote>
        <p class="lp-footer-text">© 2026 HKBU · Academic Registry</p>
      </div>
    </aside>

    <!-- ═══════════════ RIGHT PANEL ═══════════════ -->
    <main class="lp-right">
      <div class="lp-form-wrap">

        <!-- Header -->
        <div class="lp-form-header anim-in">
          <h2>Welcome back</h2>
          <p>Sign in to manage grade amendments</p>
        </div>

        <!-- Demo Access -->
        <div class="lp-demo-section anim-in-d1">
          <p class="lp-section-label">Quick demo access</p>
          <div class="lp-demo-grid">
            <button class="lp-demo-btn lp-demo-admin" @click="demoLogin">
              <span class="lp-demo-icon"><i class="bi bi-shield-fill"></i></span>
              <span class="lp-demo-text">
                <strong>Administrator</strong>
                <small>Full system access &amp; reports</small>
              </span>
              <i class="bi bi-arrow-right lp-demo-arrow"></i>
            </button>
            <button class="lp-demo-btn lp-demo-pd" @click="demoLoginPD">
              <span class="lp-demo-icon"><i class="bi bi-person-badge-fill"></i></span>
              <span class="lp-demo-text">
                <strong>Teacher</strong>
                <small>Submit &amp; track amendments</small>
              </span>
              <i class="bi bi-arrow-right lp-demo-arrow"></i>
            </button>
            <button class="lp-demo-btn lp-demo-head" @click="demoLoginHead">
              <span class="lp-demo-icon"><i class="bi bi-person-check-fill"></i></span>
              <span class="lp-demo-text">
                <strong>Programme Director</strong>
                <small>Review &amp; approve cases</small>
              </span>
              <i class="bi bi-arrow-right lp-demo-arrow"></i>
            </button>
          </div>
        </div>

        <!-- Divider -->
        <div class="lp-divider anim-in-d2">
          <span>or sign in with credentials</span>
        </div>

        <!-- Tabs -->
        <div class="lp-tabs anim-in-d2">
          <button :class="['lp-tab', tab === 'login' ? 'active' : '']" @click="tab = 'login'">Sign In</button>
          <button :class="['lp-tab', tab === 'register' ? 'active' : '']" @click="tab = 'register'">Register</button>
        </div>

        <!-- Error -->
        <div v-if="error" :class="['lp-error', 'shake']">
          <i class="bi bi-exclamation-circle me-2"></i>{{ error }}
        </div>

        <!-- ── Login Form ── -->
        <form v-if="tab === 'login'" @submit.prevent="handleLogin" class="lp-form anim-in-d3">
          <div class="lp-field">
            <label>Email address</label>
            <div class="lp-input-wrap">
              <i class="bi bi-envelope lp-field-icon"></i>
              <input v-model="loginForm.email" type="email" placeholder="you@life.hkbu.edu.hk" required />
            </div>
          </div>
          <div class="lp-field">
            <label>Password</label>
            <div class="lp-input-wrap">
              <i class="bi bi-lock lp-field-icon"></i>
              <input v-model="loginForm.password" type="password" placeholder="••••••••" required />
            </div>
          </div>
          <div class="lp-field">
            <label>Verification code</label>
            <div class="lp-code-row">
              <div class="lp-input-wrap lp-code-input">
                <i class="bi bi-shield-lock lp-field-icon"></i>
                <input v-model="loginForm.verificationCode" type="text" placeholder="6-digit code" maxlength="6" :required="codeSent" />
              </div>
              <button type="button" class="lp-send-btn" @click="sendVerificationCode" :disabled="sendingCode || countdown > 0">
                <span v-if="sendingCode" class="spinner-border spinner-border-sm"></span>
                <span v-else-if="countdown > 0">{{ countdown }}s</span>
                <span v-else>{{ codeSent ? 'Resend' : 'Send Code' }}</span>
              </button>
            </div>
            <span v-if="codeSent" class="lp-hint-ok"><i class="bi bi-check-circle me-1"></i>Code sent to your email</span>
          </div>
          <button type="submit" class="lp-submit" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-box-arrow-in-right me-2"></i>Sign In
          </button>
        </form>

        <!-- ── Register Form ── -->
        <form v-if="tab === 'register'" @submit.prevent="handleRegister" class="lp-form anim-in-d3">
          <div class="lp-field">
            <label>Full name</label>
            <div class="lp-input-wrap">
              <i class="bi bi-person lp-field-icon"></i>
              <input v-model="regForm.name" type="text" placeholder="Dr. / Prof. Your Name" required />
            </div>
          </div>
          <div class="lp-field">
            <label>Email address</label>
            <div class="lp-input-wrap">
              <i class="bi bi-envelope lp-field-icon"></i>
              <input v-model="regForm.email" type="email" placeholder="you@life.hkbu.edu.hk" required />
            </div>
          </div>
          <div class="lp-field">
            <label>Role</label>
            <div class="lp-input-wrap">
              <i class="bi bi-person-gear lp-field-icon"></i>
              <select v-model="regForm.role">
                <option value="Programme Director">Teacher</option>
                <option value="Head">Programme Director</option>
                <option>admin</option>
              </select>
            </div>
          </div>
          <div class="lp-field">
            <label>Password</label>
            <div class="lp-input-wrap">
              <i class="bi bi-lock lp-field-icon"></i>
              <input v-model="regForm.password" type="password" placeholder="Min. 6 characters" required />
            </div>
          </div>
          <div class="lp-field">
            <label>Confirm password</label>
            <div class="lp-input-wrap">
              <i class="bi bi-lock-fill lp-field-icon"></i>
              <input v-model="regForm.confirm" type="password" placeholder="Repeat password" required />
            </div>
          </div>
          <button type="submit" class="lp-submit" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-person-check me-2"></i>Create Account
          </button>
        </form>

      </div>
    </main>
  </div>
</template>

<style scoped>
/* ─── Root: full-screen split ─── */
.lp-root {
  min-height: 100vh;
  display: flex;
  overflow: hidden;
}

/* ─── LEFT PANEL ─── */
.lp-left {
  flex: 0 0 40%;
  background: linear-gradient(-45deg, #001d4a, #00307a, #0c5eab, #0a3d78, #002966);
  background-size: 400% 400%;
  animation: gradientFlow 14s ease infinite;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2.5rem;
}

@keyframes gradientFlow {
  0%,100% { background-position: 0%   50%; }
  50%      { background-position: 100% 50%; }
}

/* Decorative rings */
.lp-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.10);
  pointer-events: none;
}
.lp-ring-1 {
  width: 380px; height: 380px;
  top: -90px; right: -100px;
  animation: ringPulse 8s ease-in-out infinite;
}
.lp-ring-2 {
  width: 260px; height: 260px;
  bottom: 40px; left: -60px;
  border-color: rgba(255,255,255,0.07);
  animation: ringPulse 10s 2s ease-in-out infinite;
}
.lp-ring-3 {
  width: 150px; height: 150px;
  bottom: 140px; right: 30px;
  border-color: rgba(255,255,255,0.13);
  animation: ringPulse 7s 4s ease-in-out infinite;
}
@keyframes ringPulse {
  0%,100% { transform: scale(1);    opacity: 1; }
  50%      { transform: scale(1.08); opacity: 0.6; }
}

/* Left content */
.lp-left-content {
  position: relative;
  z-index: 2;
  text-align: left;
  color: #fff;
  max-width: 360px;
}

.lp-logo {
  height: 40px;
  margin-bottom: 22px;
  filter: brightness(0) invert(1);
}

.lp-title {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin-bottom: 10px;
}

.lp-sub {
  font-size: 0.85rem;
  opacity: 0.72;
  margin-bottom: 20px;
}

.lp-rule {
  width: 40px;
  height: 2px;
  background: rgba(255,255,255,0.4);
  border-radius: 2px;
  margin-bottom: 20px;
}

.lp-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 13px;
}
.lp-features li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.83rem;
  opacity: 0.85;
  line-height: 1.4;
}
.lp-features li i {
  font-size: 0.9rem;
  margin-top: 1px;
  opacity: 0.9;
  flex-shrink: 0;
  color: rgba(150,210,255,0.9);
}

.lp-verse {
  margin: 0 0 24px;
  padding: 0;
  border: none;
}
.lp-verse p {
  font-size: 0.95rem;
  font-style: italic;
  font-weight: 400;
  line-height: 1.65;
  opacity: 0.88;
  margin: 0 0 6px;
}
.lp-verse cite {
  font-size: 0.78rem;
  opacity: 0.55;
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.lp-footer-text {
  font-size: 0.73rem;
  opacity: 0.45;
  margin: 0;
}

/* ─── RIGHT PANEL ─── */
.lp-right {
  flex: 1;
  background: #f6f8fc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  overflow-y: auto;
}

[data-bs-theme="dark"] .lp-right {
  background: #0e1929;
}

.lp-form-wrap {
  width: 100%;
  max-width: 420px;
}

/* Form header */
.lp-form-header {
  margin-bottom: 22px;
}
.lp-form-header h2 {
  font-size: 1.55rem;
  font-weight: 700;
  color: #0f1e2d;
  margin: 0 0 4px;
  letter-spacing: -0.01em;
}
.lp-form-header p {
  font-size: 0.86rem;
  color: #6c7a8a;
  margin: 0;
}
[data-bs-theme="dark"] .lp-form-header h2 { color: #dce8f0; }
[data-bs-theme="dark"] .lp-form-header p  { color: #6d8097; }

/* Demo section */
.lp-section-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #8a9bb0;
  margin-bottom: 9px;
}

.lp-demo-grid {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.lp-demo-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: #fff;
  cursor: pointer;
  transition: all 0.18s ease;
  text-align: left;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
}
.lp-demo-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.10); }
.lp-demo-btn:active { transform: scale(0.98); }

[data-bs-theme="dark"] .lp-demo-btn {
  background: #152338;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

.lp-demo-icon {
  width: 34px; height: 34px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.lp-demo-admin .lp-demo-icon { background: rgba(12,142,235,0.12); color: #0c8eeb; }
.lp-demo-admin { border-color: rgba(12,142,235,0.18); }
.lp-demo-admin:hover { border-color: rgba(12,142,235,0.35); }

.lp-demo-pd .lp-demo-icon { background: rgba(25,135,84,0.10); color: #198754; }
.lp-demo-pd { border-color: rgba(25,135,84,0.18); }
.lp-demo-pd:hover { border-color: rgba(25,135,84,0.35); }

.lp-demo-head .lp-demo-icon { background: rgba(111,66,193,0.10); color: #6f42c1; }
.lp-demo-head { border-color: rgba(111,66,193,0.18); }
.lp-demo-head:hover { border-color: rgba(111,66,193,0.35); }

.lp-demo-text { flex: 1; }
.lp-demo-text strong { display: block; font-size: 0.86rem; font-weight: 600; color: #1a2d3d; line-height: 1.3; }
.lp-demo-text small  { font-size: 0.75rem; color: #7a8fa0; }
[data-bs-theme="dark"] .lp-demo-text strong { color: #cdd8e3; }
[data-bs-theme="dark"] .lp-demo-text small  { color: #5a7080; }

.lp-demo-arrow { color: #b0bcc8; font-size: 0.75rem; flex-shrink: 0; }

/* Divider */
.lp-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0 14px;
  color: #aab5c0;
  font-size: 0.78rem;
}
.lp-divider::before,
.lp-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #dde4ec;
}
[data-bs-theme="dark"] .lp-divider::before,
[data-bs-theme="dark"] .lp-divider::after { background: rgba(255,255,255,0.09); }

/* Tabs */
.lp-tabs {
  display: flex;
  background: #e8eef5;
  border-radius: 9px;
  padding: 3px;
  gap: 2px;
  margin-bottom: 18px;
}
[data-bs-theme="dark"] .lp-tabs { background: rgba(255,255,255,0.06); }

.lp-tab {
  flex: 1;
  padding: 0.42rem 0;
  border: none;
  background: transparent;
  border-radius: 7px;
  font-size: 0.86rem;
  font-weight: 500;
  color: #7a8fa0;
  cursor: pointer;
  transition: all 0.18s;
}
.lp-tab.active {
  background: #fff;
  color: #0c8eeb;
  font-weight: 600;
  box-shadow: 0 1px 6px rgba(0,0,0,0.09);
}
[data-bs-theme="dark"] .lp-tab.active {
  background: rgba(0,180,216,0.16);
  color: #3ecff5;
}

/* Error */
.lp-error {
  padding: 9px 12px;
  background: #fff1f0;
  border: 1px solid rgba(220,53,69,0.2);
  border-radius: 8px;
  color: #c0392b;
  font-size: 0.83rem;
  margin-bottom: 14px;
}
[data-bs-theme="dark"] .lp-error {
  background: rgba(220,53,69,0.1);
  border-color: rgba(220,53,69,0.3);
  color: #f5827a;
}

/* Form fields */
.lp-form { display: flex; flex-direction: column; gap: 13px; }

.lp-field > label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 5px;
  letter-spacing: 0.01em;
}
[data-bs-theme="dark"] .lp-field > label { color: #8da0b3; }

.lp-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.lp-field-icon {
  position: absolute;
  left: 11px;
  color: #9baab8;
  font-size: 0.85rem;
  pointer-events: none;
  z-index: 1;
}
.lp-input-wrap input,
.lp-input-wrap select {
  width: 100%;
  padding: 0.6rem 0.85rem 0.6rem 2.1rem;
  background: #fff;
  border: 1.5px solid #dde4ec;
  border-radius: 9px;
  font-size: 0.875rem;
  color: #1e2d3d;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.lp-input-wrap input:focus,
.lp-input-wrap select:focus {
  border-color: #0c8eeb;
  box-shadow: 0 0 0 3px rgba(12,142,235,0.10);
}
.lp-input-wrap input::placeholder { color: #b0bcc8; }

[data-bs-theme="dark"] .lp-input-wrap input,
[data-bs-theme="dark"] .lp-input-wrap select {
  background: #0f1e30;
  border-color: rgba(255,255,255,0.12);
  color: #cdd8e3;
}
[data-bs-theme="dark"] .lp-input-wrap input:focus,
[data-bs-theme="dark"] .lp-input-wrap select:focus {
  border-color: #3da5e0;
  box-shadow: 0 0 0 3px rgba(61,165,224,0.12);
}

/* Code row */
.lp-code-row { display: flex; gap: 8px; align-items: stretch; }
.lp-code-input { flex: 1; min-width: 0; }
.lp-send-btn {
  padding: 0.58rem 1rem;
  background: linear-gradient(135deg, rgba(12,142,235,0.12), rgba(54,169,250,0.09));
  border: 1.5px solid rgba(12,142,235,0.3);
  color: #0070c9;
  font-weight: 600;
  font-size: 0.82rem;
  border-radius: 9px;
  cursor: pointer;
  white-space: nowrap;
  min-width: 92px;
  transition: all 0.18s;
}
.lp-send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(12,142,235,0.22), rgba(54,169,250,0.18));
  border-color: rgba(12,142,235,0.5);
}
.lp-send-btn:disabled { opacity: 0.55; cursor: not-allowed; }
[data-bs-theme="dark"] .lp-send-btn { color: #3ecff5; border-color: rgba(0,180,216,0.28); background: rgba(0,180,216,0.09); }

.lp-hint-ok { font-size: 0.75rem; color: #198754; display: block; margin-top: 4px; }
[data-bs-theme="dark"] .lp-hint-ok { color: #5cba8a; }

/* Submit button */
.lp-submit {
  width: 100%;
  margin-top: 4px;
  padding: 0.72rem 1.25rem;
  background: linear-gradient(135deg, #0c8eeb, #36a9fa);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(12,142,235,0.35);
  transition: transform 0.15s, box-shadow 0.15s;
}
.lp-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(12,142,235,0.45);
}
.lp-submit:active:not(:disabled) { transform: scale(0.97); }
.lp-submit:disabled { opacity: 0.6; pointer-events: none; }
[data-bs-theme="dark"] .lp-submit {
  background: linear-gradient(135deg, #00b4d8, #0090b8);
  box-shadow: 0 4px 16px rgba(0,180,216,0.35);
}

/* Responsive: stack on mobile */
@media (max-width: 768px) {
  .lp-root { flex-direction: column; }
  .lp-left { flex: none; min-height: 220px; padding: 2rem; }
  .lp-title { font-size: 1.35rem; }
  .lp-features { display: none; }
  .lp-right { padding: 2rem 1.25rem; }
}
</style>
