<script setup>
import { ref } from 'vue'
import { useAmendmentStore } from '@/stores/amendmentStore'
import { useAuthStore } from '@/stores/authStore'
import * as XLSX from 'xlsx'

const store = useAmendmentStore()
const auth = useAuthStore()
const file = ref(null)
const dragOver = ref(false)
const importing = ref(false)
const result = ref(null)
const errorMsg = ref('')

const isDemoUser = () => auth.token?.startsWith('demo_token_')

function handleDrop(e) {
  dragOver.value = false
  const f = e.dataTransfer.files[0]
  if (f) file.value = f
}

function handleFileChange(e) {
  file.value = e.target.files[0]
}

async function doImport() {
  if (!file.value) return
  importing.value = true
  result.value = null
  errorMsg.value = ''

  try {
    if (isDemoUser()) {
      // Client-side Excel parsing for demo mode
      const data = await file.value.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet)

      if (rows.length === 0) {
        throw new Error('No data rows found in Excel file')
      }

      let imported = 0
      const errors = []

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowErrors = []

        // Map column names (flexible)
        const studentNo = row['Student No.'] || row['Student No'] || row['student_no'] || ''
        const studentName = row['Student Name'] || row['student_name'] || ''
        const courseCode = row['Course Code'] || row['course_code'] || ''
        const courseTitle = row['Course Title'] || row['course_title'] || ''
        const originalGrade = row['Original Grade'] || row['original_grade'] || ''
        const newGrade = row['New Grade'] || row['new_grade'] || ''
        const reasonType = row['Reason Type'] || row['reason_type'] || 'conversion'
        const reasonDetails = row['Reason Details'] || row['reason_details'] || ''
        const instructorName = row['Instructor Name'] || row['instructor_name'] || ''
        const department = row['Department'] || row['department'] || ''
        const academicYear = row['Academic Year'] || row['academic_year'] || '2025-2026'
        const term = String(row['Term'] || row['term'] || '1')

        if (!studentNo) rowErrors.push('Student No. is required')
        if (!studentName) rowErrors.push('Student Name is required')
        if (!courseCode) rowErrors.push('Course Code is required')
        if (!originalGrade) rowErrors.push('Original Grade is required')
        if (!newGrade) rowErrors.push('New Grade is required')

        if (rowErrors.length > 0) {
          errors.push({ row: i + 2, errors: rowErrors })
        } else {
          await store.createAmendment({
            academic_year: academicYear,
            term: term,
            student_no: studentNo,
            student_name: studentName,
            course_code: courseCode,
            course_title: courseTitle,
            original_grade: originalGrade,
            new_grade: newGrade,
            reason_type: reasonType,
            reason_details: reasonDetails,
            instructor_name: instructorName,
            department: department
          })
          imported++
        }
      }

      result.value = { imported, errors }
      file.value = null
    } else {
      const res = await store.importExcel(file.value)
      result.value = res
      file.value = null
    }
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    importing.value = false
  }
}

function downloadTemplate() {
  const headers = [
    'Academic Year', 'Term', 'Student No.', 'Student Name',
    'Course Code', 'Course Title', 'Original Grade', 'New Grade',
    'Reason Type', 'Reason Details', 'Instructor Name', 'Department'
  ]
  const sampleData = [
    ['2025-2026', '1', '22240802', 'John Smith', 'COMP3047', 'Software Engineering', 'I', 'A', 'conversion', 'Completed missing coursework', 'Dr. Martin Choy', 'COMP'],
    ['2025-2026', '1', '22240803', 'Sarah Johnson', 'COMP3048', 'Database Systems', 'B-', 'B+', 'appeal', 'Grading calculation error', 'Prof. Emily Wong', 'COMP']
  ]

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData])
  // Set column widths
  ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 2, 15) }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Grade Amendments')
  XLSX.writeFile(wb, 'Grade_Amendment_Template.xlsx')
}

