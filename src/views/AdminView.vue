<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useAmendmentStore } from '@/stores/amendmentStore'
import { useAuthStore } from '@/stores/authStore'
import { useArchiveStore } from '@/stores/archiveStore'
import { generateGradeAmendmentPDF, generateGradeAmendmentPDFWithTemplate, removeSignatureBackground } from '@/services/pdfTemplate'
import { sendApprovalEmail, sendRejectionEmail } from '@/services/emailService'

const vueRouter = useRouter()
const subStore = useSubmissionStore()
const amStore = useAmendmentStore()
const auth = useAuthStore()
const archiveStore = useArchiveStore()

const successMsg = ref('')
const errorMsg = ref('')
const rejectModal = ref(false)
const rejectId = ref(null)
const rejectReason = ref('')
const detailModal = ref(false)
const detailSubmission = ref(null)
const detailAmendments = ref([])

/* ══════════════════════════════════════════════════════════════════ */
/* AD HOC ANNOUNCEMENT MANAGEMENT */
/* ══════════════════════════════════════════════════════════════════ */
const adminTab = ref('submissions') // 'submissions' | 'announcements'

/* ══════════════════════════════════════════════════════════════════ */
/* SEMESTER & ARCHIVE MANAGEMENT */
/* ══════════════════════════════════════════════════════════════════ */
const showSemesterSetup = ref(false)
const semForm = ref({ name: '', startDate: '', endDate: '' })
const archiveSemId = ref('')

function addSemester() {
  if (!semForm.value.name || !semForm.value.startDate || !semForm.value.endDate) {
    errorMsg.value = 'Please fill in semester name, start date & end date'
    return
  }
  archiveStore.addSemester(semForm.value.name, semForm.value.startDate, semForm.value.endDate)
  successMsg.value = `Semester "${semForm.value.name}" created`
  semForm.value = { name: '', startDate: '', endDate: '' }
}

function deleteSemester(id) {
  const sem = archiveStore.semesters.find(s => s.id === id)
  if (!confirm(`Delete semester "${sem?.name}"? Archived records under this semester will be unarchived.`)) return
  archiveStore.removeSemester(id)
  successMsg.value = 'Semester deleted'
}

function archiveSelectedSemester() {
  if (!archiveSemId.value) { errorMsg.value = 'Please select a semester to archive'; return }
  const count = archiveStore.archiveBySemester(archiveSemId.value, subStore.submissions)
  if (count === 0) {
    errorMsg.value = 'No matching submissions found in that semester date range (or already archived)'
  } else {
    successMsg.value = `${count} submission(s) archived`
  }
  archiveSemId.value = ''
}

const announcements = ref([
  { id: 1, category: 'System Announcements/Messages', type: 'info', title: 'System Update', message: 'Grade Amendment System has been updated with new features and improvements.', date: '2026-03-10' },
  { id: 2, category: 'Latest Policy Updates', type: 'warning', title: 'Grade Amendment Policy Update', message: 'New deadline for grade amendments: 30 days from course end date.', date: '2026-03-07' },
  { id: 3, category: 'System Maintenance Notification', type: 'danger', title: 'Scheduled Maintenance', message: 'System maintenance every Sunday 23:00-24:00 (HKT). Please plan accordingly.', date: '2026-03-10' }
])

const announcementForm = ref({
  category: 'System Announcements/Messages',
  type: 'info',
  title: '',
  message: ''
})

const announcementCategories = ['System Announcements/Messages', 'Latest Policy Updates', 'System Maintenance Notification']

function resetAnnouncementForm() {
  announcementForm.value = {
    category: 'System Announcements/Messages',
    type: 'info',
    title: '',
    message: ''
  }
}

function createAnnouncement() {
  if (!announcementForm.value.title || !announcementForm.value.message) {
    errorMsg.value = 'Please fill in title and message'
    return
  }

  const newAnnouncement = {
    id: Math.max(...announcements.value.map(a => a.id), 0) + 1,
    category: announcementForm.value.category,
    type: announcementForm.value.type,
    title: announcementForm.value.title,
    message: announcementForm.value.message,
    date: new Date().toISOString().split('T')[0]
  }

  announcements.value.unshift(newAnnouncement)
  successMsg.value = 'Announcement created successfully'
  resetAnnouncementForm()
}

function deleteAnnouncement(id) {
  if (!confirm('Delete this announcement?')) return
  announcements.value = announcements.value.filter(a => a.id !== id)
  successMsg.value = 'Announcement deleted'
}

