<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { getPostLoginRoute } from '@/utils/authRedirect'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const error = ref('')

onMounted(async () => {
  // Handle token-based OAuth callback (backend redirect)
  const token = route.query.token
  const userParam = route.query.user

  if (token) {
    try {
      const user = userParam ? JSON.parse(decodeURIComponent(userParam)) : null
      auth.setAuth(token, user)
      router.replace(getPostLoginRoute(user || auth.user))
    } catch {
      error.value = 'Failed to process login. Please try again.'
    }
  } else if (route.query.error) {
    error.value = route.query.error || 'Authentication failed'
  } else {
    // Nothing useful here — redirect to login
    router.replace('/login')
  }
})
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-5 text-center">
        <div v-if="!error">
          <div class="spinner-border text-primary mb-3" role="status"></div>
          <p class="text-muted">Signing you in...</p>
        </div>
        <div v-else class="card shadow-sm">
          <div class="card-body py-4">
            <i class="bi bi-exclamation-triangle fs-1 text-danger"></i>
            <h5 class="fw-bold mt-3">Login Failed</h5>
            <p class="text-muted small">{{ error }}</p>
            <router-link to="/login" class="btn btn-primary">Try Again</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
