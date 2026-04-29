<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAmendmentStore } from '@/stores/amendmentStore'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useAuthStore } from '@/stores/authStore'
import { downloadTemplate, downloadFilledForm } from '@/services/pdfTemplate'
import SignaturePrompt from '@/components/SignaturePrompt.vue'

const store = useAmendmentStore()
const subStore = useSubmissionStore()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const canModifyAmendments = computed(() => !auth.isAdmin)
const isDemoSession = computed(() => auth.token?.startsWith('demo_token_'))
const requiresSignatureForNewCase = computed(() => canModifyAmendments.value && !isDemoSession.value && !auth.user?.signature)

const showForm = ref(false)
const editingId = ref(null)
const courseCodeFilter = ref('')
const termFilter = ref('')
const statusFilter = ref('')
const sortOrder = ref('oldest') // 'oldest' or 'newest'

const VALID_GRADES = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','F','I','NR','PR','YR','W','P','NP']

const REASON_OPTIONS = [
  { value: 'conversion', label: 'Conversion of temporary grade (I, NR, PR, YR)' },
  { value: 'makeup', label: 'Make up examination' },
  { value: 'supplementary', label: 'Supplementary examination' },
  { value: 'review', label: 'Review initiated by academic staff' },
  { value: 'appeal', label: 'Appeal by student' },
  { value: 'others', label: 'Others' }
]

const currentYear = new Date().getFullYear()

const blankForm = () => ({
  academicYear: currentYear - 1 + '-' + currentYear,
  term: '1',
  studentNo: '',
  studentName: '',
  courseCode: '',
  courseTitle: '',
  originalGrade: '',
  newGrade: '',
  reasonType: '',
  reasonDetails: '',
  appealGrounds: '',
  appealDetails: '',
  instructorName: '',
  department: ''
})

const mapAmendmentToForm = (a = {}) => ({
  academicYear: a.academic_year || blankForm().academicYear,
  term: a.term || '1',
  studentNo: a.student_no || a.student_id || '',
  studentName: a.student_name || '',
  courseCode: a.course_code || '',
  courseTitle: a.course_title || '',
  originalGrade: a.original_grade || '',
  newGrade: a.new_grade || '',
  reasonType: a.reason_type || '',
  reasonDetails: a.reason_details || a.reason || '',
  appealGrounds: a.appeal_grounds || '',
  appealDetails: a.appeal_details || '',
  instructorName: a.instructor_name || '',
  department: a.department || ''
})

const form = ref(blankForm())
const formErrors = ref({})
const successMsg = ref('')
const errorMsg = ref('')
const showPreview = ref(false)
const isSubmitting = ref(false)
const editingRejectContext = ref({
  status: '',
  reason: '',
  remarks: ''
})

const isEditingRejected = computed(() => editingRejectContext.value.status === 'Rejected')

