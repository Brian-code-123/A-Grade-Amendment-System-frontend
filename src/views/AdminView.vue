<script setup>
import { ref, onMounted } from 'vue'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useAuthStore } from '@/stores/authStore'

const subStore = useSubmissionStore()
const auth = useAuthStore()

const successMsg = ref('')
const errorMsg = ref('')
const rejectModal = ref(false)
const rejectId = ref(null)
const rejectReason = ref('')
const detailModal = ref(false)
const detailSubmission = ref(null)

async function handleApprove(id) {
  if (!confirm('Approve this submission?')) return
  try {
    await subStore.approveSubmission(id)
    successMsg.value = 'Submission approved'
  } catch (e) {
    errorMsg.value = e.message
  }
}

function openReject(id) {
  rejectId.value = id
  rejectReason.value = ''
  rejectModal.value = true
}

async function confirmReject() {
  try {
    await subStore.rejectSubmission(rejectId.value, rejectReason.value)
    successMsg.value = 'Submission rejected'
    rejectModal.value = false
  } catch (e) {
    errorMsg.value = e.message
  }
}

async function handlePrint(id) {
  try {
    await subStore.markPrinted(id)
    successMsg.value = 'Marked as printed'
    // Also trigger browser print
    window.print()
  } catch (e) {
    errorMsg.value = e.message
  }
}

async function viewDetail(id) {
  await subStore.fetchSubmission(id)
  detailSubmission.value = subStore.currentSubmission
  detailModal.value = true
}

const statusBadge = (status) => {
  const map = { Draft: 'bg-warning text-dark', Submitted: 'bg-info', Approved: 'bg-success', Rejected: 'bg-danger' }
  return map[status] || 'bg-secondary'
}

onMounted(() => subStore.fetchSubmissions())
</script>

<template>
  <div class="container py-4">
    <h3 class="fw-bold mb-3"><i class="bi bi-shield-lock"></i> Admin Panel</h3>

    <div v-if="successMsg" class="alert alert-success alert-dismissible fade show">
      {{ successMsg }}<button class="btn-close" @click="successMsg = ''"></button>
    </div>
    <div v-if="errorMsg" class="alert alert-danger alert-dismissible fade show">
      {{ errorMsg }}<button class="btn-close" @click="errorMsg = ''"></button>
    </div>

    <!-- Stats -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <div class="fs-3 fw-bold text-primary">{{ subStore.submissions.length }}</div>
            <div class="small text-muted">Total</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <div class="fs-3 fw-bold text-info">{{ subStore.submissions.filter(s => s.status === 'Submitted').length }}</div>
            <div class="small text-muted">Pending Review</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <div class="fs-3 fw-bold text-success">{{ subStore.submissions.filter(s => s.status === 'Approved').length }}</div>
            <div class="small text-muted">Approved</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <div class="fs-3 fw-bold text-danger">{{ subStore.submissions.filter(s => s.status === 'Rejected').length }}</div>
            <div class="small text-muted">Rejected</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submissions Table -->
    <div class="card shadow-sm">
      <div class="card-header fw-bold">Submissions for Review</div>
      <div class="card-body p-0">
        <div v-if="subStore.loading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
        <div v-else-if="subStore.submissions.length === 0" class="text-center text-muted py-4">No submissions</div>
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Submitted By</th>
                <th>Status</th>
                <th>Amendments</th>
                <th>Date</th>
                <th>Printed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in subStore.submissions" :key="s._id">
                <td class="fw-semibold">{{ s.title }}</td>
                <td>{{ s.submitted_by_name }}</td>
                <td><span class="badge" :class="statusBadge(s.status)">{{ s.status }}</span></td>
                <td>{{ s.amendment_count || 0 }}</td>
                <td class="small">{{ new Date(s.created_at).toLocaleDateString() }}</td>
                <td>
                  <i class="bi" :class="s.printed ? 'bi-check-circle text-success' : 'bi-x-circle text-muted'"></i>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" @click="viewDetail(s._id)"><i class="bi bi-eye"></i></button>
                    <button v-if="s.status === 'Submitted'" class="btn btn-outline-success" @click="handleApprove(s._id)"><i class="bi bi-check"></i> Approve</button>
                    <button v-if="s.status === 'Submitted'" class="btn btn-outline-danger" @click="openReject(s._id)"><i class="bi bi-x"></i> Reject</button>
                    <button v-if="s.status === 'Approved' && !s.printed" class="btn btn-outline-primary" @click="handlePrint(s._id)"><i class="bi bi-printer"></i> Print</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="rejectModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reject Submission</h5>
            <button type="button" class="btn-close" @click="rejectModal = false"></button>
          </div>
          <div class="modal-body">
            <label class="form-label">Reason for rejection:</label>
            <textarea v-model="rejectReason" class="form-control" rows="3" placeholder="Enter reason..."></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="rejectModal = false">Cancel</button>
            <button class="btn btn-danger" @click="confirmReject">Reject</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="detailModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ detailSubmission?.title }}</h5>
            <button type="button" class="btn-close" @click="detailModal = false"></button>
          </div>
          <div class="modal-body" v-if="detailSubmission">
            <p><strong>Status:</strong> <span class="badge" :class="statusBadge(detailSubmission.status)">{{ detailSubmission.status }}</span></p>
            <p><strong>Submitted by:</strong> {{ detailSubmission.submitted_by_name }}</p>
            <p><strong>Description:</strong> {{ detailSubmission.description || 'N/A' }}</p>
            <h6 class="fw-bold mt-3">Amendments ({{ detailSubmission.amendments?.length || 0 }})</h6>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead><tr><th>Student ID</th><th>Name</th><th>Course</th><th>Original</th><th>New</th><th>Reason</th></tr></thead>
                <tbody>
                  <tr v-for="a in detailSubmission.amendments" :key="a._id">
                    <td>{{ a.student_id }}</td>
                    <td>{{ a.student_name }}</td>
                    <td>{{ a.course_code }}</td>
                    <td>{{ a.original_grade }}</td>
                    <td>{{ a.new_grade }}</td>
                    <td>{{ a.reason }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="detailModal = false">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
