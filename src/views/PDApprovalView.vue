<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useAmendmentStore } from '@/stores/amendmentStore'
import { useAuthStore } from '@/stores/authStore'
import { sendApprovalEmail, sendRejectionEmail } from '@/services/emailService'

const subStore = useSubmissionStore()
const amStore = useAmendmentStore()
const auth = useAuthStore()
const route = useRoute()

const successMsg = ref('')
const errorMsg = ref('')
const rejectModal = ref(false)
const rejectId = ref(null)
const rejectReason = ref('')
const detailModal = ref(false)
const detailSubmission = ref(null)
const detailAmendments = ref([])
const searchQuery = ref('')
const statusFilter = ref('All')
let demoRefreshTimer = null

// Only show Submitted, Approved, Rejected — no Draft
const visibleSubmissions = computed(() => {
  let result = subStore.submissions.filter(s => s.status !== 'Draft')
  if (statusFilter.value !== 'All') {
    result = result.filter(s => s.status === statusFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      s.submitted_by_name?.toLowerCase().includes(q)
    )
  }
  return result
})

const stats = computed(() => {
  const all = subStore.submissions.filter(s => s.status !== 'Draft')
  return {
    total: all.length,
    pending: all.filter(s => s.status === 'Submitted').length,
    approved: all.filter(s => s.status === 'Approved').length,
    rejected: all.filter(s => s.status === 'Rejected').length
  }
})

function resolveAmendments(submission) {
  if (submission?.amendment_ids && amStore.amendments.length) {
    const mapped = submission.amendment_ids
      .map(aid => amStore.amendments.find(a => a._id === aid))
      .filter(Boolean)

    if (mapped.length > 0) {
      return mapped
    }
  }
  return submission?.amendments || []
}

function amendmentReasonLabel(amendment) {
  return amendment?.reason_type || amendment?.reason || '-'
}

function amendmentDetails(amendment) {
  return amendment?.appeal_details || amendment?.reason_details || amendment?.details || '-'
}

async function handleApprove(id) {
  if (!confirm('Approve this submission?')) return
  try {
    const s = subStore.submissions.find(s => s._id === id)
    await subStore.approveSubmission(id)
    let emailWarning = ''
    if (s) {
      try {
        await sendApprovalEmail(s, auth.user)
      } catch {
        emailWarning = '. Email notification failed — please notify submitter manually.'
      }
    }
    successMsg.value = `Submission approved${emailWarning}`
  } catch (e) { errorMsg.value = e.message }
}

function openReject(id) {
  rejectId.value = id
  rejectReason.value = ''
  rejectModal.value = true
}

async function confirmReject() {
  try {
    const s = subStore.submissions.find(s => s._id === rejectId.value)
    await subStore.rejectSubmission(rejectId.value, rejectReason.value)
    rejectModal.value = false
    let emailWarning = ''
    if (s) {
      try {
        await sendRejectionEmail(s, rejectReason.value, auth.user)
      } catch {
        emailWarning = '. Email notification failed — please notify submitter manually.'
      }
    }
    successMsg.value = `Submission rejected${emailWarning}`
  } catch (e) { errorMsg.value = e.message }
}

async function viewDetail(id) {
  await subStore.fetchSubmission(id)
  detailSubmission.value = subStore.currentSubmission
  detailAmendments.value = resolveAmendments(detailSubmission.value)
  detailModal.value = true
}

const statusBadge = (status) => {
  const map = { Submitted: 'bg-info', Approved: 'bg-success', Rejected: 'bg-danger' }
  return map[status] || 'bg-secondary'
}

const displayStatus = (status) => status === 'Submitted' ? 'Pending' : status

const filterBtnClass = (opt) => {
  const map = { All: 'btn-primary', Submitted: 'btn-info', Approved: 'btn-success', Rejected: 'btn-danger' }
  return map[opt] || 'btn-secondary'
}

function applyFilterFromQuery() {
  const raw = String(route.query.filter || route.query.status || '').trim().toLowerCase()
  if (!raw) return
  if (raw === 'pending' || raw === 'submitted') {
    statusFilter.value = 'Submitted'
    return
  }
  if (raw === 'approved') {
    statusFilter.value = 'Approved'
    return
  }
  if (raw === 'rejected') {
    statusFilter.value = 'Rejected'
    return
  }
  if (raw === 'all') {
    statusFilter.value = 'All'
  }
}

onMounted(() => {
  subStore.fetchSubmissions()
  amStore.fetchAmendments()
  applyFilterFromQuery()

  if (auth.token?.startsWith('demo_token_')) {
    demoRefreshTimer = setInterval(() => {
      subStore.fetchSubmissions()
    }, 5000)
  }
})

watch(() => route.query, () => {
  applyFilterFromQuery()
}, { deep: true })

onUnmounted(() => {
  if (demoRefreshTimer) {
    clearInterval(demoRefreshTimer)
    demoRefreshTimer = null
  }
})
</script>

