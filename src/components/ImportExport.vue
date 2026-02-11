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
          
          <!-- File validation errors -->
          <div v-if="fileErrors.length > 0" class="alert alert-danger mt-2 p-2 small">
            <ul class="mb-0">
              <li v-for="(error, index) in fileErrors" :key="index">{{ error }}</li>
            </ul>
          </div>
          
          <!-- Preview section -->
          <div v-if="previewData.length > 0" class="mt-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong class="text-success">Preview ({{ previewData.length }} records found)</strong>
              <button class="btn btn-sm btn-outline-secondary" @click="clearPreview">Clear</button>
            </div>
            <div class="table-responsive" style="max-height: 200px; overflow-y: auto;">
              <table class="table table-sm table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Grade Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in previewData.slice(0, 5)" :key="index">
                    <td>{{ item.studentId }}</td>
                    <td>{{ item.studentName }}</td>
                    <td>{{ item.courseCode }}</td>
                    <td>{{ item.originalGrade }} → {{ item.amendedGrade }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <small class="text-muted" v-if="previewData.length > 5">
              Showing first 5 of {{ previewData.length }} records
            </small>
            <div class="mt-2">
              <button 
                class="btn btn-success btn-sm" 
                @click="confirmImport"
                :disabled="amendmentStore.loading"
              >
                <span v-if="amendmentStore.loading" class="spinner-border spinner-border-sm me-2"></span>
                Confirm Import ({{ previewData.length }} records)
              </button>
            </div>
          </div>
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
              <i class="bi bi-download me-1"></i>
              Download Template
            </button>
            <button 
              class="btn btn-success"
              :disabled="amendmentStore.loading || amendmentStore.amendments.length === 0"
              @click="handleExport"
            >
              <span v-if="amendmentStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-file-earmark-excel me-1"></i>
              Export to Excel
            </button>
            <button 
              v-if="amendmentStore.amendments.length > 0"
              class="btn btn-outline-danger"
              :disabled="amendmentStore.loading"
              @click="handleDeleteAll"
            >
              <span v-if="amendmentStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-trash me-1"></i>
              Delete All
            </button>
          </div>
          
          <!-- Export options -->
          <div class="mt-3">
            <small class="text-muted d-block mb-2">Export Options:</small>
            <div class="form-check">
              <input 
                class="form-check-input" 
                type="checkbox" 
                id="useClientExport"
                v-model="useClientSideExport"
              >
              <label class="form-check-label" for="useClientExport">
                Use client-side Excel generation (faster, works offline)
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAmendmentStore } from '@/stores/amendmentStore'
import excelService from '@/services/excelService'

const amendmentStore = useAmendmentStore()
const fileInput = ref(null)
const selectedFile = ref(null)
const fileErrors = ref([])
const previewData = ref([])
const useClientSideExport = ref(true)

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  fileErrors.value = []
  previewData.value = []
  
  if (!file) {
    selectedFile.value = null
    return
  }
  
  // Validate file
  const validation = excelService.validateFile(file)
  if (!validation.valid) {
    fileErrors.value = validation.errors
    event.target.value = ''
    selectedFile.value = null
    return
  }
  
  selectedFile.value = file
  
  // Try to parse and preview the file
  try {
    const result = await excelService.parseExcelFile(file)
    previewData.value = result.amendments
    
    if (result.errors && result.errors.length > 0) {
      fileErrors.value = result.errors
    }
  } catch (error) {
    fileErrors.value = [error.message]
    console.error('Failed to preview Excel file:', error)
  }
}

const clearPreview = () => {
  previewData.value = []
  fileErrors.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  selectedFile.value = null
}

const handleImport = async () => {
  if (!selectedFile.value) return
  
  // If we have preview data, use the confirm import flow
  if (previewData.value.length > 0) {
    await confirmImport()
  } else {
    // Otherwise, try to parse the file first
    try {
      const result = await excelService.parseExcelFile(selectedFile.value)
      previewData.value = result.amendments
      
      if (result.errors && result.errors.length > 0) {
        fileErrors.value = result.errors
      }
    } catch (error) {
      fileErrors.value = [error.message]
      console.error('Import failed:', error)
      amendmentStore.setError('Failed to import Excel file: ' + error.message)
    }
  }
}

const confirmImport = async () => {
  if (previewData.value.length === 0) return
  
  try {
    // Import each amendment
    for (const amendment of previewData.value) {
      await amendmentStore.addAmendment(amendment)
    }
    
    amendmentStore.setMessage(`Successfully imported ${previewData.value.length} amendments`)
    clearPreview()
  } catch (error) {
    console.error('Import failed:', error)
    amendmentStore.setError('Failed to import some amendments: ' + error.message)
  }
}

const handleExport = async () => {
  try {
    if (useClientSideExport.value) {
      // Use client-side Excel generation
      await excelService.exportToExcel(amendmentStore.amendments)
      amendmentStore.setMessage('Excel file exported successfully (client-side)')
    } else {
      // Use backend export
      await amendmentStore.exportToExcel()
    }
  } catch (error) {
    console.error('Export failed:', error)
    amendmentStore.setError('Failed to export Excel file: ' + error.message)
  }
}

const handleDownloadTemplate = async () => {
  try {
    // Use client-side template generation
    await excelService.generateTemplate()
    amendmentStore.setMessage('Template downloaded successfully')
  } catch (error) {
    console.error('Download template failed:', error)
    amendmentStore.setError('Failed to download template: ' + error.message)
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
