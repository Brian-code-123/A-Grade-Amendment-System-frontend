<template>
  <div class="pdf-editor-container">
    <!-- Header Navigation -->
    <div class="header-nav">
      <div class="nav-group">
        <router-link to="/amendments" class="nav-btn-back">
          <i class="bi bi-arrow-left"></i> Back to Amendments
        </router-link>
      </div>
      <h3 class="header-title"><i class="bi bi-file-pdf"></i> PDF Editor</h3>
    </div>

    <!-- File Upload -->
    <div class="file-upload-area" v-if="!pdfLoaded" @drop="handleFileDrop" @dragover.prevent @dragleave="isDragOver = false" :class="{ dragover: isDragOver }">
      <i class="bi bi-cloud-arrow-up"></i>
      <h2>Upload PDF File</h2>
      <p>Drag and drop your PDF here or click to browse</p>
      <input type="file" @change="handleFileSelect" accept=".pdf" hidden ref="fileInput">
      <button @click="$refs.fileInput.click()" class="upload-btn">Choose File</button>
    </div>

    <div v-if="pdfLoaded" class="editor-wrapper">
      <!-- Top Toolbar -->
      <div class="toolbar">
        <div class="toolbar-group">
          <!-- Tool Selection -->
          <button 
            v-for="tool in tools" 
            :key="tool.id"
            @click="activeTool = tool.id"
            :class="{ active: activeTool === tool.id }"
            :title="tool.label"
            class="tool-btn"
          >
            <i :class="tool.icon"></i>
          </button>
        </div>

        <!-- Pen Colors -->
        <div v-if="['pen', 'highlight', 'rect'].includes(activeTool)" class="toolbar-group">
          <label>Color:</label>
          <div class="color-palette">
            <button 
              v-for="color in activeColors" 
              :key="color"
              @click="penColor = color"
              :style="{ backgroundColor: color }"
              :class="{ active: penColor === color }"
              class="color-btn"
              :title="color"
            ></button>
          </div>
        </div>

        <!-- Pen Width -->
        <div v-if="['pen', 'highlight', 'rect'].includes(activeTool)" class="toolbar-group">
          <label>Size: <span>{{ penWidth }}</span></label>
          <input 
            v-model.number="penWidth" 
            type="range" 
            min="1" 
            max="10"
            class="slider"
          >
        </div>

        <!-- Page Navigation -->
        <div class="toolbar-group">
          <button @click="previousPage" :disabled="currentPage <= 1" class="nav-btn">
            <i class="bi bi-chevron-left"></i>
          </button>
          <span class="page-info">
            Page <input v-model.number="currentPage" type="number" :max="pageCount" class="page-input" @change="renderPage"> / {{ pageCount }}
          </span>
          <button @click="nextPage" :disabled="currentPage >= pageCount" class="nav-btn">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>

        <!-- Zoom Controls -->
        <div class="toolbar-group">
          <button @click="zoomOut" class="zoom-btn">
            <i class="bi bi-zoom-out"></i>
          </button>
          <span class="zoom-info">{{ zoomLevel }}%</span>
          <button @click="zoomIn" class="zoom-btn">
            <i class="bi bi-zoom-in"></i>
          </button>
        </div>

        <!-- Undo/Redo Controls -->
        <div class="toolbar-group">
          <button @click="undoAction" class="zoom-btn" title="Undo">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
          <button @click="redoAction" class="zoom-btn" title="Redo">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="editor-content">
        <!-- PDF Viewer -->
        <div class="pdf-viewer">
          <div id="pdf-container" class="pdf-container">
            <canvas id="pdf-canvas" ref="pdfCanvasRef"></canvas>
            <canvas id="annotation-canvas" ref="annotationCanvasRef" class="annotation-overlay"></canvas>
            <input 
              v-show="showTextInput" 
              ref="directTextInput"
              v-model="textContent" 
              @keyup.enter="addText"
              @keyup.esc="cancelTextInput"
              type="text" 
              placeholder="Type text..."
              class="direct-text-input"
              :style="{ left: textX + 'px', top: textY + 'px' }"
            >
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="right-sidebar">

          <div class="sidebar-section">
            <h3>�📥 Download</h3>
            <button @click="downloadOriginal" class="action-btn full-width">
              <i class="bi bi-download"></i> Original PDF
            </button>
          </div>

          <div class="sidebar-section">
            <h3>📤 Export As</h3>
            <button @click="exportAsPNG" class="export-btn">
              <i class="bi bi-image"></i> PNG
            </button>
            <button @click="exportAsPDF" class="export-btn">
              <i class="bi bi-file-pdf"></i> PDF
            </button>
          </div>

          <div class="sidebar-section">
            <h3>🛠️ Tools</h3>
            <button @click="clearPage" class="tool-action-btn full-width">
              <i class="bi bi-trash"></i> Clear Page
            </button>
          </div>

          <div class="sidebar-section" v-if="activeTool === 'text'">
            <h3>✍️ Text Tool</h3>
            <small style="color:#6c757d">Click to add text. Drag existing text to move. Double-click text to edit.</small>
            <button @click="editSelectedText" class="tool-action-btn full-width" :disabled="!selectedTextAnnotationId">
              <i class="bi bi-pencil"></i> Edit Selected Text
            </button>
            <button @click="deleteSelectedText" class="tool-action-btn full-width" :disabled="!selectedTextAnnotationId">
              <i class="bi bi-trash3"></i> Delete Selected Text
            </button>
          </div>

          <div v-if="successMsg" class="message success-msg">{{ successMsg }}</div>
          <div v-if="errorMsg" class="message error-msg">{{ errorMsg }}</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAmendmentStore } from '@/stores/amendmentStore'
