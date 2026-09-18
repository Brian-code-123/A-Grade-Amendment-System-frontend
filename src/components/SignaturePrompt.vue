<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const needsSignature = computed(() => {
  return auth.isLoggedIn && auth.user?.role !== 'admin' && !auth.user?.signature
})

function goToSignatureSetup() {
  router.push('/signature-setup')
}
</script>

<template>
  <div v-if="needsSignature" class="alert alert-warning alert-dismissible fade show" role="alert">
    <i class="bi bi-exclamation-triangle-fill"></i>
    <strong>Action Required:</strong> Please set up your digital signature to use the PDF download feature.
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    <div class="mt-2">
      <button @click="goToSignatureSetup" class="btn btn-warning btn-sm">
        <i class="bi bi-pen"></i> Set Up Signature Now
      </button>
    </div>
  </div>
</template>

<style scoped>
.alert {
  margin-bottom: 1rem;
}
</style>
