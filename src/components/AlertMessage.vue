<template>
  <div class="alert-message">
    <div v-if="amendmentStore.message" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ amendmentStore.message }}
      <button type="button" class="btn-close" @click="amendmentStore.message = null" aria-label="Close"></button>
    </div>
    
    <div v-if="amendmentStore.error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ amendmentStore.error }}
      <button type="button" class="btn-close" @click="amendmentStore.error = null" aria-label="Close"></button>
    </div>
  </div>
</template>

<script setup>
import { useAmendmentStore } from '@/stores/amendmentStore'

const amendmentStore = useAmendmentStore()
</script>

<style scoped>
.alert-message {
  margin-bottom: 1rem;
}
</style>