import * as pdfjsLib from 'pdfjs-dist'

const route = useRoute()
const amendmentStore = useAmendmentStore()

// Form data passed from submission/amendment
const formData = ref(null)
const currentAmendment = ref(null)

// Form data inputs for page 2 approval info
// approved: true = Approved checkbox, false = Not Approved checkbox, null = blank
const formDataInputs = reactive({
  academicYear: '',
  term: '',
  newGrade: '',
  approved: null,
  approvalDate: '',
  approvalRemarks: ''
})

// Set worker - try local file first, then fallback to CDN
// Start with local file path (served from /public)
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
console.log('PDF.js worker URL set to: /pdf.worker.min.mjs')

// Also set up CDN fallback if local isn't available
const setupWorkerFallback = async () => {
  try {
    const response = await fetch('/pdf.worker.min.mjs')
    if (!response.ok) {
      throw new Error('Local worker not found')
    }
  } catch {
    const cdnUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
    pdfjsLib.GlobalWorkerOptions.workerSrc = cdnUrl
    console.warn('Local worker unavailable, using CDN:', cdnUrl)
  }
}

// State
const pdfLoaded = ref(false)
const activeTool = ref('pen')
const penColor = ref('#000000')
const penWidth = ref(2)
const currentPage = ref(1)
const pageCount = ref(1)
const zoomLevel = ref(130)
const fileName = ref('document.pdf')
const isDragOver = ref(false)
const showTextInput = ref(false)
const textContent = ref('')
const textX = ref(0)
const textY = ref(0)
const successMsg = ref('')
const errorMsg = ref('')
const directTextInput = ref(null)
const selectedTextAnnotationId = ref(null)
const editingTextAnnotationId = ref(null)

// Canvas references
const pdfCanvasRef = ref(null)
const annotationCanvasRef = ref(null)
let pdfDoc = null
let pdfCtx, annotCtx
let isDrawing = false
let currentStroke = null
let dragTextState = null
let annotationIdCounter = 1

// Annotations storage
const pageAnnotations = reactive({})
const redoHistory = reactive({}) // Store redo history for each page

const nextAnnotationId = () => {
  const id = annotationIdCounter
  annotationIdCounter += 1
  return `ann-${id}`
}

const clearSelectedText = () => {
  selectedTextAnnotationId.value = null
}

const getTextMetrics = (annotation) => {
  if (!annotation || annotation.type !== 'text') return null
  const fontSize = annotation.fontSize || 16
  if (annotCtx) {
    annotCtx.save()
    annotCtx.font = `${fontSize}px Arial`
    const width = annotCtx.measureText(annotation.text || '').width
    annotCtx.restore()
    return { width, height: fontSize }
  }
  return { width: (annotation.text || '').length * fontSize * 0.55, height: fontSize }
}

const findTextAnnotationAtPoint = (x, y) => {
  const annotations = pageAnnotations[currentPage.value] || []
  const padding = 6
  for (let i = annotations.length - 1; i >= 0; i -= 1) {
    const annotation = annotations[i]
    if (annotation.type !== 'text') continue
    const metrics = getTextMetrics(annotation)
    if (!metrics) continue
    const minX = annotation.x - padding
    const maxX = annotation.x + metrics.width + padding
    const minY = annotation.y - padding
    const maxY = annotation.y + metrics.height + padding
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      return annotation
    }
  }
  return null
}

const clampTextPosition = (annotation) => {
  const canvas = document.getElementById('annotation-canvas')
  if (!canvas || !annotation) return
  const metrics = getTextMetrics(annotation)
  if (!metrics) return
  annotation.x = Math.max(0, Math.min(annotation.x, Math.max(0, canvas.width - metrics.width)))
  annotation.y = Math.max(0, Math.min(annotation.y, Math.max(0, canvas.height - metrics.height)))
}

