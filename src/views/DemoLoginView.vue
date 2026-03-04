<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

function handleLogin() {
  error.value = ''
  
  if (!username.value || !password.value) {
    error.value = 'Please enter username and password'
    return
  }
  
  if (username.value === 'admin' && password.value === 'admin') {
    loading.value = true
    // Simulate login delay
    setTimeout(() => {
      router.push('/demo-verify')
    }, 500)
  } else {
    error.value = 'Invalid username or password'
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
            <h5 class="fw-bold mb-0">Demo Login</h5>
            <small class="text-muted">Quick Access Mode</small>
          </div>

          <!-- Glass card -->
          <div class="glass-card">
            <div class="text-center mb-4">
              <div class="demo-badge">
                <i class="bi bi-lightning-charge-fill"></i>
                Quick Demo Mode
              </div>
            </div>

            <!-- Error -->
            <div v-if="error" class="alert alert-danger py-2 small mb-3">{{ error }}</div>

            <!-- Login form -->
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label class="form-label small fw-semibold">Username</label>
                <input 
                  v-model="username" 
                  type="text" 
                  class="glass-input" 
                  placeholder="admin" 
                  required 
                  :disabled="loading"
                />
              </div>
              <div class="mb-4">
                <label class="form-label small fw-semibold">Password</label>
                <input 
                  v-model="password" 
                  type="password" 
                  class="glass-input" 
                  placeholder="admin" 
                  required 
                  :disabled="loading"
                />
              </div>
              
              <div class="hint-box mb-4">
                <i class="bi bi-info-circle me-2"></i>
                <span>Hint: Both username and password are <code>admin</code></span>
              </div>

              <button type="submit" class="btn-primary-glass w-100" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Logging in...' : 'Login' }}
              </button>
            </form>

            <div class="text-center mt-3">
              <button class="btn-link" @click="router.push('/login')">
                <i class="bi bi-arrow-left me-1"></i>
                Back to Main Login
              </button>
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

/* Demo badge */
.demo-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(12,142,235,0.15), rgba(54,169,250,0.12));
  border: 2px solid rgba(12,142,235,0.35);
  border-radius: 20px;
  color: #0070c9;
  font-weight: 600;
  font-size: 0.85rem;
}

[data-bs-theme="dark"] .demo-badge {
  border-color: rgba(0,180,216,0.3);
  color: #00d6ff;
  background: linear-gradient(135deg, rgba(0,180,216,0.12), rgba(0,144,184,0.10));
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

.glass-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* Hint box */
.hint-box {
  padding: 0.75rem;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 10px;
  font-size: 0.85rem;
  color: #856404;
  display: flex;
  align-items: center;
}

.hint-box code {
  background: rgba(255, 193, 7, 0.2);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
}

[data-bs-theme="dark"] .hint-box {
  background: rgba(255, 193, 7, 0.15);
  border-color: rgba(255, 193, 7, 0.4);
  color: #ffc107;
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
  cursor: not-allowed;
}

[data-bs-theme="dark"] .btn-primary-glass {
  background: linear-gradient(135deg, #00b4d8, #0090b8);
  box-shadow: 0 4px 14px rgba(0,180,216,0.3);
}

/* Link button */
.btn-link {
  background: none;
  border: none;
  color: #0c8eeb;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: opacity 0.2s;
}

.btn-link:hover {
  opacity: 0.8;
}

[data-bs-theme="dark"] .btn-link {
  color: #00d6ff;
}
</style>
