<script setup>
import { ref, watch } from 'vue'
import { PDFDocument } from 'pdf-lib'

const templateUrl = ref('/grade-amendment-template.pdf')
const pdfCanvas = ref(null)
const mousePos = ref({ x: 0, y: 0 })
const selectedField = ref('studentNo')
const positions = ref({
  academicYear: { x: 50, y: 750 },
  term: { x: 150, y: 750 },
  studentNo: { x: 50, y: 710 },
  studentName: { x: 150, y: 710 },
  courseCode: { x: 50, y: 670 },
  courseTitle: { x: 150, y: 670 },
  originalGrade: { x: 50, y: 630 },
  newGrade: { x: 150, y: 630 },
  reasonTypeConversion: { x: 50, y: 590 },
  reasonTypeMakeup: { x: 50, y: 575 },
  reasonTypeSupplementary: { x: 50, y: 560 },
  reasonTypeReview: { x: 50, y: 545 },
  reasonTypeAppeal: { x: 50, y: 530 },
  reasonTypeOthers: { x: 50, y: 515 },
  reasonDetails: { x: 50, y: 490 },
  appealGrounds: { x: 50, y: 460 },
  appealDetails: { x: 50, y: 430 },
  instructorName: { x: 50, y: 400 },
  instructorSignature: { x: 50, y: 370 },
  instructorDate: { x: 150, y: 370 },
  department: { x: 50, y: 340 },
  departmentHeadName: { x: 150, y: 340 },
  departmentHeadSignature: { x: 50, y: 310 },
  departmentHeadDate: { x: 150, y: 310 },
  registrarSignature: { x: 50, y: 280 },
  registrarDate: { x: 150, y: 280 }
})

const fields = [
  { key: 'academicYear', label: 'Academic Year' },
  { key: 'term', label: 'Term' },
  { key: 'studentNo', label: 'Student No.' },
  { key: 'studentName', label: 'Student Name' },
  { key: 'courseCode', label: 'Course Code' },
  { key: 'courseTitle', label: 'Course Title' },
  { key: 'originalGrade', label: 'Original Grade' },
  { key: 'newGrade', label: 'New Grade' },
  { key: 'reasonTypeConversion', label: '☐ Conversion (checkbox)' },
  { key: 'reasonTypeMakeup', label: '☐ Make up exam (checkbox)' },
  { key: 'reasonTypeSupplementary', label: '☐ Supplementary exam (checkbox)' },
  { key: 'reasonTypeReview', label: '☐ Review by staff (checkbox)' },
  { key: 'reasonTypeAppeal', label: '☐ Appeal by student (checkbox)' },
  { key: 'reasonTypeOthers', label: '☐ Others (checkbox)' },
  { key: 'reasonDetails', label: 'Reason Details' },
  { key: 'appealGrounds', label: 'Appeal Grounds' },
  { key: 'appealDetails', label: 'Appeal Details' },
  { key: 'instructorName', label: 'Instructor Name' },
  { key: 'instructorSignature', label: 'Instructor Signature' },
  { key: 'instructorDate', label: 'Instructor Date' },
  { key: 'department', label: 'Department' },
  { key: 'departmentHeadName', label: 'Department Head Name' },
  { key: 'departmentHeadSignature', label: 'Department Head Signature' },
  { key: 'departmentHeadDate', label: 'Department Head Date' },
  { key: 'registrarSignature', label: 'Registrar Signature' },
  { key: 'registrarDate', label: 'Registrar Date' }
]

function handleCanvasClick(event) {
  const canvas = pdfCanvas.value
  const rect = canvas.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const clickY = event.clientY - rect.top
  
  // Convert canvas coordinates to PDF coordinates
  const scaleX = 595 / canvas.offsetWidth // A4 width in points
  const scaleY = 842 / canvas.offsetHeight // A4 height in points
  
  const pdfX = Math.round(clickX * scaleX)
  const pdfY = Math.round(842 - (clickY * scaleY)) // PDF origin is bottom-left
  
  // Update position
  positions.value[selectedField.value] = { x: pdfX, y: pdfY }
}

function handleMouseMove(event) {
  const canvas = pdfCanvas.value
  const rect = canvas.getBoundingClientRect()
  const moveX = event.clientX - rect.left
  const moveY = event.clientY - rect.top
  
  const scaleX = 595 / canvas.offsetWidth
  const scaleY = 842 / canvas.offsetHeight
  
  mousePos.value.x = Math.round(moveX * scaleX)
  mousePos.value.y = Math.round(842 - (moveY * scaleY))
}

function copyToClipboard() {
  const positionsCode = `const positions = ${JSON.stringify(positions.value, null, 2)}`
  navigator.clipboard.writeText(positionsCode)
  alert('Positions copied to clipboard!')
}

function exportPositions() {
  const json = JSON.stringify(positions.value, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'pdf-positions.json'
  link.click()
  URL.revokeObjectURL(url)
}

function loadPositions(event) {
  const file = event.target.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const loadedPositions = JSON.parse(e.target?.result)
      positions.value = { ...positions.value, ...loadedPositions }
      alert('Positions loaded successfully!')
    } catch (error) {
      alert('Error loading positions: ' + error.message)
    }
  }
  reader.readAsText(file)
}