function getAnnouncementBadgeClass(type) {
  const map = { 'info': 'bg-info', 'warning': 'bg-warning text-dark', 'danger': 'bg-danger' }
  return map[type] || 'bg-secondary'
}

/* ── Filter & batch selection ──────────────────────────────────── */
const statusFilter = ref('All')
const searchQuery = ref('')
const selectedIds = reactive([])

const filteredSubmissions = computed(() => {
  // Exclude archived submissions
  let result = subStore.submissions.filter(s => !archiveStore.isArchived(s._id))

  // Filter by status (including Printed)
  if (statusFilter.value === 'Printed') {
    result = result.filter(s => s.printed === true)
  } else if (statusFilter.value === 'Approved') {
    // Approved filter: only show approved but NOT yet printed
    result = result.filter(s => s.status === 'Approved' && !s.printed)
  } else if (statusFilter.value === 'All') {
    // All filter: exclude nothing, but printed ones show as Printed
  } else {
    result = result.filter(s => s.status === statusFilter.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.submitted_by_name.toLowerCase().includes(q) ||
      s._id.toLowerCase().includes(q)
    )
  }

  return result
})

const stats = computed(() => {
  const all = subStore.submissions.filter(s => !archiveStore.isArchived(s._id))
  return {
    total: all.length,
    submitted: all.filter(s => s.status === 'Submitted').length,
    approved: all.filter(s => s.status === 'Approved').length,
    rejected: all.filter(s => s.status === 'Rejected').length,
    draft: all.filter(s => s.status === 'Draft').length,
    printed: all.filter(s => s.printed).length
  }
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

const pickFieldValue = (sources, keys) => {
  for (const src of sources) {
    if (!src) continue
    for (const key of keys) {
      if (!key) continue
      const value = src[key]
      if (value !== undefined && value !== null && value !== '') {
        return value
      }
    }
  }
  return null
}

const formatDateValue = (value, fallback) => {
  if (!value) return fallback
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString()
  return typeof value === 'string' ? value : fallback
}

function buildPdfData(a, cleanSig, submission) {
  const sources = submission ? [a, submission] : [a]
  const instructorSignature = pickFieldValue(sources, [
    'instructor_signature',
    'instructorSignature',
    'teacher_signature',
    'teacherSignature',
    'faculty_signature',
    'facultySignature',
    'signature'
  ]) || cleanSig || null
  const endorsementSignature = pickFieldValue(sources, [
    'endorsement_signature',
    'endorsementSignature',
    'programme_director_signature',
    'programmeDirectorSignature',
    'director_signature',
    'directorSignature',
    'pd_signature',
    'pdSignature',
    'approver_signature',
    'approverSignature'
  ]) || cleanSig || null
  const instructorDateRaw = pickFieldValue(sources, [
    'instructor_date',
    'instructorDate',
    'submitted_at',
    'amendmentDate',
    'submissionDate'
  ])
  const endorsementDateRaw = pickFieldValue(sources, [
    'endorsement_date',
    'endorsementDate',
    'programme_director_date',
    'programmeDirectorDate',
    'directorDate',
    'pd_date',
    'pdDate',
    'approved_at'
  ])
  const instructorName = pickFieldValue(sources, [
    'instructor_name',
    'instructorName',
    'course_instructor',
    'teacherName',
    'submitted_by_name'
  ]) || a.instructor_name || ''
  const endorserName = pickFieldValue(sources, [
    'endorser_name',
    'endorserName',
    'programme_director_name',
    'programmeDirectorName',
    'directorName',
    'pd_name',
    'pdName',
    'approved_by_name',
    'approvedByName'
  ]) || auth.user?.name || ''
  const instructorDate = formatDateValue(instructorDateRaw, new Date().toLocaleDateString())
  const endorsementDate = formatDateValue(endorsementDateRaw, new Date().toLocaleDateString())

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
    instructorName,
    instructorSignature,
    instructorDate,
    department: a.department || '',
    endorsementSignature,
    endorserName,
    endorsementDate
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
      const pdfData = buildPdfData(amendments[0], cleanSig, submission)
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
        const pdfData = buildPdfData(a, cleanSig, submission)
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
        const pdfData = buildPdfData(a, cleanSig, sub)
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

const statusBadge = (status, printed = false) => {
  if (printed) return 'bg-secondary text-white'
  const map = { Draft: 'bg-warning text-dark', Submitted: 'bg-info', Approved: 'bg-success', Rejected: 'bg-danger' }
  return map[status] || 'bg-secondary'
}

const displayStatus = (status, printed = false) => {
  if (printed) return 'Printed'
  return status === 'Submitted' ? 'Pending' : status
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
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h2 class="fw-bold mb-1">Submissions Management</h2>
        <small class="text-muted">Review, approve, and manage grade amendment submissions</small>
      </div>
      <div class="badge bg-primary px-3 py-2 rounded-pill" style="font-size:0.85rem">
        <i class="bi bi-shield-lock me-1"></i>Admin Panel
      </div>
    </div>

    <!-- Alerts -->
    <div v-if="successMsg" class="alert alert-success alert-dismissible fade show">
      <i class="bi bi-check-circle me-2"></i>{{ successMsg }}<button class="btn-close" @click="successMsg = ''"></button>
    </div>
    <div v-if="errorMsg" class="alert alert-danger alert-dismissible fade show">
      <i class="bi bi-exclamation-circle me-2"></i>{{ errorMsg }}<button class="btn-close" @click="errorMsg = ''"></button>
    </div>

    <!-- Tab Navigation -->
    <ul class="nav nav-tabs mb-4" role="tablist" style="border-bottom:2px solid #e9ecef">
      <li class="nav-item" role="presentation">
        <button class="nav-link fw-semibold" :class="{ active: adminTab === 'submissions' }" @click="adminTab = 'submissions'">
          <i class="bi bi-table me-2"></i>Submissions <span class="badge bg-secondary ms-2">{{ stats.total }}</span>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link fw-semibold" :class="{ active: adminTab === 'announcements' }" @click="adminTab = 'announcements'">
          <i class="bi bi-megaphone me-2"></i>System Announcements <span class="badge bg-secondary ms-2">{{ announcements.length }}</span>
        </button>
      </li>
    </ul>

    <!-- SUBMISSIONS TAB -->
    <div v-if="adminTab === 'submissions'">

      <!-- Statistics Cards -->
      <div class="row g-2 mb-4">
        <div class="col-6 col-sm-4 col-lg-2">
          <div class="card text-center stat-card">
            <div class="card-body">
              <div class="stat-number text-primary">{{ stats.total }}</div>
              <div class="stat-label">Total</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-sm-4 col-lg-2">
          <div class="card text-center stat-card">
            <div class="card-body">
              <div class="stat-number text-info">{{ stats.submitted }}</div>
              <div class="stat-label">Pending</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-sm-4 col-lg-2">
          <div class="card text-center stat-card">
            <div class="card-body">
              <div class="stat-number text-success">{{ stats.approved }}</div>
              <div class="stat-label">Approved</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-sm-4 col-lg-2">
          <div class="card text-center stat-card">
            <div class="card-body">
              <div class="stat-number text-danger">{{ stats.rejected }}</div>
              <div class="stat-label">Rejected</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-sm-4 col-lg-2">
          <div class="card text-center stat-card">
            <div class="card-body">
              <div class="stat-number text-warning">{{ stats.draft }}</div>
              <div class="stat-label">Draft</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-sm-4 col-lg-2">
          <div class="card text-center stat-card">
            <div class="card-body">
              <div class="stat-number text-secondary">{{ stats.printed }}</div>
              <div class="stat-label">Printed</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Archive & Semester Management -->
      <div class="card shadow-sm mb-3 border-0" style="background:linear-gradient(135deg,#f8f9fa 0%,#e9ecef 100%)">
        <div class="card-body py-3">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-archive text-primary"></i>
              <span class="fw-semibold">Semester Archive</span>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="showSemesterSetup = !showSemesterSetup">
                <i class="bi bi-gear me-1"></i>{{ showSemesterSetup ? 'Hide' : 'Manage' }} Semesters
              </button>
              <button class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="vueRouter.push('/admin/archive')">
                <i class="bi bi-archive me-1"></i>View Archived Records
              </button>
            </div>
          </div>

          <!-- Semester Setup (toggle) -->
          <div v-if="showSemesterSetup" class="mt-3 pt-3 border-top">
            <div class="row g-2 align-items-end mb-3">
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Semester Name</label>
                <input v-model="semForm.name" type="text" class="form-control form-control-sm" placeholder="e.g. Sem 1 2025-2026" />
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Start Date</label>
                <input v-model="semForm.startDate" type="date" class="form-control form-control-sm" />
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">End Date</label>
                <input v-model="semForm.endDate" type="date" class="form-control form-control-sm" />
              </div>
              <div class="col-md-3">
                <button class="btn btn-sm btn-primary w-100" @click="addSemester">
                  <i class="bi bi-plus-circle me-1"></i>Add Semester
                </button>
              </div>
            </div>
            <div v-if="archiveStore.semesters.length > 0" class="table-responsive">
              <table class="table table-sm table-bordered mb-0">
                <thead><tr><th>Name</th><th>Start</th><th>End</th><th style="width:80px"></th></tr></thead>
                <tbody>
                  <tr v-for="sem in archiveStore.semesters" :key="sem.id">
                    <td>{{ sem.name }}</td>
                    <td>{{ sem.startDate }}</td>
                    <td>{{ sem.endDate }}</td>
                    <td><button class="btn btn-sm btn-outline-danger" @click="deleteSemester(sem.id)"><i class="bi bi-trash"></i></button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-muted small mb-0">No semesters defined yet.</p>
          </div>

          <!-- Archive Action -->
          <div v-if="archiveStore.semesters.length > 0" class="d-flex align-items-center gap-2 mt-2">
            <select v-model="archiveSemId" class="form-select form-select-sm" style="max-width:350px">
              <option value="">Select semester to archive...</option>
              <option v-for="sem in archiveStore.semesters" :key="sem.id" :value="sem.id">
                {{ sem.name }} ({{ sem.startDate }} — {{ sem.endDate }})
              </option>
            </select>
            <button class="btn btn-sm btn-warning rounded-pill px-3" :disabled="!archiveSemId" @click="archiveSelectedSemester">
              <i class="bi bi-archive me-1"></i>Archive
            </button>
          </div>
        </div>
      </div>

      <!-- Search & Filter Toolbar -->
      <div class="card shadow-sm mb-3 border-0">
        <div class="card-body py-3">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-light border-0"><i class="bi bi-search"></i></span>
                <input v-model="searchQuery" type="text" class="form-control border-0" placeholder="Search by title, contact, or ID..." />
              </div>
            </div>
            <div class="col-md-6">
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <span class="text-muted fw-semibold small"><i class="bi bi-funnel"></i> Filter:</span>
                <button
                  v-for="opt in ['All','Submitted','Approved','Draft','Rejected','Printed']"
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
          <!-- Batch Actions -->
          <div v-if="selectedIds.length > 0" class="mt-3 pt-3 border-top">
            <span class="badge bg-dark rounded-pill px-3 py-2 me-2">
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
      <!-- Submissions Table -->
      <div class="card shadow-sm">
        <div class="card-header fw-bold d-flex align-items-center justify-content-between">
          <div>
            <i class="bi bi-table me-1"></i>Submissions for Review
            <span class="badge bg-primary ms-2">{{ filteredSubmissions.length }}</span>
          </div>
          <small class="fw-normal text-muted">Showing {{ filteredSubmissions.length }} of {{ subStore.submissions.length }}</small>
        </div>
        <div class="card-body p-0">
          <div v-if="subStore.loading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
          <div v-else-if="filteredSubmissions.length === 0" class="text-center text-muted py-4">
            <i class="bi bi-inbox" style="font-size:2rem;opacity:0.3"></i>
            <p class="mt-2">No submissions found</p>
          </div>
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
                <th>Created</th>
                <th>PD Approved</th>
                <th>Admin Printed</th>
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
                <td><span class="badge" :class="statusBadge(s.status, s.printed)">{{ displayStatus(s.status, s.printed) }}</span></td>
                <td>{{ s.amendment_count || 0 }}</td>
                <td class="small">{{ new Date(s.created_at).toLocaleDateString() }}</td>
                <td class="small">{{ s.approved_at ? new Date(s.approved_at).toLocaleDateString() : '—' }}</td>
                <td class="small">{{ s.printed_at ? new Date(s.printed_at).toLocaleDateString() : '—' }}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" @click="viewDetail(s._id)" title="View Details"><i class="bi bi-eye"></i></button>
                    <button v-if="s.status === 'Approved'" class="btn btn-outline-primary" @click="handlePrint(s._id)" title="Print"><i class="bi bi-printer"></i></button>
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
            <p><strong>Status:</strong> <span class="badge" :class="statusBadge(detailSubmission.status, detailSubmission.printed)">{{ displayStatus(detailSubmission.status, detailSubmission.printed) }}</span></p>
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
            <!-- Action buttons inside modal-body so detailSubmission reactivity is guaranteed -->
            <div v-if="detailSubmission.status === 'Submitted'" class="d-flex gap-2 mt-3 pt-3 border-top">
              <button class="btn btn-danger" @click="openReject(detailSubmission._id); detailModal = false">
                <i class="bi bi-x-circle me-1"></i>Reject
              </button>
              <button class="btn btn-success ms-auto" @click="handleApprove(detailSubmission._id); detailModal = false">
                <i class="bi bi-check-circle me-1"></i>Approve
              </button>
            </div>
            <div v-if="detailSubmission.status === 'Approved'" class="d-flex gap-2 mt-3 pt-3 border-top">
              <button class="btn btn-primary ms-auto" @click="handlePrint(detailSubmission._id); detailModal = false">
                <i class="bi bi-printer me-1"></i>Print
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="detailModal = false">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ANNOUNCEMENTS TAB -->
    <div v-if="adminTab === 'announcements'">
      <div class="row g-3">
        <!-- Create Announcement Form -->
        <div class="col-lg-5">
          <div class="card shadow-sm">
            <div class="card-header fw-bold">
              <i class="bi bi-pencil-square me-2"></i>Create New Announcement
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Category</label>
                <select v-model="announcementForm.category" class="form-select form-select-sm">
                  <option v-for="cat in announcementCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Type</label>
                <select v-model="announcementForm.type" class="form-select form-select-sm">
                  <option value="info">✓ System Announcements/Messages</option>
                  <option value="warning">⚠ Latest Policy Updates</option>
                  <option value="danger">⛔ System Maintenance Notification</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Title</label>
                <input v-model="announcementForm.title" type="text" class="form-control form-control-sm" placeholder="Announcement title..." />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Message</label>
                <textarea v-model="announcementForm.message" class="form-control form-control-sm" rows="4" placeholder="Announcement message..."></textarea>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-primary btn-sm flex-grow-1" @click="createAnnouncement">
                  <i class="bi bi-check-circle me-1"></i>Publish
                </button>
                <button class="btn btn-outline-secondary btn-sm" @click="resetAnnouncementForm">
                  <i class="bi bi-arrow-clockwise me-1"></i>Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Announcements List -->
        <div class="col-lg-7">
          <div class="card shadow-sm">
            <div class="card-header fw-bold">
              <i class="bi bi-megaphone me-2"></i>Published Announcements
              <span class="badge bg-secondary ms-2">{{ announcements.length }}</span>
            </div>
            <div class="card-body" style="max-height:600px;overflow-y:auto">
              <div v-if="announcements.length === 0" class="text-center text-muted py-4">
                No announcements yet
              </div>
              <div v-for="ann in announcements" :key="ann.id" class="mb-3 pb-3 border-bottom">
                <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <span class="badge" :class="getAnnouncementBadgeClass(ann.type)">{{ ann.category }}</span>
                    <div class="fw-semibold mt-2">{{ ann.title }}</div>
                  </div>
                  <small class="text-muted flex-shrink-0">{{ ann.date }}</small>
                </div>
                <p class="text-muted small mb-2">{{ ann.message }}</p>
                <button class="btn btn-sm btn-outline-danger" @click="deleteAnnouncement(ann.id)">
                  <i class="bi bi-trash me-1"></i>Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* === HKBU COLOR SCHEME === */
:root {
  --hkbu-primary: #0066CC;
  --hkbu-secondary: #00A86B;
  --hkbu-accent: #F0A500;
}

/* Professional Admin Panel Styling */

/* === Header === */
h2 {
  color: var(--hkbu-primary);
  font-weight: 700;
}

/* === Navigation Tabs === */
.nav-tabs {
  border-bottom-color: #e9ecef !important;
}

.nav-link {
  color: #6c757d;
  border: none;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--hkbu-primary);
  border-bottom: 2px solid var(--hkbu-primary);
}

.nav-link.active {
  color: var(--hkbu-primary);
  background: transparent;
  border-bottom: 3px solid var(--hkbu-primary);
  font-weight: 600;
}

[data-bs-theme="dark"] .nav-link {
  color: #9ca3af;
}

[data-bs-theme="dark"] .nav-link.active {
  color: #0099FF;
  border-color: #0099FF;
}

/* === Stat Cards === */
.stat-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fff;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--hkbu-primary), var(--hkbu-secondary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 102, 204, 0.15);
  border-color: var(--hkbu-primary);
}

.stat-card:hover::before {
  transform: scaleX(1);
}

[data-bs-theme="dark"] .stat-card {
  background: #1e3a5f;
  border-color: rgba(0, 102, 204, 0.2);
}

[data-bs-theme="dark"] .stat-card:hover {
  background: #253a5f;
  box-shadow: 0 8px 20px rgba(0, 102, 204, 0.25);
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

[data-bs-theme="dark"] .stat-label {
  color: #9ca3af;
}

/* === Input & Form Elements === */
.input-group-text {
  border: 1px solid #e9ecef;
  background: #f8f9fa !important;
  color: #6c757d;
}

.form-control {
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: var(--hkbu-primary);
  box-shadow: 0 0 0 0.2rem rgba(0, 102, 204, 0.15);
}

[data-bs-theme="dark"] .form-control {
  background: #0f1e30;
  border-color: rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
}

[data-bs-theme="dark"] .form-control:focus {
  border-color: #0099FF;
  box-shadow: 0 0 0 0.2rem rgba(0, 153, 255, 0.25);
}

[data-bs-theme="dark"] .input-group-text {
  background: #0f1e30 !important;
  border-color: rgba(255, 255, 255, 0.1);
  color: #9ca3af;
}

/* === Filter Buttons === */
.btn-sm {
  transition: all 0.2s ease;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  border-color: #6c757d;
  color: white;
}

/* === Table === */
.table thead {
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.table th {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--hkbu-primary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 0.75rem;
  border-bottom: 2px solid #e9ecef;
}

[data-bs-theme="dark"] .table th {
  background: #0f1e30;
  color: #0099FF;
  border-color: rgba(255, 255, 255, 0.1);
}

[data-bs-theme="dark"] .table {
  color: #e5e7eb;
}

.table tbody tr {
  transition: all 0.15s ease;
}

.table tbody tr:hover {
  background: rgba(0, 102, 204, 0.04);
}

[data-bs-theme="dark"] .table tbody tr:hover {
  background: rgba(0, 153, 255, 0.08);
}

.table tbody tr.table-active {
  background: rgba(0, 102, 204, 0.12) !important;
  border-left: 3px solid var(--hkbu-primary);
}

[data-bs-theme="dark"] .table tbody tr.table-active {
  background: rgba(0, 153, 255, 0.15) !important;
}

.table td {
  vertical-align: middle;
  padding: 0.75rem;
  border-color: rgba(0, 0, 0, 0.05);
}

[data-bs-theme="dark"] .table td {
  border-color: rgba(255, 255, 255, 0.05);
}

/* === Badges === */
.badge {
  font-weight: 600;
  padding: 0.35rem 0.6rem;
  font-size: 0.75rem;
  letter-spacing: 0.3px;
}

.bg-info {
  background-color: #0099CC !important;
}

[data-bs-theme="dark"] .bg-info {
  background-color: #00CCFF !important;
}

/* === Cards === */
.card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  background: #fff;
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.08);
}

[data-bs-theme="dark"] .card {
  background: #152338;
  border-color: rgba(255, 255, 255, 0.08);
}

[data-bs-theme="dark"] .card:hover {
  box-shadow: 0 4px 12px rgba(0, 153, 255, 0.1);
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  font-weight: 600;
  color: var(--hkbu-primary);
}

[data-bs-theme="dark"] .card-header {
  background: #0f1e30;
  border-color: rgba(255, 255, 255, 0.08);
  color: #0099FF;
}

/* === Button Styling === */
.btn-success {
  background: #00A86B;
  border-color: #00A86B;
  color: #fff;
}

.btn-success:hover {
  background: #088a4f;
  border-color: #088a4f;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 168, 107, 0.2);
}

.btn-primary {
  background: var(--hkbu-primary);
  border-color: var(--hkbu-primary);
}

.btn-primary:hover {
  background: #0052a3;
  border-color: #0052a3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 102, 204, 0.2);
}

/* === Modal === */
.modal {
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  border: 1px solid rgba(0, 102, 204, 0.1);
  border-radius: 10px;
}

[data-bs-theme="dark"] .modal-content {
  background: #152338;
  border-color: rgba(0, 102, 204, 0.2);
}

.modal-header {
  border-bottom: 2px solid rgba(0, 102, 204, 0.1);
  background: #f8f9fa;
}

[data-bs-theme="dark"] .modal-header {
  background: #0f1e30;
  border-color: rgba(0, 102, 204, 0.2);
}

/* === Announcements === */
.ann-row {
  border-left-width: 3px !important;
  padding: 0.75rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.ann-row:hover {
  background: rgba(0, 102, 204, 0.04);
  transform: translateX(2px);
}

[data-bs-theme="dark"] .ann-row:hover {
  background: rgba(0, 153, 255, 0.08);
}
</style>
