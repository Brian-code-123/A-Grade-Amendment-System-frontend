<template>
  <div class="card section-card">
    <div class="card-header bg-white">
      <strong>Import/Export</strong>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-6 mb-3 mb-md-0">
          <label for="excelFile" class="form-label">Import from Excel</label>
          <div class="input-group">
            <input 
              type="file" 
              class="form-control" 
              id="excelFile" 
              ref="fileInput"
              accept=".xlsx,.xls"
              @change="handleFileSelect"
            >
            <button 
              class="btn btn-primary" 
              type="button" 
              :disabled="!selectedFile || amendmentStore.loading"
              @click="handleImport"
            >
              <span v-if="amendmentStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              Import
            </button>
          </div>
          <small class="text-muted">Supported formats: .xlsx, .xls (max 5MB)</small>
        </div>
        
        <div class="col-md-6">
          <label class="form-label">Actions</label>
          <div class="d-flex gap-2 flex-wrap">
            <button 
              class="btn btn-outline-secondary"
              :disabled="amendmentStore.loading"
              @click="handleDownloadTemplate"
            >
              <span v-if="amendmentStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              Download Template
            </button>
            <button 
              class="btn btn-success"
              :disabled="amendmentStore.loading"
              @click="handleExport"
            >
              <span v-if="amendmentStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              Export to Excel
            </button>
            <button 
              v-if="amendmentStore.amendments.length > 0"
              class="btn btn-outline-danger"
              :disabled="amendmentStore.loading"
              @click="handleDeleteAll"
            >
              <span v-if="amendmentStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              Delete All
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAmendmentStore } from '@/stores/amendmentStore'

const amendmentStore = useAmendmentStore()
const fileInput = ref(null)
const selectedFile = ref(null)

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit')
      event.target.value = ''
      selectedFile.value = null
      return
    }
    
    // Validate file type
    const ext = file.name.split('.').pop().toLowerCase()
    if (ext !== 'xlsx' && ext !== 'xls') {
      alert('Only Excel files (.xlsx, .xls) are allowed')
      event.target.value = ''
      selectedFile.value = null
      return
    }
    
    selectedFile.value = file
  }
}

const handleImport = async () => {
  if (!selectedFile.value) return
  
  try {
    await amendmentStore.importFromExcel(selectedFile.value)
    // Clear file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    selectedFile.value = null
  } catch (error) {
    console.error('Import failed:', error)
  }
}

const handleExport = async () => {
  try {
    await amendmentStore.exportToExcel()
  } catch (error) {
    console.error('Export failed:', error)
  }
}

const handleDownloadTemplate = async () => {
  try {
    await amendmentStore.downloadTemplate()
  } catch (error) {
    console.error('Download template failed:', error)
  }
}

const handleDeleteAll = async () => {
  if (confirm('Are you sure you want to delete all amendments? This action cannot be undone.')) {
    try {
      await amendmentStore.deleteAllAmendments()
    } catch (error) {
      console.error('Delete all failed:', error)
    }
  }
}
</script>

<style scoped>
.section-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.gap-2 {
  gap: 0.5rem;
}
</style>
