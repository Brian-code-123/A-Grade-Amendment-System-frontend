<template>
  <div class="card section-card">
    <div class="card-header bg-white d-flex justify-content-between align-items-center">
      <strong>Amendments List ({{ amendmentStore.amendmentCount }})</strong>
      <div class="badge-group">
        <span class="badge bg-warning text-dark me-2">Pending: {{ amendmentStore.pendingAmendments.length }}</span>
        <span class="badge bg-success me-2">Approved: {{ amendmentStore.approvedAmendments.length }}</span>
        <span class="badge bg-danger">Rejected: {{ amendmentStore.rejectedAmendments.length }}</span>
      </div>
    </div>
    <div class="card-body">
      <div v-if="amendmentStore.amendments.length === 0" class="text-center text-muted py-4">
        <p>No amendments found. Add a new amendment or import from Excel.</p>
      </div>
      
      <div v-else class="table-responsive">
        <table class="table table-hover table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Original Grade</th>
              <th>Amended Grade</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="amendment in amendmentStore.amendments" :key="amendment.id">
              <td>{{ amendment.id }}</td>
              
              <template v-if="editingId === amendment.id">
                <!-- Editing mode -->
                <td><input v-model="editForm.studentId" class="form-control form-control-sm" type="text"></td>
                <td><input v-model="editForm.studentName" class="form-control form-control-sm" type="text"></td>
                <td><input v-model="editForm.courseCode" class="form-control form-control-sm" type="text"></td>
                <td><input v-model="editForm.courseName" class="form-control form-control-sm" type="text"></td>
                <td><input v-model="editForm.originalGrade" class="form-control form-control-sm" type="text"></td>
                <td><input v-model="editForm.amendedGrade" class="form-control form-control-sm" type="text"></td>
                <td><input v-model="editForm.reason" class="form-control form-control-sm" type="text"></td>
                <td>
                  <select v-model="editForm.status" class="form-select form-select-sm">
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td>
                  <button class="btn btn-sm btn-success me-1" @click="handleSave(amendment.id)">Save</button>
                  <button class="btn btn-sm btn-secondary" @click="cancelEdit">Cancel</button>
                </td>
              </template>
              
              <template v-else>
                <!-- View mode -->
                <td>{{ amendment.studentId }}</td>
                <td>{{ amendment.studentName }}</td>
                <td>{{ amendment.courseCode }}</td>
                <td>{{ amendment.courseName }}</td>
                <td>{{ amendment.originalGrade }}</td>
                <td>{{ amendment.amendedGrade }}</td>
                <td>{{ amendment.reason }}</td>
                <td>
                  <span 
                    class="badge" 
                    :class="{
                      'bg-warning text-dark': amendment.status === 'Pending',
                      'bg-success': amendment.status === 'Approved',
                      'bg-danger': amendment.status === 'Rejected'
                    }"
                  >
                    {{ amendment.status }}
                  </span>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-primary me-1" 
                    @click="startEdit(amendment)"
                    :disabled="amendmentStore.loading"
                  >
                    Edit
                  </button>
                  <button 
                    class="btn btn-sm btn-danger" 
                    @click="handleDelete(amendment.id)"
                    :disabled="amendmentStore.loading"
                  >
                    Delete
                  </button>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAmendmentStore } from '@/stores/amendmentStore'

const amendmentStore = useAmendmentStore()
const editingId = ref(null)
const editForm = reactive({
  studentId: '',
  studentName: '',
  courseCode: '',
  courseName: '',
  originalGrade: '',
  amendedGrade: '',
  reason: '',
  status: 'Pending'
})

const startEdit = (amendment) => {
  editingId.value = amendment.id
  editForm.studentId = amendment.studentId
  editForm.studentName = amendment.studentName
  editForm.courseCode = amendment.courseCode
  editForm.courseName = amendment.courseName
  editForm.originalGrade = amendment.originalGrade
  editForm.amendedGrade = amendment.amendedGrade
  editForm.reason = amendment.reason
  editForm.status = amendment.status
}

const cancelEdit = () => {
  editingId.value = null
}

const handleSave = async (id) => {
  try {
    await amendmentStore.updateAmendment(id, { ...editForm })
    editingId.value = null
  } catch (error) {
    console.error('Failed to update amendment:', error)
  }
}

const handleDelete = async (id) => {
  if (confirm('Are you sure you want to delete this amendment?')) {
    try {
      await amendmentStore.deleteAmendment(id)
    } catch (error) {
      console.error('Failed to delete amendment:', error)
    }
  }
}
</script>

<style scoped>
.section-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.badge-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.table-responsive {
  overflow-x: auto;
}

.table th {
  background-color: #4472C4;
  color: white;
  font-weight: 600;
  white-space: nowrap;
}

.table td {
  vertical-align: middle;
  white-space: nowrap;
}

.form-control-sm,
.form-select-sm {
  min-width: 100px;
}

@media (max-width: 768px) {
  .badge-group {
    font-size: 0.75rem;
  }
  
  .btn-sm {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>
