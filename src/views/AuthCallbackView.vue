<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { getMsalInstance, loginRequest } from '@/auth/msalConfig'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const error = ref('')

onMounted(async () => {
  // First try MSAL redirect handling
  try {
    const msalInstance = getMsalInstance()
    await msalInstance.initialize()
    const response = await msalInstance.handleRedirectPromise()
    if (response && response.account) {
      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: response.account
      })
      const msalUser = {
        email: response.account.username,
        name: response.account.name || response.account.username,
        role: 'admin'
      }
      auth.setAuth(tokenResponse.accessToken, msalUser)
      router.replace('/')
      return
    }
  } catch (e) {
    console.warn('MSAL redirect handling:', e.message)
  }

  // Fallback: try query params (backend OAuth callback)
  const token = route.query.token
  const userParam = route.query.user

  if (token) {
    try {
      const user = userParam ? JSON.parse(decodeURIComponent(userParam)) : null
      auth.setAuth(token, user)
      router.replace('/')
    } catch (e) {
      error.value = 'Failed to process login. Please try again.'
    }
  } else if (route.query.error) {
    error.value = route.query.error || 'Authentication failed'
  } else {
    error.value = 'No authentication token received'
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
