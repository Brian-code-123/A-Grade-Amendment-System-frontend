<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useAmendmentStore } from '@/stores/amendmentStore'
import { useAuthStore } from '@/stores/authStore'
import { generateGradeAmendmentPDF, generateGradeAmendmentPDFWithTemplate, removeSignatureBackground } from '@/services/pdfTemplate'
import { sendApprovalEmail, sendRejectionEmail } from '@/services/emailService'

const subStore = useSubmissionStore()
const amStore = useAmendmentStore()
const auth = useAuthStore()

const successMsg = ref('')
const errorMsg = ref('')
const rejectModal = ref(false)
const rejectId = ref(null)
const rejectReason = ref('')
const detailModal = ref(false)
const detailSubmission = ref(null)
const detailAmendments = ref([])

/* ── Filter & batch selection ──────────────────────────────────── */
const statusFilter = ref('All')
const selectedIds = reactive([])

const filteredSubmissions = computed(() => {
  if (statusFilter.value === 'All') return subStore.submissions
  if (statusFilter.value === 'Printed') {
    return subStore.submissions.filter(s => s.printed === true)
  }
  return subStore.submissions.filter(s => s.status === statusFilter.value)
})

const allVisibleSelected = computed(() => {
  return filteredSubmissions.value.length > 0 && filteredSubmissions.value.every(s => selectedIds.includes(s._id))
})

function toggleSelectAll() {
  if (allVisibleSelected.value) {
    filteredSubmissions.value.forEach(s => {
      const idx = selectedIds.indexOf(s._id)
      if (idx >= 0) selectedIds.splice(idx, 1)
    })
  } else {
    filteredSubmissions.value.forEach(s => {
      if (!selectedIds.includes(s._id)) selectedIds.push(s._id)
    })
  }
}

function toggleSelect(id) {
  const idx = selectedIds.indexOf(id)
  if (idx >= 0) {
    selectedIds.splice(idx, 1)
  } else {
    selectedIds.push(id)
  }
}

const selectedSubmittedCount = computed(() => {
  return selectedIds.filter(id => {
    const s = subStore.submissions.find(s => s._id === id)
    return s && s.status === 'Submitted'
  }).length
})

const selectedApprovedCount = computed(() => {
  return selectedIds.filter(id => {
    const s = subStore.submissions.find(s => s._id === id)
    return s && s.status === 'Approved'
  }).length
})

/* ── Single actions ────────────────────────────────────────────── */
async function handleApprove(id) {
  if (!confirm('Approve this submission?')) return
  try {
    const s = subStore.submissions.find(s => s._id === id)
    await subStore.approveSubmission(id)
    successMsg.value = 'Submission approved'
    if (s) sendApprovalEmail(s, auth.user).catch(() => {})
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
    successMsg.value = 'Submission rejected'
    rejectModal.value = false
    if (s) sendRejectionEmail(s, rejectReason.value, auth.user).catch(() => {})
  } catch (e) { errorMsg.value = e.message }
}

function resolveAmendmentsForSubmission(submission) {
  if (submission?.amendment_ids && amStore.amendments.length) {
    return submission.amendment_ids.map(aid => amStore.amendments.find(a => a._id === aid)).filter(Boolean)
  }
  return submission?.amendments || []
}

function buildPdfData(a, cleanSig) {
  return {
    academicYear: a.academic_year || '',
    term: a.term || '',
    studentNo: a.student_no || a.student_id || '',
    studentName: a.student_name || '',
    courseCode: a.course_code || '',
    courseTitle: a.course_title || '',
    originalGrade: a.original_grade || '',
    newGrade: a.new_grade || '',
    reasonType: a.reason_type || '',
    reasonDetails: a.reason_details || '',
    appealGrounds: a.appeal_grounds || '',
    appealDetails: a.appeal_details || '',
    instructorName: a.instructor_name || '',
    instructorSignature: cleanSig || null,
    instructorDate: new Date().toLocaleDateString(),
    department: a.department || '',
    endorsementSignature: cleanSig || null,
    endorserName: auth.user?.name || '',
    endorsementDate: new Date().toLocaleDateString()
  }
}