function resetPositions() {
  if (confirm('Reset all positions to defaults?')) {
    positions.value = {
      academicYear: { x: 50, y: 750 },
      term: { x: 150, y: 750 },
      studentNo: { x: 50, y: 710 },
      studentName: { x: 150, y: 710 },
      courseCode: { x: 50, y: 670 },
      courseTitle: { x: 150, y: 670 },
      originalGrade: { x: 50, y: 630 },
      newGrade: { x: 150, y: 630 },
      reasonTypeConversion: { x: 50, y: 590 },
      reasonTypeMakeup: { x: 50, y: 575 },
      reasonTypeSupplementary: { x: 50, y: 560 },
      reasonTypeReview: { x: 50, y: 545 },
      reasonTypeAppeal: { x: 50, y: 530 },
      reasonTypeOthers: { x: 50, y: 515 },
      reasonDetails: { x: 50, y: 490 },
      appealGrounds: { x: 50, y: 460 },
      appealDetails: { x: 50, y: 430 },
      instructorName: { x: 50, y: 400 },
      instructorSignature: { x: 50, y: 370 },
      instructorDate: { x: 150, y: 370 },
      department: { x: 50, y: 340 },
      departmentHeadName: { x: 150, y: 340 },
      departmentHeadSignature: { x: 50, y: 310 },
      departmentHeadDate: { x: 150, y: 310 },
      registrarSignature: { x: 50, y: 280 },
      registrarDate: { x: 150, y: 280 }
    }
  }
}
</script>

<template>
  <div class="container-fluid py-4">
    <div class="row g-4">
      <!-- Instructions -->
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header fw-bold"><i class="bi bi-info-circle"></i> PDF Calibration Tool</div>
          <div class="card-body">
            <p class="mb-2"><strong>How to use:</strong></p>
            <ol class="mb-0">
              <li>Select a field from the dropdown</li>
              <li>Click on the PDF preview where that field should be placed</li>
              <li>The coordinates will update automatically</li>
              <li>Repeat for all fields</li>
              <li>Copy the positions code and paste into pdfTemplate.js</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- PDF Preview and Controls -->
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header fw-bold"><i class="bi bi-file-pdf"></i> PDF Template Preview</div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Select Field to Calibrate:</label>
              <select v-model="selectedField" class="form-select">
                <option v-for="field in fields" :key="field.key" :value="field.key">
                  {{ field.label }}
                </option>
              </select>
            </div>
            <div class="alert alert-info mb-3">
              <strong>Current Field:</strong> {{ selectedField }}<br>
              <strong>Selected Position:</strong> X: {{ positions[selectedField].x }}, Y: {{ positions[selectedField].y }}
            </div>
            <embed ref="pdfCanvas" 
              :src="templateUrl" 
              type="application/pdf"
              @click="handleCanvasClick"
              @mousemove="handleMouseMove"
              style="width: 100%; height: 600px; border: 2px solid #ccc; cursor: crosshair;"
            />
            <div class="text-muted small mt-2">
              Mouse Position: X: {{ mousePos.x }}, Y: {{ mousePos.y }}
            </div>
          </div>
        </div>
      </div>

      <!-- Positions Panel -->
      <div class="col-lg-4">
        <div class="card shadow-sm">
          <div class="card-header fw-bold"><i class="bi bi-sliders"></i> Field Positions</div>
          <div class="card-body" style="max-height: 700px; overflow-y: auto;">
            <div v-for="field in fields" :key="field.key" class="mb-3">
              <label class="form-label small fw-semibold">{{ field.label }}</label>
              <div class="input-group input-group-sm">
                <span class="input-group-text">X:</span>
                <input v-model.number="positions[field.key].x" type="number" class="form-control" />
                <span class="input-group-text">Y:</span>
                <input v-model.number="positions[field.key].y" type="number" class="form-control" />
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card shadow-sm mt-3">
          <div class="card-header fw-bold"><i class="bi bi-download"></i> Export/Import</div>
          <div class="card-body d-grid gap-2">
            <button @click="copyToClipboard" class="btn btn-primary btn-sm">
              <i class="bi bi-clipboard"></i> Copy to Clipboard
            </button>
            <button @click="exportPositions" class="btn btn-success btn-sm">
              <i class="bi bi-download"></i> Export JSON
            </button>
            <label class="btn btn-info btn-sm mb-0">
              <i class="bi bi-upload"></i> Import JSON
              <input type="file" accept=".json" @change="loadPositions" style="display:none" />
            </label>
            <button @click="resetPositions" class="btn btn-outline-danger btn-sm">
              <i class="bi bi-arrow-counterclockwise"></i> Reset Defaults
            </button>
          </div>
        </div>

        <!-- Code Output -->
        <div class="card shadow-sm mt-3">
          <div class="card-header fw-bold"><i class="bi bi-code"></i> Code Output</div>
          <div class="card-body">
            <div class="bg-light p-2 rounded" style="font-size: 0.75rem; max-height: 200px; overflow-y: auto; font-family: monospace;">
              const positions = {{ JSON.stringify(positions, null, 2) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
embed {
  display: block;
}
</style>
