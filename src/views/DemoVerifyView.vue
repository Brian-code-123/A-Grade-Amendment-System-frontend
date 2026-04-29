<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const auth = useAuthStore()

const verified = ref(false)
const loading = ref(false)
const captchaValue = ref('')
const correctAnswer = ref(0)
const num1 = ref(0)
const num2 = ref(0)
const error = ref('')

// Generate simple math captcha
function generateCaptcha() {
  num1.value = Math.floor(Math.random() * 10) + 1
  num2.value = Math.floor(Math.random() * 10) + 1
  correctAnswer.value = num1.value + num2.value
}

onMounted(() => {
  generateCaptcha()
})

function handleVerify() {
  error.value = ''
  
  if (!captchaValue.value) {
    error.value = 'Please enter the verification code'
    return
  }
  
  if (parseInt(captchaValue.value) === correctAnswer.value) {
    loading.value = true
    verified.value = true
    
    // Simulate verification delay, then set auth and redirect
    setTimeout(() => {
      const demoToken = 'demo_token_' + Date.now()
      const demoUser = {
        email: 'grade-admin@hkbu.edu.hk',
        name: 'Admin User',
        role: 'admin'
      }
      auth.setAuth(demoToken, demoUser)
      router.replace(auth.resolveLandingRoute(demoUser))
    }, 800)
  } else {
    error.value = 'Incorrect verification code, please try again'
    captchaValue.value = ''
    generateCaptcha()
  }
}

function refreshCaptcha() {
  captchaValue.value = ''
  error.value = ''
  generateCaptcha()
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
            <h5 class="fw-bold mb-0">Human Verification</h5>
            <small class="text-muted">Security Check</small>
          </div>

          <!-- Glass card -->
          <div class="glass-card">
            <div v-if="!verified" class="text-center mb-4">
              <div class="verify-icon mb-3">
                <i class="bi bi-shield-check"></i>
              </div>
              <p class="text-muted mb-0">Please complete the verification to continue</p>
            </div>

            <div v-if="verified" class="text-center">
              <div class="success-icon mb-3">
                <i class="bi bi-check-circle-fill"></i>
              </div>
              <h6 class="fw-bold mb-2">Verification Successful!</h6>
              <p class="text-muted small">Redirecting...</p>
              <div class="spinner-border text-primary mt-2" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-if="!verified">
              <!-- Error -->
              <div v-if="error" class="alert alert-danger py-2 small mb-3">{{ error }}</div>

              <!-- Captcha -->
              <div class="captcha-box mb-4">
                <div class="captcha-question">
                  <span class="captcha-text">{{ num1 }} + {{ num2 }} = ?</span>
                  <button type="button" class="btn-refresh" @click="refreshCaptcha" title="Refresh captcha">
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
              </div>

              <!-- Verify form -->
              <form @submit.prevent="handleVerify">
                <div class="mb-4">
                  <label class="form-label small fw-semibold">Enter the answer</label>
                  <input 
                    v-model="captchaValue" 
                    type="number" 
                    class="glass-input" 
                    placeholder="Enter the result" 
                    required 
                    :disabled="loading"
                    autofocus
                  />
                </div>

                <button type="submit" class="btn-primary-glass w-100" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Verifying...' : 'Verify' }}
                </button>
              </form>
            </div>

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
  background: radial-gradient(ellipse at 20% 50%, rgba(126,162,189,0.12) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 10%, rgba(95,124,150,0.10) 0%, transparent 50%);
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
  box-shadow: 0 0 20px rgba(126,162,189,0.22);
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
  border: 1px solid rgba(126,162,189,0.18);
  box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(126,162,189,0.08) inset;
}

/* Verify icon */
.verify-icon {
  font-size: 3rem;
  color: #0c8eeb;
}

[data-bs-theme="dark"] .verify-icon {
  color: var(--ocean-accent);
}

/* Success icon */
.success-icon {
  font-size: 4rem;
  color: #28a745;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Captcha box */
.captcha-box {
  background: linear-gradient(135deg, rgba(12,142,235,0.08), rgba(54,169,250,0.05));
  border: 2px solid rgba(12,142,235,0.22);
  border-radius: 12px;
  padding: 1.5rem;
}

[data-bs-theme="dark"] .captcha-box {
  background: linear-gradient(135deg, rgba(126,162,189,0.1), rgba(95,124,150,0.05));
  border-color: rgba(126,162,189,0.3);
}

.captcha-question {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.captcha-text {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0c8eeb;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.1em;
}

[data-bs-theme="dark"] .captcha-text {
  color: var(--ocean-accent);
}

.btn-refresh {
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(12,142,235,0.3);
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #0c8eeb;
  font-size: 1.2rem;
}

.btn-refresh:hover {
  background: rgba(255,255,255,1);
  transform: rotate(180deg);
}

[data-bs-theme="dark"] .btn-refresh {
  background: rgba(126,162,189,0.15);
  border-color: rgba(126,162,189,0.4);
  color: var(--ocean-accent);
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
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.glass-input:focus {
  border-color: var(--sky-500);
  box-shadow: 0 0 0 3px rgba(12,142,235,0.12);
  background: rgba(255,255,255,0.85);
}

.glass-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

[data-bs-theme="dark"] .glass-input {
  background: rgba(10,22,40,0.6);
  border-color: rgba(12,142,235,0.22);
  color: #cce8f4;
}

[data-bs-theme="dark"] .glass-input:focus {
  border-color: var(--ocean-accent);
  box-shadow: 0 0 0 3px rgba(12,142,235,0.16);
  background: rgba(10,22,40,0.8);
}

/* Primary button */
.btn-primary-glass {
  padding: 0.65rem 1.25rem;
  background: linear-gradient(135deg, var(--sky-500), var(--sky-400));
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
  cursor: not-allowed;
}

[data-bs-theme="dark"] .btn-primary-glass {
  background: linear-gradient(135deg, var(--ocean-accent), var(--ocean-accent2));
  box-shadow: 0 4px 14px rgba(126,162,189,0.22);
}
</style>