async function handlePrint(id) {
  try {
    await subStore.markPrinted(id)
    const submission = subStore.submissions.find(s => s._id === id)
    const amendments = resolveAmendmentsForSubmission(submission)
    if (amendments.length === 0) { errorMsg.value = 'No amendments found'; return }

    const cleanSig = auth.user?.signature
      ? await removeSignatureBackground(auth.user.signature)
      : null

    if (amendments.length === 1) {
      const pdfData = buildPdfData(amendments[0], cleanSig)
      let doc
      try {
        const pdfDocObj = await generateGradeAmendmentPDFWithTemplate(pdfData)
        doc = await pdfDocObj.save()
      } catch (err) {
        console.warn('Template PDF failed, using fallback:', err)
        doc = generateGradeAmendmentPDF(pdfData).output('blob')
      }
      
      const pdfBlob = doc instanceof Blob ? doc : new Blob([doc], { type: 'application/pdf' })
      const pdfUrl = URL.createObjectURL(pdfBlob)
      const w = window.open(pdfUrl, '_blank')
      if (w) w.addEventListener('load', () => w.print())
    } else {
      for (const a of amendments) {
        const pdfData = buildPdfData(a, cleanSig)
        let doc
        try {
          const pdfDocObj = await generateGradeAmendmentPDFWithTemplate(pdfData)
          doc = await pdfDocObj.save()
        } catch (err) {
          console.warn('Template PDF failed, using fallback:', err)
          doc = generateGradeAmendmentPDF(pdfData).output('blob')
        }
        
        const pdfBlob = doc instanceof Blob ? doc : new Blob([doc], { type: 'application/pdf' })
        const filename = `Grade Amendments - ${a.student_no || a.student_id || 'Form'}.pdf`
        const link = document.createElement('a')
        link.href = URL.createObjectURL(pdfBlob)
        link.download = filename
        link.click()
        URL.revokeObjectURL(link.href)
      }
    }
    successMsg.value = `Printed ${amendments.length} Grade Amendment Form(s)`
  } catch (e) { errorMsg.value = e.message }
}

/* ── Batch actions ─────────────────────────────────────────────── */
async function batchApprove() {
  const ids = selectedIds.filter(id => {
    const s = subStore.submissions.find(s => s._id === id)
    return s && s.status === 'Submitted'
  })
  if (ids.length === 0) { errorMsg.value = 'No submitted items selected'; return }
  if (!confirm(`Approve ${ids.length} submission(s)?`)) return

  let count = 0
  for (const id of ids) {
    try {
      const s = subStore.submissions.find(s => s._id === id)
      await subStore.approveSubmission(id)
      if (s) sendApprovalEmail(s, auth.user).catch(() => {})
      count++
    } catch { /* continue */ }
  }
  selectedIds.splice(0)
  successMsg.value = `${count} submission(s) approved`
}

async function batchPrint() {
  const ids = selectedIds.filter(id => {
    const s = subStore.submissions.find(s => s._id === id)
    return s && s.status === 'Approved'
  })
  if (ids.length === 0) { errorMsg.value = 'No approved items selected for printing'; return }

  const cleanSig = auth.user?.signature
    ? await removeSignatureBackground(auth.user.signature)
    : null

  let totalForms = 0
  for (const id of ids) {
    try {
      await subStore.markPrinted(id)
      const sub = subStore.submissions.find(s => s._id === id)
      const amendments = resolveAmendmentsForSubmission(sub)
      for (const a of amendments) {
        const pdfData = buildPdfData(a, cleanSig)
        let doc
        try {
          const pdfDocObj = await generateGradeAmendmentPDFWithTemplate(pdfData)
          doc = await pdfDocObj.save()
        } catch (err) {
          console.warn('Template PDF failed, using fallback:', err)
          doc = generateGradeAmendmentPDF(pdfData).output('blob')
        }
        
        const pdfBlob = doc instanceof Blob ? doc : new Blob([doc], { type: 'application/pdf' })
        const filename = `Grade Amendments - ${a.student_no || a.student_id || 'Form'}.pdf`
        const link = document.createElement('a')
        link.href = URL.createObjectURL(pdfBlob)
        link.download = filename
        link.click()
        URL.revokeObjectURL(link.href)
        totalForms++
      }
    } catch { /* continue */ }
  }
  selectedIds.splice(0)
  successMsg.value = `Downloaded ${totalForms} Grade Amendment Form(s)`
}

async function viewDetail(id) {
  await subStore.fetchSubmission(id)
  detailSubmission.value = subStore.currentSubmission
  detailAmendments.value = resolveAmendmentsForSubmission(detailSubmission.value)
  detailModal.value = true
}

const statusBadge = (status) => {
  const map = { Draft: 'bg-warning text-dark', Submitted: 'bg-info', Approved: 'bg-success', Rejected: 'bg-danger' }
  return map[status] || 'bg-secondary'
}