const openTextEditor = (annotation) => {
  if (!annotation) return
  editingTextAnnotationId.value = annotation.id
  selectedTextAnnotationId.value = annotation.id
  textContent.value = annotation.text || ''
  textX.value = annotation.x
  textY.value = annotation.y
  showTextInput.value = true
  nextTick(() => {
    if (directTextInput.value) {
      directTextInput.value.focus()
      directTextInput.value.select()
    }
  })
}

// Tools definition
const tools = [
  { id: 'pen', icon: 'bi-pencil', label: 'Pen' },
  { id: 'highlight', icon: 'bi-highlighter', label: 'Highlight' },
  { id: 'rect', icon: 'bi-square', label: 'Rectangle' },
  { id: 'text', icon: 'bi-type', label: 'Text' }
]

// Computed colors based on tool
const activeColors = computed(() => {
  if (activeTool.value === 'highlight') {
    return ['#FFFF00', '#FF0000', '#0000FF'] // Yellow, Red, Blue
  }
  return ['#000000', '#FF0000', '#0000FF'] // Black, Red, Blue for pen and rect
})

// Watch for tool changes to set defaults
watch(activeTool, (newTool) => {
  if (newTool === 'highlight') {
    penWidth.value = 4
    penColor.value = '#FFFF00'
  } else if (newTool === 'pen') {
    penWidth.value = 2
    penColor.value = '#000000'
  } else if (newTool === 'rect') {
    penWidth.value = 2
    penColor.value = '#000000'
  }
})

// File handling
const handleFileDrop = (e) => {
  e.preventDefault()
  isDragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file?.type === 'application/pdf') {
    loadPDF(file)
  }
}

const handleFileSelect = (e) => {
  const file = e.target.files?.[0]
  console.log('File selected:', file?.name, file?.type)
  if (file?.type === 'application/pdf') {
    loadPDF(file)
  } else {
    errorMsg.value = 'Please select a valid PDF file'
  }
}

// Load PDF
const loadPDF = async (file) => {
  try {
    errorMsg.value = ''
    successMsg.value = 'Loading PDF...'
    
    console.log('Loading PDF:', file.name)
    const arrayBuffer = await file.arrayBuffer()
    console.log('File size:', arrayBuffer.byteLength, 'bytes')
    
    pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise
    console.log('PDF loaded, pages:', pdfDoc.numPages)
    
    pageCount.value = pdfDoc.numPages
    currentPage.value = 1
    fileName.value = file.name || 'document.pdf'
    pdfLoaded.value = true
    successMsg.value = ''
    
    // Wait for DOM to update, then initialize
    await nextTick()
    // Small delay to ensure canvas elements are mounted
    await new Promise(resolve => setTimeout(resolve, 100))
    console.log('DOM updated, initializing canvases...')
    
    const initialized = initializeCanvases()
    if (!initialized) {
      errorMsg.value = 'Failed to initialize canvas'
      return
    }
    
    console.log('Canvases initialized, rendering page...')
    await renderPage()
  } catch (e) {
    errorMsg.value = 'Failed to load PDF: ' + e.message
    console.error('LoadPDF error:', e)
  }
}

// Initialize canvases
const initializeCanvases = () => {
  const pdfCanvas = document.getElementById('pdf-canvas')
  const annotationCanvas = document.getElementById('annotation-canvas')
  
  if (!pdfCanvas || !annotationCanvas) {
    console.error('Canvas elements not found')
    return false
  }
  
  pdfCtx = pdfCanvas.getContext('2d')
  annotCtx = annotationCanvas.getContext('2d')
  
  if (!pdfCtx || !annotCtx) {
    console.error('Failed to get 2D context')
    return false
  }
  
  annotationCanvas.addEventListener('mousedown', startDrawing)
  annotationCanvas.addEventListener('mousemove', draw)
  annotationCanvas.addEventListener('mouseup', stopDrawing)
  annotationCanvas.addEventListener('mouseleave', stopDrawing)
  annotationCanvas.addEventListener('dblclick', handleCanvasDoubleClick)
  
  return true
}

