<template>
  <div class="amendments-view">
    <div class="container py-4">
      <h1 class="text-center mb-4">Grade Amendment System</h1>
      
      <!-- Alerts -->
      <AlertMessage />
      
      <!-- Import/Export Section -->
      <ImportExport />
      
      <!-- Add Amendment Form -->
      <AmendmentForm />
      
      <!-- Amendments Table -->
      <AmendmentTable />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AlertMessage from '@/components/AlertMessage.vue'
import ImportExport from '@/components/ImportExport.vue'
import AmendmentForm from '@/components/AmendmentForm.vue'
import AmendmentTable from '@/components/AmendmentTable.vue'
import { useAmendmentStore } from '@/stores/amendmentStore'

const amendmentStore = useAmendmentStore()

onMounted(() => {
  // Initialize or fetch amendments if needed
  console.log('Amendments view mounted')
})
</script>

<style scoped>
.amendments-view {
  min-height: 100vh;
  background-color: #f5f5f5;
}

h1 {
  color: #333;
  font-weight: 600;
}
</style>