const filterBtnClass = (opt) => {
  const map = { All: 'btn-dark', Submitted: 'btn-info', Approved: 'btn-success', Draft: 'btn-warning', Rejected: 'btn-danger', Printed: 'btn-purple' }
  return map[opt] || 'btn-dark'
}

onMounted(() => {
  subStore.fetchSubmissions()
  amStore.fetchAmendments()
})
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

    <!-- Filter toolbar -->
    <div class="card shadow-sm mb-3 border-0" style="background:linear-gradient(135deg,#f8f9fa 0%,#e9ecef 100%)">
      <div class="card-body py-3">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <!-- Status filter pills -->
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span class="text-muted fw-semibold small me-1"><i class="bi bi-funnel"></i> Filter:</span>
            <button
              v-for="opt in ['All','Submitted','Approved','Draft','Rejected','Printed']"
              :key="opt"
              class="btn btn-sm rounded-pill px-3"
              :class="statusFilter === opt ? filterBtnClass(opt) : 'btn-outline-secondary'"
              @click="statusFilter = opt"
            >
              {{ opt }}
              <span v-if="opt !== 'All'" class="badge rounded-pill ms-1" :class="statusFilter === opt ? 'bg-white text-dark' : 'bg-secondary bg-opacity-25'">
                {{ opt === 'Printed' ? subStore.submissions.filter(s => s.printed === true).length : subStore.submissions.filter(s => s.status === opt).length }}
              </span>
              <span v-else class="badge rounded-pill ms-1" :class="statusFilter === 'All' ? 'bg-white text-dark' : 'bg-secondary bg-opacity-25'">
                {{ subStore.submissions.length }}
              </span>
            </button>
          </div>
          <!-- Batch actions -->
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span v-if="selectedIds.length > 0" class="badge bg-dark rounded-pill px-3 py-2">
              <i class="bi bi-check2-square me-1"></i>{{ selectedIds.length }} selected
            </span>
            <button
              v-if="selectedSubmittedCount > 0"
              class="btn btn-sm btn-success rounded-pill px-3"
              @click="batchApprove"
            >
              <i class="bi bi-check-all me-1"></i>Approve ({{ selectedSubmittedCount }})
            </button>
            <button
              v-if="selectedApprovedCount > 0"
              class="btn btn-sm btn-primary rounded-pill px-3"
              @click="batchPrint"
            >
              <i class="bi bi-printer me-1"></i>Print ({{ selectedApprovedCount }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-header fw-bold">
        <i class="bi bi-table me-1"></i> Submissions for Review
        <span class="badge bg-primary ms-2">{{ filteredSubmissions.length }}</span>
      </div>
      <div class="card-body p-0">
        <div v-if="subStore.loading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
        <div v-else-if="filteredSubmissions.length === 0" class="text-center text-muted py-4">No submissions</div>
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th style="width:40px">
                  <input type="checkbox" class="form-check-input" :checked="allVisibleSelected" @change="toggleSelectAll" />
                </th>
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
              <tr v-for="s in filteredSubmissions" :key="s._id" :class="{ 'table-active': selectedIds.includes(s._id) }">
                <td>
                  <input type="checkbox" class="form-check-input" :checked="selectedIds.includes(s._id)" @change="toggleSelect(s._id)" />
                </td>
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
                    <button v-if="s.status === 'Approved'" class="btn btn-outline-primary" @click="handlePrint(s._id)"><i class="bi bi-printer"></i> Print</button>
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
            <p v-if="detailSubmission.rejection_reason"><strong>Rejection Reason:</strong> <span class="text-danger">{{ detailSubmission.rejection_reason }}</span></p>
            <h6 class="fw-bold mt-3">Amendments ({{ detailAmendments.length }})</h6>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead><tr><th>Student No.</th><th>Name</th><th>Course</th><th>Original</th><th>New</th><th>Reason</th></tr></thead>
                <tbody>
                  <tr v-for="a in detailAmendments" :key="a._id">
                    <td>{{ a.student_no || a.student_id }}</td>
                    <td>{{ a.student_name }}</td>
                    <td>{{ a.course_code }}</td>
                    <td><span class="badge bg-secondary">{{ a.original_grade }}</span></td>
                    <td><span class="badge bg-primary">{{ a.new_grade }}</span></td>
                    <td>{{ a.reason_type || a.reason || '-' }}</td>
                  </tr>
                  <tr v-if="detailAmendments.length === 0">
                    <td colspan="6" class="text-center text-muted">No amendment details available</td>
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