// Render page
const renderPage = async () => {
  if (!pdfDoc) {
    console.error('PDF not loaded')
    return
  }
  
  // Validate page number
  if (currentPage.value < 1 || currentPage.value > pageCount.value) {
    console.error('Invalid page number:', currentPage.value)
    return
  }
  
  try {
    const pdfCanvas = document.getElementById('pdf-canvas')
    const annotationCanvas = document.getElementById('annotation-canvas')
    
    if (!pdfCanvas || !annotationCanvas) {
      console.error('Canvases not found')
      return
    }
    
    console.log('Getting page:', currentPage.value)
    const page = await pdfDoc.getPage(currentPage.value)
    console.log('Page retrieved successfully')
    
    const scale = zoomLevel.value / 100
    const viewport = page.getViewport({ scale })
    
    console.log('Canvas size:', viewport.width, 'x', viewport.height)
    pdfCanvas.width = viewport.width
    pdfCanvas.height = viewport.height
    annotationCanvas.width = viewport.width
    annotationCanvas.height = viewport.height
    
    // Clear canvas
    pdfCtx.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height)
    
    console.log('Rendering page...')
    await page.render({
      canvasContext: pdfCtx,
      viewport
    }).promise
    
    console.log('Page rendered successfully')
    redrawAnnotations()
  } catch (e) {
    errorMsg.value = 'Failed to render page: ' + e.message
    console.error('Render error:', e)
  }
}

// Drawing functions
const startDrawing = (e) => {
  const canvas = document.getElementById('annotation-canvas')
  if (!canvas) return
  
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  if (activeTool.value === 'text') {
    const hitText = findTextAnnotationAtPoint(x, y)
    if (hitText) {
      selectedTextAnnotationId.value = hitText.id
      dragTextState = {
        id: hitText.id,
        offsetX: x - hitText.x,
        offsetY: y - hitText.y
      }
      showTextInput.value = false
      redrawAnnotations()
      return
    }

    clearSelectedText()
    editingTextAnnotationId.value = null
    textX.value = x
    textY.value = y
    textContent.value = ''
    showTextInput.value = true
    nextTick(() => {
      if (directTextInput.value) {
        directTextInput.value.focus()
      }
    })
    return
  }

  clearSelectedText()
  showTextInput.value = false

  isDrawing = true
  
  if (activeTool.value === 'pen' || activeTool.value === 'highlight') {
    currentStroke = {
      type: 'path',
      color: penColor.value,
      opacity: activeTool.value === 'highlight' ? 0.12 : 1,
      width: penWidth.value,
      points: [{ x, y }]
    }
  } else if (activeTool.value === 'rect') {
    currentStroke = {
      type: 'rect',
      color: penColor.value,
      width: penWidth.value,
      x,
      y,
      w: 0,
      h: 0
    }
  }
}

const draw = (e) => {
  if (dragTextState) {
    const canvas = document.getElementById('annotation-canvas')
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const annotations = pageAnnotations[currentPage.value] || []
    const dragged = annotations.find(a => a.id === dragTextState.id)
    if (!dragged) return
    dragged.x = x - dragTextState.offsetX
    dragged.y = y - dragTextState.offsetY
    clampTextPosition(dragged)
    redrawAnnotations()
    return
  }

  if (!isDrawing || !currentStroke) return
  
  const canvas = document.getElementById('annotation-canvas')
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  if (currentStroke.type === 'path') {
    currentStroke.points.push({ x, y })
    
    annotCtx.globalAlpha = currentStroke.opacity
    annotCtx.strokeStyle = currentStroke.color
    annotCtx.lineWidth = currentStroke.width
    annotCtx.lineCap = 'round'
    annotCtx.lineJoin = 'round'
    annotCtx.beginPath()
    
    const prev = currentStroke.points[currentStroke.points.length - 2]
    annotCtx.moveTo(prev.x, prev.y)
    annotCtx.lineTo(x, y)
    annotCtx.stroke()
    annotCtx.globalAlpha = 1
  } else if (currentStroke.type === 'rect') {
    currentStroke.w = x - currentStroke.x
    currentStroke.h = y - currentStroke.y
    redrawAnnotations()
    
    annotCtx.strokeStyle = currentStroke.color
    annotCtx.lineWidth = currentStroke.width
    annotCtx.strokeRect(currentStroke.x, currentStroke.y, currentStroke.w, currentStroke.h)
  }
}

const stopDrawing = () => {
  if (dragTextState) {
    dragTextState = null
    redrawAnnotations()
    return
  }

  if (!isDrawing) return
  
  isDrawing = false
  if (currentStroke) {
    if (!pageAnnotations[currentPage.value]) {
      pageAnnotations[currentPage.value] = []
    }
    pageAnnotations[currentPage.value].push(currentStroke)
    currentStroke = null
    redrawAnnotations()
  }
}