function firstNonEmptyField(obj, keys) {
  if (!obj) return ''
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function resetForm() {
  form.value = blankForm()
  formErrors.value = {}
  editingId.value = null
  editingRejectContext.value = { status: '', reason: '', remarks: '' }
}

function promptSignatureSetup() {
  const shouldSetup = confirm('Please set up your digital signature before creating a new amendment case. Go to Signature Setup now?')
  if (shouldSetup) {
    router.push('/signature-setup')
  }
}

function canStartNewCase() {
  if (!requiresSignatureForNewCase.value) return true
  errorMsg.value = 'Please set up your digital signature before creating a new amendment case.'
  promptSignatureSetup()
  return false
}

function openNewAmendmentForm() {
  if (!canModifyAmendments.value) {
    errorMsg.value = 'Admin accounts can view amendment requests only.'
    return
  }

  if (showForm.value) {
    showForm.value = false
    resetForm()
    return
  }

  if (!canStartNewCase()) return

  resetForm()
  showForm.value = true
}

function validateForm() {
  const e = {}
  const f = form.value
  if (!f.academicYear) e.academicYear = 'Required'
  if (!f.term) e.term = 'Required'
  if (!f.studentNo || !/^[A-Za-z0-9]+$/.test(f.studentNo)) e.studentNo = 'Valid Student No. required'
  if (!f.studentName || f.studentName.trim().length < 2) e.studentName = 'Name required'
  if (!f.courseCode) e.courseCode = 'Required'
  if (!f.courseTitle || f.courseTitle.trim().length < 2) e.courseTitle = 'Course title required'
  if (!f.originalGrade) e.originalGrade = 'Required'
  if (!f.newGrade) e.newGrade = 'Required'
  if (f.originalGrade && f.newGrade && f.originalGrade === f.newGrade) e.newGrade = 'Must differ from original'
  if (!f.reasonType) e.reasonType = 'Select a reason'
  if (['makeup','supplementary','review','others'].includes(f.reasonType) && (!f.reasonDetails || f.reasonDetails.trim().length < 3)) {
    e.reasonDetails = 'Please provide details'
  }
  if (f.reasonType === 'appeal' && !f.appealGrounds) e.appealGrounds = 'Select grounds for appeal'
  if (f.reasonType === 'appeal' && (!f.appealDetails || f.appealDetails.trim().length < 3)) e.appealDetails = 'Please provide appeal details'
  if (!f.instructorName || f.instructorName.trim().length < 2) e.instructorName = 'Instructor name required'
  if (!f.department || f.department.trim().length < 2) e.department = 'Department required'
  formErrors.value = e
  return Object.keys(e).length === 0
}

function toPayload(f) {
  const userSignature = String(auth.user?.signature || '').trim()

  return {
    academic_year: f.academicYear,
    term: f.term,
    student_no: f.studentNo,
    student_name: f.studentName,
    course_code: f.courseCode,
    course_title: f.courseTitle,
    original_grade: f.originalGrade,
    new_grade: f.newGrade,
    reason_type: f.reasonType,
    reason_details: f.reasonDetails,
    appeal_grounds: f.appealGrounds,
    appeal_details: f.appealDetails,
    instructor_name: f.instructorName,
    department: f.department,
    instructor_signature: userSignature,
    teacher_signature: userSignature,
    submitted_by_signature: userSignature
  }
}

async function submitForm() {
  if (!canModifyAmendments.value) {
    errorMsg.value = 'Admin accounts can view amendment requests only.'
    return
  }
  if (!editingId.value && !canStartNewCase()) {
    return
  }
  if (!validateForm()) return
  successMsg.value = ''
  errorMsg.value = ''
  
  // 首先進入預覽模式
  showPreview.value = true
}

async function confirmAndSubmit() {
  if (!canModifyAmendments.value) {
    errorMsg.value = 'Admin accounts can view amendment requests only.'
    return
  }
  isSubmitting.value = true
  try {
    const payload = toPayload(form.value)
    if (editingId.value) {
      const amendmentBeforeUpdate = store.amendments.find(a => a._id === editingId.value)
      if (getAmendmentStatus(amendmentBeforeUpdate) === 'Approved') {
        throw new Error('Approved amendment cases cannot be edited.')
      }
      const linkedSubmissionId = amendmentBeforeUpdate?.submission_id
      const shouldResubmitRejectedCase = Boolean(
        linkedSubmissionId && getAmendmentStatus(amendmentBeforeUpdate) === 'Rejected'
      )

      const updated = await store.updateAmendment(editingId.value, payload)

      const localAmendment = store.amendments.find(a => a._id === editingId.value)
      if (localAmendment) {
        localAmendment.status = 'Pending'
        localAmendment.created_at = new Date().toISOString()
      }

      if (shouldResubmitRejectedCase) {
        const amendmentForResubmit = updated && typeof updated === 'object'
          ? updated
          : (store.amendments.find(a => a._id === editingId.value) || amendmentBeforeUpdate)
        await subStore.resubmitSubmission(linkedSubmissionId, { amendment: amendmentForResubmit })
        successMsg.value = '✓ Amendment updated and resubmitted successfully. Status is now Pending for review.'
      } else {
        successMsg.value = '✓ Amendment updated successfully. You can continue editing until it is approved.'
      }

      if (updated && typeof updated === 'object') {
        form.value = mapAmendmentToForm(updated)
      }

      showForm.value = false
      editingId.value = null
      showPreview.value = false
    } else {
      if (!canStartNewCase()) {
        showPreview.value = false
        return
      }
      await store.createAmendment(payload)
      successMsg.value = '✓ Amendment submitted successfully. You can still edit it from the list until approval.'
      resetForm()
      showForm.value = false
      showPreview.value = false
    }
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    isSubmitting.value = false
  }
}

function cancelPreview() {
  showPreview.value = false
}

function startEdit(a) {
  if (!canModifyAmendments.value) {
    errorMsg.value = 'Admin accounts can view amendment requests only.'
    return
  }
  if (getAmendmentStatus(a) === 'Approved') {
    errorMsg.value = 'Approved amendment cases cannot be edited.'
    return
  }
  editingId.value = a._id
  form.value = mapAmendmentToForm(a)
  const linkedSubmission = getLinkedSubmission(a)
  editingRejectContext.value = {
    status: getAmendmentStatus(a),
    reason: firstNonEmptyField(a, ['rejection_reason', 'rejectionReason', 'reject_reason', 'rejected_reason']) ||
      firstNonEmptyField(linkedSubmission, ['rejection_reason', 'rejectionReason', 'reject_reason', 'rejected_reason']),
    remarks: firstNonEmptyField(a, ['rejection_remarks', 'rejectionRemarks', 'reject_remarks', 'rejected_remarks', 'review_remarks'])
  }
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleDelete(id) {
  if (!canModifyAmendments.value) {
    errorMsg.value = 'Admin accounts can view amendment requests only.'
    return
  }

  const target = store.amendments.find(a => a._id === id)
  if (target && getAmendmentStatus(target) === 'Approved') {
    errorMsg.value = 'Approved amendment cases cannot be deleted.'
    return
  }

  if (!confirm('Delete this amendment?')) return
  try {
    await store.deleteAmendment(id)
    successMsg.value = 'Deleted successfully'
  } catch (err) {
    errorMsg.value = err.message
  }
}

const statusBadge = (status) => {
  const normalizedStatus = submissionStatusToAmendmentStatus(status)
  const map = { Pending: 'bg-warning text-dark', Approved: 'bg-success', Rejected: 'bg-danger' }
  return map[normalizedStatus] || 'bg-secondary'
}

const reasonLabel = (type) => {
  const found = REASON_OPTIONS.find(r => r.value === type)
  return found ? found.label : type || '-'
}

const amendmentDetailsText = (amendment) => {
  if (!amendment) return '-'
  if (amendment.appeal_details) return amendment.appeal_details
  if (amendment.reason_details) return amendment.reason_details
  if (amendment.details) return amendment.details
  return '-'
}

const submissionStatusToAmendmentStatus = (submissionStatus) => {
  if (submissionStatus === 'Submitted') return 'Pending'
  return submissionStatus || ''
}

const getLinkedSubmission = (amendment) => {
  if (!amendment?.submission_id) return null
  return subStore.submissions.find(s => s._id === amendment.submission_id) || null
}

const getAmendmentStatus = (amendment) => {
  const linkedSubmission = getLinkedSubmission(amendment)
  if (linkedSubmission?.status) {
    return submissionStatusToAmendmentStatus(linkedSubmission.status)
  }
  return submissionStatusToAmendmentStatus(amendment?.status)
}

// Get unique status options for filter dropdown
const statusOptions = computed(() => {
  const statuses = [...new Set(store.amendments.map(a => getAmendmentStatus(a)).filter(Boolean))].sort()
  if (auth.user?.role === 'Programme Director') {
    const allowed = ['Pending', 'Rejected', 'Approved']
    return allowed.filter(status => statuses.includes(status))
  }
  return statuses
})

const canExportPdf = (amendment) => {
  if (!canModifyAmendments.value) return true
  return getAmendmentStatus(amendment) === 'Approved'
}

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return courseCodeFilter.value || statusFilter.value || termFilter.value
})

