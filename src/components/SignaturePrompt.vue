<script setup>
import { computed, watch, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const forceUpdate = ref(0)

// Force re-evaluation when user changes
const needsSignature = computed(() => {
  forceUpdate.value // Trigger reactivity
  return auth.isLoggedIn && !auth.user?.signature
})

// Watch user object for changes
watch(() => auth.user?.signature, (newSig) => {
  if (newSig) {
    forceUpdate.value++
  }
}, { deep: true })

onMounted(() => {
  // Re-check on mount in case signature was just saved
  forceUpdate.value++
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