// Add text
const addText = () => {
  const content = textContent.value.trim()

  if (!content) {
    if (editingTextAnnotationId.value) {
      deleteSelectedText()
    }
    showTextInput.value = false
    editingTextAnnotationId.value = null
    return
  }
  
  if (!pageAnnotations[currentPage.value]) {
    pageAnnotations[currentPage.value] = []
  }

  if (editingTextAnnotationId.value) {
    const annotation = pageAnnotations[currentPage.value].find(a => a.id === editingTextAnnotationId.value)
    if (annotation) {
      annotation.text = content
      annotation.x = textX.value
      annotation.y = textY.value
      clampTextPosition(annotation)
      selectedTextAnnotationId.value = annotation.id
    }
  } else {
    const newAnnotation = {
      id: nextAnnotationId(),
      type: 'text',
      text: content,
      x: textX.value,
      y: textY.value,
      color: penColor.value,
      fontSize: 14
    }
    clampTextPosition(newAnnotation)
    pageAnnotations[currentPage.value].push(newAnnotation)
    selectedTextAnnotationId.value = newAnnotation.id
  }
  
  showTextInput.value = false
  textContent.value = ''
  editingTextAnnotationId.value = null
  redrawAnnotations()
}

const cancelTextInput = () => {
  showTextInput.value = false
  textContent.value = ''
  editingTextAnnotationId.value = null
}

const editSelectedText = () => {
  if (!selectedTextAnnotationId.value) return
  const annotations = pageAnnotations[currentPage.value] || []
  const annotation = annotations.find(a => a.id === selectedTextAnnotationId.value && a.type === 'text')
  if (!annotation) return
  openTextEditor(annotation)
}

const deleteSelectedText = () => {
  if (!selectedTextAnnotationId.value) return
  const annotations = pageAnnotations[currentPage.value] || []
  const index = annotations.findIndex(a => a.id === selectedTextAnnotationId.value && a.type === 'text')
  if (index >= 0) {
    annotations.splice(index, 1)
    clearSelectedText()
    showTextInput.value = false
    textContent.value = ''
    editingTextAnnotationId.value = null
    redrawAnnotations()
  }
}

const handleCanvasDoubleClick = (e) => {
  if (activeTool.value !== 'text') return
  const canvas = document.getElementById('annotation-canvas')
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const hitText = findTextAnnotationAtPoint(x, y)
  if (!hitText) return
  openTextEditor(hitText)
}

const handleGlobalKeydown = (e) => {
  if (showTextInput.value) return
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTextAnnotationId.value) {
    e.preventDefault()
    deleteSelectedText()
  }
}

// Redraw annotations
const redrawAnnotations = () => {
  const canvas = document.getElementById('annotation-canvas')
  if (!canvas || !annotCtx) return
  
  annotCtx.clearRect(0, 0, canvas.width, canvas.height)
  
  const annotations = pageAnnotations[currentPage.value] || []
  
  annotations.forEach(stroke => {
    if (stroke.type === 'path') {
      annotCtx.globalAlpha = stroke.opacity
      annotCtx.strokeStyle = stroke.color
      annotCtx.lineWidth = stroke.width
      annotCtx.lineCap = 'round'
      annotCtx.lineJoin = 'round'
      annotCtx.beginPath()
      stroke.points.forEach((pt, i) => {
        if (i === 0) annotCtx.moveTo(pt.x, pt.y)
        else annotCtx.lineTo(pt.x, pt.y)
      })
      annotCtx.stroke()
      annotCtx.globalAlpha = 1
    } else if (stroke.type === 'rect') {
      annotCtx.strokeStyle = stroke.color
      annotCtx.lineWidth = stroke.width
      annotCtx.strokeRect(stroke.x, stroke.y, stroke.w, stroke.h)
    } else if (stroke.type === 'text') {
      annotCtx.fillStyle = stroke.color
      annotCtx.font = (stroke.fontSize || 16) + 'px Arial'
      annotCtx.textBaseline = 'top'
      annotCtx.fillText(stroke.text, stroke.x, stroke.y)

      if (stroke.id && stroke.id === selectedTextAnnotationId.value) {
        const metrics = getTextMetrics(stroke)
        if (metrics) {
          annotCtx.save()
          annotCtx.strokeStyle = '#0d6efd'
          annotCtx.setLineDash([4, 2])
          annotCtx.lineWidth = 1
          annotCtx.strokeRect(stroke.x - 3, stroke.y - 3, metrics.width + 6, metrics.height + 6)
          annotCtx.restore()
        }
      }

      annotCtx.textBaseline = 'alphabetic'
    }
  })
}

// Navigation
const previousPage = () => {
  if (currentPage.value > 1) {
    cancelTextInput()
    clearSelectedText()
    currentPage.value--
    renderPage()
  }
}

const nextPage = () => {
  if (currentPage.value < pageCount.value) {
    cancelTextInput()
    clearSelectedText()
    currentPage.value++
    renderPage()
  }
}

// Zoom
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value + 10, 300)
  renderPage()
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value - 10, 50)
  renderPage()
}

