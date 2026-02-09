<template>
  <div class="home">
    <h1>A Grade Amendment System</h1>
    <p>Welcome to the Grade Amendment System</p>
    <div class="info">
      <h2>System Information</h2>
      <p v-if="loading">Loading...</p>
      <p v-else-if="error">{{ error }}</p>
      <div v-else>
        <p>Backend connected successfully!</p>
        <p v-if="data">{{ data }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(false)
const error = ref(null)
const data = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    const response = await api.get('/')
    data.value = response.data
  } catch (err) {
    error.value = 'Failed to connect to backend: ' + err.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home {
  text-align: center;
}

.info {
  margin-top: 2rem;
  padding: 2rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

h2 {
  color: #555;
  margin-bottom: 1rem;
}
</style>
