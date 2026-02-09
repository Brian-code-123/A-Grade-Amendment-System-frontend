<template>
  <div class="card section-card">
    <div class="card-header bg-white">
      <strong>Add New Amendment</strong>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <!-- First row: Student and Course information -->
        <div class="row g-2 mb-2">
          <div class="col-md-3">
            <input 
              v-model="formData.studentId" 
              type="text" 
              class="form-control" 
              placeholder="Student ID" 
              required
            >
          </div>
          <div class="col-md-3">
            <input 
              v-model="formData.studentName" 
              type="text" 
              class="form-control" 
              placeholder="Student Name" 
              required
            >
          </div>
          <div class="col-md-3">
            <input 
              v-model="formData.courseCode" 
              type="text" 
              class="form-control" 
              placeholder="Course Code" 
              required
            >
          </div>
          <div class="col-md-3">
            <input 
              v-model="formData.courseName" 
              type="text" 
              class="form-control" 
              placeholder="Course Name" 
              required
            >
          </div>
        </div>
        
        <!-- Second row: Grades, Reason, Status and Submit button -->
        <div class="row g-2">
          <div class="col-md-2">
            <input 
              v-model="formData.originalGrade" 
              type="text" 
              class="form-control" 
              placeholder="Original Grade" 
              required
            >
          </div>
          <div class="col-md-2">
            <input 
              v-model="formData.amendedGrade" 
              type="text" 
              class="form-control" 
              placeholder="Amended Grade" 
              required
            >
          </div>
          <div class="col-md-4">
            <input 
              v-model="formData.reason" 
              type="text" 
              class="form-control" 
              placeholder="Reason" 
              required
            >
          </div>
          <div class="col-md-2">
            <select v-model="formData.status" class="form-select" required>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div class="col-md-2">
            <button 
              type="submit" 
              class="btn btn-primary w-100"
              :disabled="amendmentStore.loading"
            >
              <span v-if="amendmentStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              Add
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useAmendmentStore } from '@/stores/amendmentStore'

const amendmentStore = useAmendmentStore()

const formData = reactive({
  studentId: '',
  studentName: '',
  courseCode: '',
  courseName: '',
  originalGrade: '',
  amendedGrade: '',
  reason: '',
  status: 'Pending'
})

const resetForm = () => {
  formData.studentId = ''
  formData.studentName = ''
  formData.courseCode = ''
  formData.courseName = ''
  formData.originalGrade = ''
  formData.amendedGrade = ''
  formData.reason = ''
  formData.status = 'Pending'
}

const handleSubmit = async () => {
  try {
    await amendmentStore.addAmendment({ ...formData })
    resetForm()
  } catch (error) {
    console.error('Failed to add amendment:', error)
  }
}
</script>

<style scoped>
.section-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