// Helper: render a given page number to an offscreen canvas with annotations composited on top
const renderPageToCanvas = async (pageNum, includeFormData = false) => {
  const page = await pdfDoc.getPage(pageNum)
  const scale = zoomLevel.value / 100
  const viewport = page.getViewport({ scale })

  // Offscreen PDF canvas
  const pdfC = document.createElement('canvas')
  pdfC.width = viewport.width
  pdfC.height = viewport.height
  await page.render({ canvasContext: pdfC.getContext('2d'), viewport }).promise

  // Composite canvas: PDF bg + annotations
  const composite = document.createElement('canvas')
  composite.width = viewport.width
  composite.height = viewport.height
  const ctx = composite.getContext('2d')
  ctx.drawImage(pdfC, 0, 0)

  // Replay annotations stored for this page
  const annotations = pageAnnotations[pageNum] || []
  annotations.forEach(stroke => {
    if (stroke.type === 'path') {
      ctx.globalAlpha = stroke.opacity
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      stroke.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y)
        else ctx.lineTo(pt.x, pt.y)
      })
      ctx.stroke()
      ctx.globalAlpha = 1
    } else if (stroke.type === 'rect') {
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      ctx.strokeRect(stroke.x, stroke.y, stroke.w, stroke.h)
    } else if (stroke.type === 'text') {
      ctx.fillStyle = stroke.color
      ctx.font = (stroke.fontSize || 16) + 'px Arial'
      ctx.textBaseline = 'top'
      ctx.fillText(stroke.text, stroke.x, stroke.y)
      ctx.textBaseline = 'alphabetic'
    }
  })

  // Add form data if available and requested
  if (includeFormData) {
    // Check if there's any form data to add
    const hasFormData = formDataInputs.academicYear || formDataInputs.term || formDataInputs.newGrade
    // approved === null means no decision yet; true/false both count as "has data"
    const hasApprovalData = formDataInputs.approved !== null || formDataInputs.approvalDate || formDataInputs.approvalRemarks

    console.log(`renderPageToCanvas page=${pageNum} scale=${scale} hasFormData=${hasFormData} hasApprovalData=${hasApprovalData} approved=${formDataInputs.approved}`)

    if (hasFormData && pageNum === 1) {
      addFormDataToCanvas(ctx, 1, scale)
    }
    if (hasApprovalData && pageNum === 2) {
      addFormDataToCanvas(ctx, 2, scale)
    }
  }

  return composite
}

// Helper: add form data text to canvas at specified coordinates
// coords are in PDF user-units (at scale=1); multiply by scale for the actual canvas pixel position
const addFormDataToCanvas = (ctx, pageNum, scale = 1) => {
  const s = scale
  ctx.fillStyle = '#000000'
  ctx.textBaseline = 'top'

  if (pageNum === 1) {
    ctx.font = `bold ${12 * s}px Arial`

    // AY first number (338, 722)
    if (formDataInputs.academicYear) {
      const ayNum = String(formDataInputs.academicYear).padStart(2, '0')
      ctx.fillText(ayNum, 338 * s, 722 * s)
    }

    // AY second number (382, 722)
    if (formDataInputs.academicYear) {
      const nextYear = String(parseInt(formDataInputs.academicYear) + 1).padStart(2, '0')
      ctx.fillText(nextYear, 382 * s, 722 * s)
    }

    // Term (484, 722)
    if (formDataInputs.term) {
      ctx.fillText(String(formDataInputs.term), 484 * s, 722 * s)
    }

    // Grade (46, 650)
    if (formDataInputs.newGrade) {
      ctx.fillText(String(formDataInputs.newGrade), 46 * s, 650 * s)
    }
  } else if (pageNum === 2) {
    ctx.font = `bold ${13 * s}px Arial`

    // Debug: draw a bright red marker so we can confirm the canvas is being written to
    ctx.fillStyle = '#FF0000'
    ctx.fillText('● PAGE2 OVERLAY ACTIVE', 10 * s, 10 * s)
    ctx.fillStyle = '#000000'

    // Approved checkbox (44, 746)
    if (formDataInputs.approved === true) {
      ctx.fillText('V', 44 * s, 746 * s)
    }

    // Not Approved checkbox (97, 746)
    if (formDataInputs.approved === false) {
      ctx.fillText('V', 97 * s, 746 * s)
    }

    ctx.font = `${11 * s}px Arial`

    // Date (77, 712)
    if (formDataInputs.approved !== null && formDataInputs.approvalDate) {
      ctx.fillText(String(formDataInputs.approvalDate), 77 * s, 712 * s)
    }

    // Remarks (94, 678)
    if (formDataInputs.approved !== null && formDataInputs.approvalRemarks) {
      const maxWidth = 150 * s
      const lineHeight = 12 * s
      const words = String(formDataInputs.approvalRemarks).split(' ')
      let line = ''
      let y = 678 * s
      for (const word of words) {
        const testLine = line + word + ' '
        if (ctx.measureText(testLine).width > maxWidth) {
          ctx.fillText(line.trim(), 94 * s, y)
          line = word + ' '
          y += lineHeight
        } else {
          line = testLine
        }
      }
      if (line.trim()) ctx.fillText(line.trim(), 94 * s, y)
    }
  }
}

