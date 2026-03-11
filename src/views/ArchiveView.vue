<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useArchiveStore } from '@/stores/archiveStore'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useAmendmentStore } from '@/stores/amendmentStore'

const router = useRouter()
const archiveStore = useArchiveStore()
const subStore = useSubmissionStore()
const amStore = useAmendmentStore()

const selectedSemester = ref('')
const successMsg = ref('')

const archivedSubmissions = computed(() => {
  return archiveStore.getArchivedSubmissions(subStore.submissions, selectedSemester.value || undefined)
})

function unarchiveSelected(ids) {
  if (!confirm(`Unarchive ${ids.length} submission(s)? They will return to the main submissions list.`)) return
  archiveStore.unarchive(ids)
  successMsg.value = `${ids.length} submission(s) unarchived`
}

function unarchiveSingle(id) {
  unarchiveSelected([id])
}

const statusBadge = (status, printed = false) => {
  if (printed) return 'bg-secondary text-white'
  const map = { Draft: 'bg-warning text-dark', Submitted: 'bg-info', Approved: 'bg-success', Rejected: 'bg-danger' }
  return map[status] || 'bg-secondary'
}

const displayStatus = (status, printed = false) => {
  if (printed) return 'Printed'
  return status === 'Submitted' ? 'Pending' : status
}

onMounted(() => {
  subStore.fetchSubmissions()
  amStore.fetchAmendments()
})
</script>

<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h2 class="fw-bold mb-1"><i class="bi bi-archive me-2"></i>Archived Submissions</h2>
        <small class="text-muted">View and manage archived grade amendment submissions by semester</small>
      </div>
      <button class="btn btn-outline-secondary rounded-pill px-3" @click="router.push('/admin')">
        <i class="bi bi-arrow-left me-1"></i>Back to Admin
      </button>
    </div>

    <!-- Alert -->
    <div v-if="successMsg" class="alert alert-success alert-dismissible fade show">
      <i class="bi bi-check-circle me-2"></i>{{ successMsg }}<button class="btn-close" @click="successMsg = ''"></button>
    </div>

    <!-- Semester Filter -->
    <div class="card shadow-sm mb-4">
      <div class="card-body py-3">
        <div class="row align-items-center g-3">
          <div class="col-auto">
            <label class="fw-semibold small text-muted"><i class="bi bi-funnel me-1"></i>Filter by Semester:</label>
          </div>
          <div class="col-md-4">
            <select v-model="selectedSemester" class="form-select form-select-sm">
              <option value="">All Semesters</option>
              <option v-for="sem in archiveStore.semesters" :key="sem.id" :value="sem.id">
                {{ sem.name }} ({{ sem.startDate }} — {{ sem.endDate }})
              </option>
            </select>
          </div>
          <div class="col-auto">
            <span class="badge bg-dark rounded-pill px-3 py-2">
              {{ archivedSubmissions.length }} record(s)
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Archived Submissions Table -->
    <div class="card shadow-sm">
      <div class="card-header fw-bold">
        <i class="bi bi-archive me-1"></i>Archived Records
        <span class="badge bg-primary ms-2">{{ archivedSubmissions.length }}</span>
      </div>
      <div class="card-body p-0">
        <div v-if="archivedSubmissions.length === 0" class="text-center text-muted py-5">
          <i class="bi bi-archive" style="font-size:2.5rem;opacity:0.3"></i>
          <p class="mt-2">No archived submissions found</p>
          <p v-if="archiveStore.semesters.length === 0" class="small">Go to Admin panel to define semesters and archive submissions.</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th>Title</th>
                <th>Submitted By</th>
                <th>Status</th>
                <th>Amendments</th>
                <th>Created</th>
                <th>PD Approved</th>
                <th>Admin Printed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in archivedSubmissions" :key="s._id">
                <td class="fw-semibold">{{ s.title }}</td>
                <td>{{ s.submitted_by_name }}</td>
                <td><span class="badge" :class="statusBadge(s.status, s.printed)">{{ displayStatus(s.status, s.printed) }}</span></td>
                <td>{{ s.amendment_count || 0 }}</td>
                <td class="small">{{ new Date(s.created_at).toLocaleDateString() }}</td>
                <td class="small">{{ s.approved_at ? new Date(s.approved_at).toLocaleDateString() : '—' }}</td>
                <td class="small">{{ s.printed_at ? new Date(s.printed_at).toLocaleDateString() : '—' }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-warning" @click="unarchiveSingle(s._id)" title="Unarchive">
                    <i class="bi bi-box-arrow-up me-1"></i>Unarchive
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 { color: #0066CC; font-weight: 700; }
.card { border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; }
.card-header { background: #f8f9fa; border-bottom: 1px solid rgba(0,0,0,0.08); color: #0066CC; font-weight: 600; }
.table th { font-weight: 600; font-size: 0.85rem; color: #0066CC; text-transform: uppercase; letter-spacing: 0.3px; padding: 0.75rem; }
.table td { vertical-align: middle; padding: 0.75rem; }
[data-bs-theme="dark"] h2 { color: #0099FF; }
[data-bs-theme="dark"] .card { background: #152338; border-color: rgba(255,255,255,0.08); }
[data-bs-theme="dark"] .card-header { background: #0f1e30; color: #0099FF; border-color: rgba(255,255,255,0.08); }
[data-bs-theme="dark"] .table th { color: #0099FF; background: #0f1e30; }
[data-bs-theme="dark"] .table { color: #e5e7eb; }
</style>
