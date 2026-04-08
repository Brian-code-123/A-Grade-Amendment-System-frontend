<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { getPostLoginRoute } from '@/utils/authRedirect'

const router = useRouter()
const auth = useAuthStore()

onMounted(() => {
  // Auto-login as admin demo user
  const demoToken = 'demo_token_' + Date.now()
  const demoUser = {
    email: 'admin@hkbu.edu.hk',
    name: 'Administrator',
    role: 'admin'
  }
  auth.setAuth(demoToken, demoUser)
  router.push(getPostLoginRoute(demoUser))
})
</script>

<template>
  <div class="login-bg">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-5 col-lg-4">
          <div class="glass-card text-center">
            <div class="logo-pill d-inline-block mb-4">
              <img src="@/assets/logo.png" alt="HKBU" style="height:52px" />
            </div>
            <div class="demo-badge mb-4">
              <i class="bi bi-lightning-charge-fill"></i>
              Admin Demo
            </div>
            <h5 class="fw-bold mb-2">Entering as Administrator</h5>
            <p class="text-muted mb-4">Redirecting to dashboard...</p>
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(12,142,235,0.08), rgba(54,169,250,0.06));
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-pill {
  background: rgba(255,255,255,0.85);
  border-radius: 12px;
  padding: 8px 20px;
  box-shadow: 0 2px 12px rgba(12,142,235,0.08);
}

.glass-card {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(12,142,235,0.08);
}

.demo-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, rgba(12,142,235,0.12), rgba(54,169,250,0.1));
  border: 1.5px solid rgba(12,142,235,0.25);
  border-radius: 20px;
  color: #0c8eeb;
  font-weight: 600;
}

[data-bs-theme="dark"] .login-bg {
  background: linear-gradient(135deg, rgba(0,180,216,0.06), rgba(0,144,184,0.04));
}

[data-bs-theme="dark"] .glass-card {
  background: rgba(15,35,65,0.6);
  border-color: rgba(0,180,216,0.15);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

[data-bs-theme="dark"] .logo-pill {
  background: rgba(30,50,80,0.7);
  box-shadow: 0 0 12px rgba(0,180,216,0.12);
}
</style>