// Export functions
const exportAsPNG = async () => {
  try {
    const baseName = fileName.value.replace(/\.pdf$/i, '')
    successMsg.value = 'Exporting PNG…'
    for (let p = 1; p <= pageCount.value; p++) {
      const canvas = await renderPageToCanvas(p, true)
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `${baseName}_page${p}.png`
      link.click()
      // Brief delay so browser doesn't block multiple simultaneous downloads
      await new Promise(r => setTimeout(r, 350))
    }
    successMsg.value = `Exported ${pageCount.value} page(s) as PNG!`
    setTimeout(() => successMsg.value = '', 3000)
  } catch (e) {
    errorMsg.value = 'Export failed: ' + e.message
    setTimeout(() => errorMsg.value = '', 3000)
  }
}

const exportAsPDF = async () => {
  try {
    const { jsPDF } = await import('jspdf')
    const baseName = fileName.value.replace(/\.pdf$/i, '')
    successMsg.value = 'Exporting PDF…'

    let pdf = null
    for (let p = 1; p <= pageCount.value; p++) {
      const canvas = await renderPageToCanvas(p, true)
      const imgData = canvas.toDataURL('image/png')
      const w = canvas.width
      const h = canvas.height

      if (!pdf) {
        pdf = new jsPDF({
          orientation: w > h ? 'l' : 'p',
          unit: 'px',
          format: [w, h],
          hotfixes: ['px_scaling']
        })
      } else {
        pdf.addPage([w, h], w > h ? 'l' : 'p')
      }
      pdf.addImage(imgData, 'PNG', 0, 0, w, h)
    }

    if (pdf) {
      pdf.save(`${baseName}_annotated.pdf`)
      successMsg.value = `Exported ${pageCount.value} page(s) as PDF!`
      setTimeout(() => successMsg.value = '', 3000)
    }
  } catch (e) {
    errorMsg.value = 'Export failed: ' + e.message
    setTimeout(() => errorMsg.value = '', 3000)
  }
}

const downloadOriginal = () => {
  successMsg.value = 'Download feature coming soon!'
  setTimeout(() => successMsg.value = '', 3000)
}

const clearPage = () => {
  if (confirm('Clear all annotations on this page?')) {
    pageAnnotations[currentPage.value] = []
    redrawAnnotations()
  }
}

const undoAction = () => {
  if (pageAnnotations[currentPage.value]?.length) {
    const undoneAction = pageAnnotations[currentPage.value].pop()
    // Store in redo history
    if (!redoHistory[currentPage.value]) {
      redoHistory[currentPage.value] = []
    }
    redoHistory[currentPage.value].push(undoneAction)
    redrawAnnotations()
  }
}

const redoAction = () => {
  if (redoHistory[currentPage.value]?.length) {
    const redoneAction = redoHistory[currentPage.value].pop()
    // Restore to main annotations
    if (!pageAnnotations[currentPage.value]) {
      pageAnnotations[currentPage.value] = []
    }
    pageAnnotations[currentPage.value].push(redoneAction)
    redrawAnnotations()
  }
}

// Auto-populate form data based on amendment status
const populateFormFromAmendment = () => {
  if (!currentAmendment.value) return
  
  const amendment = currentAmendment.value
  
  // Populate basic fields
  if (amendment.academic_year) {
    // Extract the first 2 digits (e.g., "2025-2026" -> "25")
    const year = String(amendment.academic_year).split('-')[0]
    formDataInputs.academicYear = year.slice(-2)
  }
  
  if (amendment.term) {
    formDataInputs.term = String(amendment.term)
  }
  
  if (amendment.new_grade || amendment.newGrade) {
    formDataInputs.newGrade = amendment.new_grade || amendment.newGrade
  }
  
  // Set approval status based on amendment status
  if (amendment.status === 'Approved') {
    formDataInputs.approved = true
  } else if (amendment.status === 'Rejected') {
    formDataInputs.approved = false
  } else {
    formDataInputs.approved = null
  }
  
  console.log('Form populated from amendment:', formDataInputs)
}