const totalAmendmentCount = computed(() => store.amendments.length)

const getCreatedTimestamp = (amendment) => {
  const rawDate = amendment.created_at || amendment.create_date || amendment.createdAt
  if (rawDate) {
    const timestamp = new Date(rawDate).getTime()
    if (Number.isFinite(timestamp)) {
      return timestamp
    }
  }

  if (amendment._id) {
    try {
      return parseInt(String(amendment._id).substring(0, 8), 16) * 1000
    } catch {
      return 0
    }
  }

  return 0
}

// Filter amendments based on user role and search filters
const filteredAmendments = computed(() => {
  let amendmentList = [...store.amendments]
  
  amendmentList = amendmentList.filter(amendment => getAmendmentStatus(amendment) !== 'Draft')
  
  // Apply course code filter if search term exists
  if (courseCodeFilter.value) {
    amendmentList = amendmentList.filter(amendment => 
      amendment.course_code?.toLowerCase().includes(courseCodeFilter.value.toLowerCase())
    )
  }
  
  // Apply status filter if selected
  if (statusFilter.value) {
    amendmentList = amendmentList.filter(amendment => getAmendmentStatus(amendment) === statusFilter.value)
  }

  // Apply term filter if selected (non-admin only)
  if (termFilter.value) {
    amendmentList = amendmentList.filter(amendment => String(amendment.term) === termFilter.value)
  }
  
  // Sort by creation date
  amendmentList.sort((a, b) => {
    const dateA = getCreatedTimestamp(a)
    const dateB = getCreatedTimestamp(b)
    return sortOrder.value === 'oldest' ? dateA - dateB : dateB - dateA
  })
  
  return amendmentList
})