<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h2 class="fw-bold mb-1">Cases for Approval</h2>
        <small class="text-muted">Review and approve grade amendment submissions from teachers</small>
      </div>
      <div class="badge bg-primary px-3 py-2 rounded-pill" style="font-size:0.85rem">
        <i class="bi bi-person-check me-1"></i>Programme Director
      </div>
    </div>

    <!-- Alerts -->
    <div v-if="successMsg" class="alert alert-success alert-dismissible fade show">
      <i class="bi bi-check-circle me-2"></i>{{ successMsg }}
      <button class="btn-close" @click="successMsg = ''"></button>
    </div>
    <div v-if="errorMsg" class="alert alert-danger alert-dismissible fade show">
      <i class="bi bi-exclamation-circle me-2"></i>{{ errorMsg }}
      <button class="btn-close" @click="errorMsg = ''"></button>
    </div>

    <!-- Stats -->
    <div class="row g-2 mb-4">
      <div class="col-6 col-sm-3">
        <div class="card text-center stat-card">
          <div class="card-body">
            <div class="stat-number text-primary">{{ stats.total }}</div>
            <div class="stat-label">Total Cases</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-sm-3">
        <div class="card text-center stat-card">
          <div class="card-body">
            <div class="stat-number text-info">{{ stats.pending }}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-sm-3">
        <div class="card text-center stat-card">
          <div class="card-body">
            <div class="stat-number text-success">{{ stats.approved }}</div>
            <div class="stat-label">Approved</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-sm-3">
        <div class="card text-center stat-card">
          <div class="card-body">
            <div class="stat-number text-danger">{{ stats.rejected }}</div>
            <div class="stat-label">Rejected</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="card shadow-sm mb-3 border-0">
      <div class="card-body py-3">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-0"><i class="bi bi-search"></i></span>
              <input v-model="searchQuery" type="text" class="form-control border-0" placeholder="Search by title or teacher name..." />
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <span class="text-muted fw-semibold small"><i class="bi bi-funnel"></i> Filter:</span>
              <button
                v-for="opt in ['All', 'Submitted', 'Approved', 'Rejected']"
                :key="opt"
                class="btn btn-sm rounded-pill px-3"
                :class="statusFilter === opt ? filterBtnClass(opt) : 'btn-outline-secondary'"
                @click="statusFilter = opt"
              >
                {{ displayStatus(opt) }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card shadow-sm">
      <div class="card-header fw-bold d-flex align-items-center justify-content-between">
        <div>
          <i class="bi bi-table me-1"></i>Submissions for Review
          <span class="badge bg-primary ms-2">{{ visibleSubmissions.length }}</span>
        </div>
        <small class="fw-normal text-muted">Showing {{ visibleSubmissions.length }} cases</small>
      </div>
      <div class="card-body p-0">
        <div v-if="subStore.loading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
        </div>
        <div v-else-if="visibleSubmissions.length === 0" class="text-center text-muted py-4">
          <i class="bi bi-inbox" style="font-size:2rem;opacity:0.3"></i>
          <p class="mt-2">No cases found</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th>Title</th>
                <th>Submitted By</th>
                <th>Status</th>
                <th>Number of Cases</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in visibleSubmissions" :key="s._id">
                <td class="fw-semibold">{{ s.title }}</td>
                <td>{{ s.submitted_by_name }}</td>
                <td><span class="badge" :class="statusBadge(s.status)">{{ displayStatus(s.status) }}</span></td>
                <td>{{ s.amendment_count || 0 }}</td>
                <td class="small">{{ new Date(s.created_at).toLocaleDateString() }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-secondary" @click="viewDetail(s._id)" title="View Details">
                    <i class="bi bi-eye"></i>
                  </button>
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
            <p><strong>Status:</strong> <span class="badge" :class="statusBadge(detailSubmission.status)">{{ displayStatus(detailSubmission.status) }}</span></p>
            <p><strong>Submitted by:</strong> {{ detailSubmission.submitted_by_name }}</p>
            <p><strong>Description:</strong> {{ detailSubmission.description || 'N/A' }}</p>
            <p v-if="detailSubmission.rejection_reason"><strong>Rejection Reason:</strong> <span class="text-danger">{{ detailSubmission.rejection_reason }}</span></p>

            <h6 class="fw-bold mt-3">Amendment Cases ({{ detailAmendments.length }})</h6>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr><th>Student No.</th><th>Name</th><th>Course</th><th>Original</th><th>New</th><th>Reason</th><th>Details</th></tr>
                </thead>
                <tbody>
                  <tr v-for="a in detailAmendments" :key="a._id">
                    <td>{{ a.student_no || a.student_id }}</td>
                    <td>{{ a.student_name }}</td>
                    <td>{{ a.course_code }}</td>
                    <td><span class="badge bg-secondary">{{ a.original_grade }}</span></td>
                    <td><span class="badge bg-primary">{{ a.new_grade }}</span></td>
                    <td>{{ amendmentReasonLabel(a) }}</td>
                    <td class="small">{{ amendmentDetails(a) }}</td>
                  </tr>
                  <tr v-if="detailAmendments.length === 0">
                    <td colspan="7" class="text-center text-muted">No amendment details available</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Approve / Reject actions -->
            <div v-if="detailSubmission.status === 'Submitted'" class="d-flex gap-2 mt-3 pt-3 border-top">
              <button class="btn btn-danger" @click="openReject(detailSubmission._id); detailModal = false">
                <i class="bi bi-x-circle me-1"></i>Reject
              </button>
              <button class="btn btn-success ms-auto" @click="handleApprove(detailSubmission._id); detailModal = false">
                <i class="bi bi-check-circle me-1"></i>Approve
              </button>
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

<style scoped>
h2 { color: #0066CC; font-weight: 700; }

.stat-card {
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 10px;
  background: #fff;
  transition: all 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0,102,204,0.12);
}
.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.5rem;
}
.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.table th {
  font-weight: 600;
  font-size: 0.85rem;
  color: #0066CC;
  text-transform: uppercase;
  padding: 0.75rem;
  border-bottom: 2px solid #e9ecef;
}
.btn-success {
  background: #00A86B;
  border-color: #00A86B;
  color: #fff;
}
.btn-success:hover {
  background: #088a4f;
  border-color: #088a4f;
  color: #fff;
}
</style>