onMounted(() => {
  // Setup worker fallback after component is mounted
  setupWorkerFallback().catch(err => {
    console.error('Error setting up worker fallback:', err)
  })
  
  // Capture form data from route state if available
  if (route.state?.formData) {
    formData.value = route.state.formData
    console.log('Form data received:', formData.value)
  }

  window.addEventListener('keydown', handleGlobalKeydown)
  
  // Try to get current amendment from store and auto-populate form
  if (amendmentStore.amendments && amendmentStore.amendments.length > 0) {
    currentAmendment.value = amendmentStore.amendments[0]
    populateFormFromAmendment()
  } else {
    // Load amendments if not already loaded
    amendmentStore.fetchAmendments().then(() => {
      if (amendmentStore.amendments && amendmentStore.amendments.length > 0) {
        currentAmendment.value = amendmentStore.amendments[0]
        populateFormFromAmendment()
      }
    }).catch(err => console.error('Failed to fetch amendments:', err))
  }
})

// Watch for amendment changes and update form
watch(() => amendmentStore.amendments, () => {
  if (amendmentStore.amendments && amendmentStore.amendments.length > 0 && !currentAmendment.value) {
    currentAmendment.value = amendmentStore.amendments[0]
    populateFormFromAmendment()
  }
}, { deep: true })

onUnmounted(() => {
  const annotationCanvas = document.getElementById('annotation-canvas')
  if (annotationCanvas) {
    annotationCanvas.removeEventListener('mousedown', startDrawing)
    annotationCanvas.removeEventListener('mousemove', draw)
    annotationCanvas.removeEventListener('mouseup', stopDrawing)
    annotationCanvas.removeEventListener('mouseleave', stopDrawing)
    annotationCanvas.removeEventListener('dblclick', handleCanvasDoubleClick)
  }
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
.pdf-editor-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.nav-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-btn-back:hover {
  background: #0056b3;
  text-decoration: none;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.file-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
  border: 3px dashed #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  margin: 20px;
}

.file-upload-area.dragover {
  border-color: #007bff;
  background: #f0f8ff;
}

.file-upload-area i {
  font-size: 48px;
  color: #999;
  margin-bottom: 10px;
}

.file-upload-area h2 {
  margin: 10px 0;
  color: #333;
}

.file-upload-area p {
  color: #999;
  margin-bottom: 20px;
}

.upload-btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.upload-btn:hover {
  background: #0056b3;
}

.editor-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: white;
  border-bottom: 1px solid #ddd;
  overflow-x: auto;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border-right: 1px solid #eee;
}

.toolbar-group:last-child {
  border-right: none;
}

.tool-btn {
  width: 36px;
  height: 36px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.tool-btn:hover {
  border-color: #999;
  background: #f9f9f9;
}

.tool-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.color-palette {
  display: flex;
  gap: 6px;
}

.color-btn {
  width: 24px;
  height: 24px;
  border: 2px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.active {
  border-color: #333;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #333;
}

.slider {
  width: 100px;
  height: 4px;
  cursor: pointer;
}

.page-input {
  width: 50px;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 3px;
  text-align: center;
  font-size: 14px;
}

.nav-btn, .zoom-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.nav-btn:hover, .zoom-btn:hover {
  background: #f0f0f0;
}

.nav-btn:disabled, .zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info, .zoom-info {
  font-size: 13px;
  color: #666;
  min-width: 80px;
  text-align: center;
}

.editor-content {
  display: flex;
  flex: 1;
  gap: 0;
  overflow: hidden;
}

.pdf-viewer {
  flex: 1;
  overflow: auto;
  background: #e9ecef;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 10px 20px 20px 20px;
}

.pdf-container {
  position: relative;
  display: inline-block;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

#pdf-canvas {
  display: block;
  border: 1px solid #ddd;
}

.annotation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  cursor: crosshair;
}

.right-sidebar {
  width: 250px;
  background: white;
  border-left: 1px solid #ddd;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar-section h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.action-btn, .export-btn, .tool-action-btn {
  padding: 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn:hover, .export-btn:hover, .tool-action-btn:hover {
  background: #f0f0f0;
  border-color: #999;
}

.full-width {
  width: 100%;
}

.export-btn {
  color: #007bff;
}

.message {
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

.success-msg {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error-msg {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  width: 280px;
}

.modal.text-modal {
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  width: 220px;
  padding: 10px;
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.direct-text-input {
  position: absolute;
  padding: 4px 8px;
  border: 2px solid #007bff;
  border-radius: 3px;
  background: white;
  font-size: 14px;
  z-index: 999;
  min-width: 150px;
  max-width: 300px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-primary, .btn-secondary {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #e9ecef;
  color: #333;
}

.btn-secondary:hover {
  background: #dee2e6;
}
</style>