onMounted(async () => {
  try {
    await Promise.all([
      store.fetchAmendments(),
      subStore.fetchSubmissions()
    ])

    if (route.query.newCase === '1') {
      openNewAmendmentForm()

      const nextQuery = { ...route.query }
      delete nextQuery.newCase
      delete nextQuery.source
      router.replace({ path: route.path, query: nextQuery })
    }

    if (store.error) {
      errorMsg.value = 'Failed to load amendments: ' + store.error
    }
  } catch (err) {
    errorMsg.value = 'Error loading amendments: ' + err.message
  }
})

onUnmounted(() => {
})
</script>

<template>
  <div class="container py-4">
    <SignaturePrompt />
    
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="fw-bold mb-0"><i class="bi bi-pencil-square"></i> Grade Amendments</h3>
      <div>
        <button type="button" @click="downloadTemplate()" class="btn btn-outline-secondary btn-sm me-2"><i class="bi bi-download"></i> Download Template</button>
        <button v-if="canModifyAmendments" type="button" class="btn btn-primary btn-sm" @click.stop="openNewAmendmentForm()">
          <i class="bi" :class="showForm ? 'bi-x' : 'bi-plus'"></i> {{ showForm ? 'Cancel' : (auth.isHead ? 'New Case' : 'New Amendment') }}
        </button>
      </div>
    </div>

    <div v-if="!canModifyAmendments" class="alert alert-info" role="alert">
      <i class="bi bi-info-circle me-2"></i>
      Admin accounts are in read-only mode on this page.
    </div>

    <!-- Search and Filter Bar -->
    <div class="row mb-3">
      <div class="col-md-3">
        <label class="form-label small fw-semibold text-muted">Search by Course Code</label>
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input 
            v-model="courseCodeFilter" 
            type="text" 
            class="form-control" 
            placeholder="e.g. COMP3047"
          />
          <button 
            v-if="courseCodeFilter" 
            @click="courseCodeFilter = ''" 
            class="btn btn-outline-secondary" 
            type="button"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
      <div v-if="auth.user?.role !== 'admin'" class="col-md-2">
        <label class="form-label small fw-semibold text-muted">Filter by Term</label>
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-calendar2-week"></i></span>
          <select v-model="termFilter" class="form-select">
            <option value="">All Terms</option>
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
          </select>
          <button
            v-if="termFilter"
            @click="termFilter = ''"
            class="btn btn-outline-secondary"
            type="button"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
      <div class="col-md-2">
        <label class="form-label small fw-semibold text-muted">Filter by Status</label>
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-funnel"></i></span>
          <select v-model="statusFilter" class="form-select">
            <option value="">All Statuses</option>
            <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
          </select>
          <button 
            v-if="statusFilter" 
            @click="statusFilter = ''" 
            class="btn btn-outline-secondary" 
            type="button"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
      <div class="col-md-3">
        <label class="form-label small fw-semibold text-muted">Sort by Date</label>
        <div class="btn-group w-100" role="group">
          <input type="radio" class="btn-check" id="sort-oldest" value="oldest" v-model="sortOrder" />
          <label class="btn btn-outline-secondary" for="sort-oldest" style="flex:1">
            <i class="bi bi-arrow-up"></i> Oldest First
          </label>
          <input type="radio" class="btn-check" id="sort-newest" value="newest" v-model="sortOrder" />
          <label class="btn btn-outline-secondary" for="sort-newest" style="flex:1">
            <i class="bi bi-arrow-down"></i> Newest First
          </label>
        </div>
      </div>
      <div class="col-md-2 d-flex align-items-end">
        <button v-if="hasActiveFilters" @click="courseCodeFilter = ''; statusFilter = ''; termFilter = ''" class="btn btn-sm btn-outline-primary w-100">
          <i class="bi bi-arrow-counterclockwise me-1"></i>Clear All
        </button>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-12">
        <div class="alert alert-info mb-0 py-2 px-3 d-flex justify-content-between align-items-center">
          <i class="bi bi-info-circle me-1"></i>
          <span>
            Total amendments: <strong>{{ totalAmendmentCount }}</strong>
          </span>
          <span>
            Showing <strong>{{ filteredAmendments.length }}</strong>
          </span>
        </div>
      </div>
    </div>

    <div v-if="successMsg" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="bi bi-check-circle me-2"></i>
      <strong>Success!</strong> {{ successMsg }}
      <button type="button" class="btn-close" @click="successMsg = ''"></button>
    </div>
    <div v-if="errorMsg" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-circle me-2"></i>
      <strong>Error!</strong> {{ errorMsg }}
      <button type="button" class="btn-close" @click="errorMsg = ''"></button>
    </div>

    <!-- ===== Amendment Form ===== -->
    <div v-if="showForm && canModifyAmendments" class="card mb-4">
      <div class="card-header fw-bold">
        <i class="bi bi-file-earmark-text"></i>
        {{ editingId ? 'Edit Amendment' : 'Request for Grade Amendment' }}
      </div>
      <div class="card-body">
        <!-- 提示訊息 -->
        <div v-if="editingId" class="alert alert-info alert-dismissible fade show" role="alert">
          <i class="bi bi-info-circle me-2"></i>
          <strong>Edit Mode:</strong> You are editing an existing amendment. Review your changes carefully before confirming.
        </div>

        <div v-if="isEditingRejected" class="mb-3">
          <div class="alert alert-danger" role="alert">
            <div class="fw-semibold mb-1"><i class="bi bi-exclamation-triangle-fill me-2"></i>Rejected Reason</div>
            <div>{{ editingRejectContext.reason || 'No rejection reason was provided.' }}</div>
          </div>
          <div class="mb-2">
            <label class="form-label fw-semibold">Rejected Remarks</label>
            <textarea
              class="form-control"
              rows="3"
              :value="editingRejectContext.remarks"
              placeholder="No rejected remarks were provided."
              readonly
            ></textarea>
          </div>
        </div>

        <form @submit.prevent="submitForm">

          <!-- Row 1: AY + Term -->
          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <label class="form-label fw-semibold">Academic Year (AY)</label>
              <input v-model="form.academicYear" class="form-control" :class="{'is-invalid': formErrors.academicYear}" placeholder="e.g. 2025-2026" />
              <div class="invalid-feedback">{{ formErrors.academicYear }}</div>
            </div>
            <div class="col-md-2">
              <label class="form-label fw-semibold">Term</label>
              <select v-model="form.term" class="form-select" :class="{'is-invalid': formErrors.term}">
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
              <div class="invalid-feedback">{{ formErrors.term }}</div>
            </div>
          </div>

          <!-- Row 2: Student info -->
          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <label class="form-label fw-semibold">Student No.</label>
              <input v-model="form.studentNo" class="form-control" :class="{'is-invalid': formErrors.studentNo}" placeholder="e.g. 22240802" />
              <div class="invalid-feedback">{{ formErrors.studentNo }}</div>
            </div>
            <div class="col-md-8">
              <label class="form-label fw-semibold">Student Name</label>
              <input v-model="form.studentName" class="form-control" :class="{'is-invalid': formErrors.studentName}" />
              <div class="invalid-feedback">{{ formErrors.studentName }}</div>
            </div>
          </div>

          <!-- Row 3: Course -->
          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <label class="form-label fw-semibold">Course Code</label>
              <input v-model="form.courseCode" class="form-control" :class="{'is-invalid': formErrors.courseCode}" placeholder="e.g. COMP3047" />
              <div class="invalid-feedback">{{ formErrors.courseCode }}</div>
            </div>
            <div class="col-md-8">
              <label class="form-label fw-semibold">Course Title</label>
              <input v-model="form.courseTitle" class="form-control" :class="{'is-invalid': formErrors.courseTitle}" placeholder="e.g. Software Engineering" />
              <div class="invalid-feedback">{{ formErrors.courseTitle }}</div>
            </div>
          </div>

          <!-- Row 4: Grades -->
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <label class="form-label fw-semibold">Original Grade</label>
              <select v-model="form.originalGrade" class="form-select" :class="{'is-invalid': formErrors.originalGrade}">
                <option value="">Select...</option>
                <option v-for="g in VALID_GRADES" :key="g" :value="g">{{ g }}</option>
              </select>
              <div class="invalid-feedback">{{ formErrors.originalGrade }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">New Grade</label>
              <select v-model="form.newGrade" class="form-select" :class="{'is-invalid': formErrors.newGrade}">
                <option value="">Select...</option>
                <option v-for="g in VALID_GRADES" :key="g" :value="g">{{ g }}</option>
              </select>
              <div class="invalid-feedback">{{ formErrors.newGrade }}</div>
            </div>
          </div>

          <hr />

          <!-- Reason for Amendment -->
          <h6 class="fw-bold mb-3">Reason for Amendment</h6>
          <div class="mb-3" :class="{'is-invalid': formErrors.reasonType}">
            <div v-for="opt in REASON_OPTIONS" :key="opt.value" class="form-check mb-2">
              <input class="form-check-input" type="radio" :id="'reason_' + opt.value" :value="opt.value" v-model="form.reasonType" />
              <label class="form-check-label" :for="'reason_' + opt.value">{{ opt.label }}</label>
            </div>
            <div v-if="formErrors.reasonType" class="text-danger small mt-1">{{ formErrors.reasonType }}</div>
          </div>

          <!-- Reason details (for makeup, supplementary, review, others) -->
          <div v-if="['makeup','supplementary','review','others'].includes(form.reasonType)" class="mb-3">
            <label class="form-label fw-semibold">Please provide details:</label>
            <textarea v-model="form.reasonDetails" class="form-control" rows="3" :class="{'is-invalid': formErrors.reasonDetails}" placeholder="Provide details for the amendment reason..."></textarea>
            <div class="invalid-feedback">{{ formErrors.reasonDetails }}</div>
          </div>

          <!-- Appeal sub-section -->
          <div v-if="form.reasonType === 'appeal'" class="card border-start border-primary border-3 bg-transparent mb-3">
            <div class="card-body">
              <h6 class="fw-bold mb-3">Grounds for Appeal</h6>
              <div class="form-check form-check-inline mb-3">
                <input class="form-check-input" type="radio" id="appeal_tech" value="Technical errors" v-model="form.appealGrounds" />
                <label class="form-check-label" for="appeal_tech">Technical errors</label>
              </div>
              <div class="form-check form-check-inline mb-3">
                <input class="form-check-input" type="radio" id="appeal_proc" value="Procedural faults" v-model="form.appealGrounds" />
                <label class="form-check-label" for="appeal_proc">Procedural faults</label>
              </div>
              <div v-if="formErrors.appealGrounds" class="text-danger small mb-2">{{ formErrors.appealGrounds }}</div>

              <label class="form-label fw-semibold">Please provide details below:</label>
              <textarea v-model="form.appealDetails" class="form-control" rows="3" :class="{'is-invalid': formErrors.appealDetails}" placeholder="Describe the grounds for appeal..."></textarea>
              <div class="invalid-feedback">{{ formErrors.appealDetails }}</div>
            </div>
          </div>

          <hr />

          <!-- Course Instructor section -->
          <h6 class="fw-bold mb-3">Course Instructor Information</h6>
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Course-Instructor's Name</label>
              <input v-model="form.instructorName" class="form-control" :class="{'is-invalid': formErrors.instructorName}" placeholder="e.g. Dr. Martin Choy" />
              <div class="invalid-feedback">{{ formErrors.instructorName }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Department</label>
              <input v-model="form.department" class="form-control" :class="{'is-invalid': formErrors.department}" placeholder="e.g. COMP" />
              <div class="invalid-feedback">{{ formErrors.department }}</div>
            </div>
          </div>

          <!-- Submit -->
          <div class="mt-4 d-flex gap-2">
            <button type="submit" class="btn btn-primary">
              <i class="bi bi-eye me-1"></i> {{ editingId ? 'Review Changes' : 'Preview & Submit' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="showForm = false; resetForm()">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===== Preview Modal ===== -->
    <div v-if="showPreview && canModifyAmendments" class="modal d-block" style="background-color: rgba(0, 0, 0, 0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white border-0">
            <h5 class="modal-title">
              <i class="bi bi-eye me-2"></i>Preview {{ editingId ? 'Changes' : 'Amendment Submission' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="cancelPreview" :disabled="isSubmitting"></button>
          </div>

          <div class="modal-body">
            <div class="alert alert-info" role="alert">
              <i class="bi bi-info-circle me-2"></i>
              <strong>Please review the information below carefully.</strong> You can still reopen and edit this amendment until it is approved.
            </div>

            <!-- 預覽內容按區塊分組 -->
            <div class="row g-3 mb-4">
              <!-- 基本信息區 -->
              <div class="col-md-6">
                <div class="card border-0 bg-light">
                  <div class="card-header bg-info bg-opacity-10 border-0 fw-bold">
                    <i class="bi bi-calendar-range me-2"></i>Academic Information
                  </div>
                  <div class="card-body">
                    <div class="mb-2">
                      <small class="text-muted">Academic Year</small>
                      <p class="mb-0"><strong>{{ form.academicYear }}</strong></p>
                    </div>
                    <div>
                      <small class="text-muted">Term</small>
                      <p class="mb-0"><strong>{{ form.term }}</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 學生信息區 -->
              <div class="col-md-6">
                <div class="card border-0 bg-light">
                  <div class="card-header bg-success bg-opacity-10 border-0 fw-bold">
                    <i class="bi bi-person-badge me-2"></i>Student Information
                  </div>
                  <div class="card-body">
                    <div class="mb-2">
                      <small class="text-muted">Student No.</small>
                      <p class="mb-0"><strong>{{ form.studentNo }}</strong></p>
                    </div>
                    <div>
                      <small class="text-muted">Name</small>
                      <p class="mb-0"><strong>{{ form.studentName }}</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 課程信息區 -->
              <div class="col-md-6">
                <div class="card border-0 bg-light">
                  <div class="card-header bg-warning bg-opacity-10 border-0 fw-bold">
                    <i class="bi bi-book me-2"></i>Course Information
                  </div>
                  <div class="card-body">
                    <div class="mb-2">
                      <small class="text-muted">Course Code</small>
                      <p class="mb-0"><strong>{{ form.courseCode }}</strong></p>
                    </div>
                    <div>
                      <small class="text-muted">Course Title</small>
                      <p class="mb-0"><strong>{{ form.courseTitle }}</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 成績信息區 -->
              <div class="col-md-6">
                <div class="card border-0 bg-light">
                  <div class="card-header bg-danger bg-opacity-10 border-0 fw-bold">
                    <i class="bi bi-graph-up me-2"></i>Grade Information
                  </div>
                  <div class="card-body">
                    <div class="mb-2">
                      <small class="text-muted">Original Grade</small>
                      <p class="mb-0"><span class="badge bg-secondary">{{ form.originalGrade }}</span></p>
                    </div>
                    <div>
                      <small class="text-muted">New Grade</small>
                      <p class="mb-0"><span class="badge bg-primary">{{ form.newGrade }}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 修正理由區 -->
              <div class="col-12">
                <div class="card border-0 bg-light">
                  <div class="card-header bg-primary bg-opacity-10 border-0 fw-bold">
                    <i class="bi bi-chat-dot me-2"></i>Reason for Amendment
                  </div>
                  <div class="card-body">
                    <div class="mb-2">
                      <small class="text-muted">Reason Type</small>
                      <p class="mb-1"><strong>{{ reasonLabel(form.reasonType) }}</strong></p>
                    </div>

                    <div v-if="['makeup','supplementary','review','others'].includes(form.reasonType)" class="mb-2">
                      <small class="text-muted">Details</small>
                      <p class="mb-0"><em>{{ form.reasonDetails }}</em></p>
                    </div>

                    <div v-if="form.reasonType === 'appeal'" class="border-start ps-3">
                      <div class="mb-2">
                        <small class="text-muted">Grounds for Appeal</small>
                        <p class="mb-1"><strong>{{ form.appealGrounds }}</strong></p>
                      </div>
                      <div>
                        <small class="text-muted">Appeal Details</small>
                        <p class="mb-0"><em>{{ form.appealDetails }}</em></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 講師信息區 -->
              <div class="col-12">
                <div class="card border-0 bg-light">
                  <div class="card-header bg-secondary bg-opacity-10 border-0 fw-bold">
                    <i class="bi bi-mortarboard me-2"></i>Instructor Information
                  </div>
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-6">
                        <small class="text-muted">Instructor Name</small>
                        <p class="mb-0"><strong>{{ form.instructorName }}</strong></p>
                      </div>
                      <div class="col-md-6">
                        <small class="text-muted">Department</small>
                        <p class="mb-0"><strong>{{ form.department }}</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 警告訊息 -->
            <div class="alert alert-warning" role="alert">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <strong>Important:</strong> You can revisit and edit this amendment later from the list until it has been approved.
            </div>
          </div>

          <div class="modal-footer border-top bg-light">
            <button
              type="button"
              class="btn btn-secondary"
              @click="cancelPreview"
              :disabled="isSubmitting"
            >
              <i class="bi bi-pencil me-1"></i>Edit
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="confirmAndSubmit"
              :disabled="isSubmitting"
            >
              <span v-if="!isSubmitting">
                <i class="bi bi-check-lg me-1"></i>{{ editingId ? 'Confirm Update' : 'Confirm Submission' }}
              </span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-body p-0">
        <div v-if="store.loading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
        <div v-else-if="filteredAmendments.length === 0" class="text-center text-muted py-4">No amendments found. Create one above.</div>
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th>AY / Term</th>
                <th>Student</th>
                <th>Course</th>
                <th>Grade</th>
                <th>Reason</th>
                <th>Details</th>
                <th>Instructor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in filteredAmendments" :key="a._id" :class="{ 'table-danger': getAmendmentStatus(a) === 'Rejected' && auth.user?.role !== 'admin' }">
                <td class="small text-nowrap">
                  {{ a.academic_year || '-' }}<br/>
                  <span class="text-muted">T{{ a.term || '-' }}</span>
                </td>
                <td class="small">
                  <strong>{{ a.student_no || a.student_id }}</strong><br/>
                  {{ a.student_name }}
                </td>
                <td class="small">
                  <strong>{{ a.course_code }}</strong><br/>
                  <span class="text-muted">{{ a.course_title }}</span>
                </td>
                <td class="text-nowrap">
                  <span class="badge bg-secondary">{{ a.original_grade }}</span>
                  <i class="bi bi-arrow-right mx-1 small"></i>
                  <span class="badge bg-primary">{{ a.new_grade }}</span>
                </td>
                <td class="small" style="max-width:180px">
                  {{ reasonLabel(a.reason_type) }}
                  <span v-if="a.reason && !a.reason_type" class="text-muted">{{ a.reason }}</span>
                </td>
                <td class="small" style="max-width:260px; white-space:normal; word-break:break-word;">
                  {{ amendmentDetailsText(a) }}
                </td>
                <td class="small text-nowrap">
                  {{ a.instructor_name || '-' }}<br/>
                  <span class="text-muted">{{ a.department || '' }}</span>
                </td>
                <td><span class="badge" :class="statusBadge(getAmendmentStatus(a))">{{ getAmendmentStatus(a) }}</span></td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button v-if="canExportPdf(a)" class="btn btn-outline-secondary" @click="downloadFilledForm(a)" title="Download PDF"><i class="bi bi-file-pdf"></i></button>
                    <button
                      v-if="canModifyAmendments"
                      :class="['btn', getAmendmentStatus(a) === 'Rejected' ? 'btn-warning' : 'btn-outline-primary']"
                      @click="startEdit(a)"
                      :disabled="getAmendmentStatus(a) === 'Approved'"
                      :title="getAmendmentStatus(a) === 'Rejected' ? 'Edit and resubmit via Submissions' : 'Edit'"
                    ><i class="bi bi-pencil"></i></button>
                    <button v-if="canModifyAmendments" class="btn btn-outline-danger" @click="handleDelete(a._id)" :disabled="getAmendmentStatus(a) === 'Approved'"><i class="bi bi-trash"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
