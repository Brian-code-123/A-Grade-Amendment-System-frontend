<script setup>
import { ref, onMounted } from 'vue'
import { useAmendmentStore } from '@/stores/amendmentStore'
import { useAuthStore } from '@/stores/authStore'
import { downloadTemplate, downloadFilledForm } from '@/services/pdfTemplate'

const store = useAmendmentStore()
const auth = useAuthStore()

const showForm = ref(false)
const editingId = ref(null)

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

const form = ref(blankForm())
const formErrors = ref({})
const successMsg = ref('')
const errorMsg = ref('')

function resetForm() {
  form.value = blankForm()
  formErrors.value = {}
  editingId.value = null
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
    department: f.department
  }
}

async function submitForm() {
  if (!validateForm()) return
  successMsg.value = ''
  errorMsg.value = ''
  try {
    if (editingId.value) {
      await store.updateAmendment(editingId.value, toPayload(form.value))
      successMsg.value = 'Amendment updated successfully'
    } else {
      await store.createAmendment(toPayload(form.value))
      successMsg.value = 'Amendment created successfully'
    }
    resetForm()
    showForm.value = false
  } catch (err) {
    errorMsg.value = err.message
  }
}

function startEdit(a) {
  editingId.value = a._id
  form.value = {
    academicYear: a.academic_year || '',
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
  }
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleDelete(id) {
  if (!confirm('Delete this amendment?')) return
  try {
    await store.deleteAmendment(id)
    successMsg.value = 'Deleted successfully'
  } catch (err) {
    errorMsg.value = err.message
  }
}

const statusBadge = (status) => {
  const map = { Pending: 'bg-warning text-dark', Submitted: 'bg-info', Approved: 'bg-success', Rejected: 'bg-danger' }
  return map[status] || 'bg-secondary'
}

const reasonLabel = (type) => {
  const found = REASON_OPTIONS.find(r => r.value === type)
  return found ? found.label : type || '-'
}

onMounted(() => store.fetchAmendments())
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="fw-bold mb-0"><i class="bi bi-pencil-square"></i> Grade Amendments</h3>
      <div>
        <button @click="downloadTemplate()" class="btn btn-outline-secondary btn-sm me-2"><i class="bi bi-download"></i> Download Template</button>
        <button class="btn btn-primary btn-sm" @click="showForm = !showForm; if(!showForm) resetForm()">
          <i class="bi" :class="showForm ? 'bi-x' : 'bi-plus'"></i> {{ showForm ? 'Cancel' : 'New Amendment' }}
        </button>
      </div>
    </div>

    <div v-if="successMsg" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ successMsg }}<button type="button" class="btn-close" @click="successMsg = ''"></button>
    </div>
    <div v-if="errorMsg" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ errorMsg }}<button type="button" class="btn-close" @click="errorMsg = ''"></button>
    </div>

    <!-- ===== Amendment Form ===== -->
    <div v-if="showForm" class="card mb-4">
      <div class="card-header fw-bold">
        <i class="bi bi-file-earmark-text"></i>
        {{ editingId ? 'Edit Amendment' : 'Request for Grade Amendment' }}
      </div>
      <div class="card-body">
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
              <i class="bi bi-check-lg"></i> {{ editingId ? 'Update Amendment' : 'Submit Amendment' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="showForm = false; resetForm()">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===== Amendments Table ===== -->
    <div class="card">
      <div class="card-body p-0">
        <div v-if="store.loading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
        <div v-else-if="store.amendments.length === 0" class="text-center text-muted py-4">No amendments found. Create one above.</div>
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th>AY / Term</th>
                <th>Student</th>
                <th>Course</th>
                <th>Grade</th>
                <th>Reason</th>
                <th>Instructor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in store.amendments" :key="a._id">
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
                <td class="small text-nowrap">
                  {{ a.instructor_name || '-' }}<br/>
                  <span class="text-muted">{{ a.department || '' }}</span>
                </td>
                <td><span class="badge" :class="statusBadge(a.status)">{{ a.status }}</span></td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" @click="downloadFilledForm(a)" title="Download PDF"><i class="bi bi-file-pdf"></i></button>
                    <button class="btn btn-outline-primary" @click="startEdit(a)" :disabled="a.status === 'Approved'"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-outline-danger" @click="handleDelete(a._id)" :disabled="a.status === 'Approved'"><i class="bi bi-trash"></i></button>
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