function exportData() {
  const amendments = store.amendments
  if (amendments.length === 0) {
    errorMsg.value = 'No amendments to export'
    return
  }

  const data = amendments.map(a => ({
    'Academic Year': a.academic_year || '',
    'Term': a.term || '',
    'Student No.': a.student_no || a.student_id || '',
    'Student Name': a.student_name || '',
    'Course Code': a.course_code || '',
    'Course Title': a.course_title || '',
    'Original Grade': a.original_grade || '',
    'New Grade': a.new_grade || '',
    'Reason Type': a.reason_type || '',
    'Reason Details': a.reason_details || '',
    'Instructor Name': a.instructor_name || '',
    'Department': a.department || '',
    'Status': a.status || ''
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Grade Amendments')
  XLSX.writeFile(wb, 'Grade_Amendments_Export.xlsx')
}

function clearFile() {
  file.value = null
  result.value = null
  errorMsg.value = ''
}
</script>

<template>
  <div class="container py-4">
    <h3 class="fw-bold mb-3"><i class="bi bi-file-earmark-excel"></i> Excel Upload</h3>

    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header fw-bold">Upload Excel File</div>
          <div class="card-body">
            <!-- Drop zone -->
            <div class="upload-zone text-center p-5 border border-2 rounded-3 mb-3"
              :class="{ 'border-primary bg-primary bg-opacity-10': dragOver, 'border-dashed': !dragOver }"
              @dragover.prevent="dragOver = true"
              @dragleave.prevent="dragOver = false"
              @drop.prevent="handleDrop">
              <i class="bi bi-cloud-arrow-up fs-1 text-primary"></i>
              <p class="mt-2 mb-1">Drag & drop your Excel file here</p>
              <p class="text-muted small">or click below to browse</p>
              <label class="btn btn-outline-primary btn-sm">
                Browse Files
                <input type="file" accept=".xlsx,.xls" class="d-none" @change="handleFileChange" />
              </label>
            </div>

            <!-- Selected file -->
            <div v-if="file" class="alert alert-info d-flex justify-content-between align-items-center">
              <div>
                <i class="bi bi-file-earmark-excel"></i>
                <strong>{{ file.name }}</strong>
                <small class="text-muted ms-2">({{ (file.size / 1024).toFixed(1) }} KB)</small>
              </div>
              <div>
                <button class="btn btn-sm btn-outline-danger me-2" @click="clearFile"><i class="bi bi-x"></i></button>
                <button class="btn btn-sm btn-primary" @click="doImport" :disabled="importing">
                  <span v-if="importing" class="spinner-border spinner-border-sm me-1"></span>
                  {{ importing ? 'Importing...' : 'Upload & Import' }}
                </button>
              </div>
            </div>

            <!-- Results -->
            <div v-if="result" class="mt-3">
              <div class="alert alert-success">
                <i class="bi bi-check-circle"></i> Successfully imported <strong>{{ result.imported }}</strong> amendment(s).
              </div>
              <div v-if="result.errors && result.errors.length > 0" class="alert alert-warning">
                <h6 class="fw-bold"><i class="bi bi-exclamation-triangle"></i> Validation Errors ({{ result.errors.length }} rows)</h6>
                <div v-for="(err, idx) in result.errors" :key="idx" class="small mb-1">
                  <strong>Row {{ err.row }}:</strong> {{ err.errors.join(', ') }}
                </div>
              </div>
            </div>

            <div v-if="errorMsg" class="alert alert-danger mt-3">{{ errorMsg }}</div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card shadow-sm mb-3">
          <div class="card-header fw-bold">Required Columns</div>
          <div class="card-body">
            <div class="small">
              <p class="mb-2">Your Excel file should contain these columns (matching the Grade Amendment Form):</p>
              <ol class="mb-0">
                <li><strong>Academic Year</strong> <span class="text-muted">(e.g. 2025-2026)</span></li>
                <li><strong>Term</strong> <span class="text-muted">(1 or 2)</span></li>
                <li><strong>Student No.</strong></li>
                <li><strong>Student Name</strong></li>
                <li><strong>Course Code</strong> <span class="text-muted">(e.g. COMP3047)</span></li>
                <li><strong>Course Title</strong> <span class="text-muted">(e.g. Software Engineering)</span></li>
                <li><strong>Original Grade</strong></li>
                <li><strong>New Grade</strong></li>
                <li><strong>Reason Type</strong> <span class="text-muted">(conversion / makeup / supplementary / review / appeal / others)</span></li>
                <li><strong>Reason Details</strong> <span class="text-muted">(optional for conversion)</span></li>
                <li><strong>Instructor Name</strong></li>
                <li><strong>Department</strong> <span class="text-muted">(e.g. COMP)</span></li>
              </ol>
            </div>
          </div>
        </div>
        <div class="card shadow-sm">
          <div class="card-header fw-bold">Download</div>
          <div class="card-body d-grid gap-2">
            <button @click="downloadTemplate" class="btn btn-outline-success"><i class="bi bi-download"></i> Download Template</button>
            <button @click="exportData" class="btn btn-outline-primary"><i class="bi bi-file-earmark-arrow-down"></i> Export All Data</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.border-dashed {
  border-style: dashed !important;
}
.upload-zone {
  cursor: pointer;
  transition: all 0.2s;
}
.upload-zone:hover {
  border-color: var(--bs-primary) !important;
  background: rgba(var(--bs-primary-rgb), 0.05);
}
</style>
