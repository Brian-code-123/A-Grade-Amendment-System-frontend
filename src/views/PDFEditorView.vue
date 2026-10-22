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

        <!-- Sidebar Toggle (mobile only) -->
        <button @click="sidebarOpen = !sidebarOpen" class="sidebar-toggle-btn" title="Toggle panel">
          <i class="bi bi-layout-sidebar-inset"></i>
        </button>
      </div>

      <!-- Main Content Area -->
      <div class="editor-content">
        <!-- PDF Viewer -->
        <div class="pdf-viewer">
          <div id="pdf-container" class="pdf-container">
            <canvas id="pdf-canvas" ref="pdfCanvasRef"></canvas>
            <canvas id="annotation-canvas" ref="annotationCanvasRef" class="annotation-overlay" :class="{ 'tool-active': activeTool }"></canvas>
            <input 
              v-show="showTextInput" 
              ref="directTextInput"
              v-model="textContent" 
              @keyup.enter="addText"
              @blur="addText"
              @keyup.esc="cancelTextInput"
              type="text" 
              placeholder="Type text..."
              class="direct-text-input"
              :style="{ left: textX + 'px', top: textY + 'px' }"
            >
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="right-sidebar" :class="{ open: sidebarOpen }">

          <div class="sidebar-section">
            <h3>Download</h3>
            <button @click="downloadOriginal" class="action-btn full-width">
              <i class="bi bi-download"></i> Original PDF
            </button>
          </div>

          <div class="sidebar-section">
            <h3>Export As</h3>
            <button @click="exportAsPNG" class="export-btn">
              <i class="bi bi-image"></i> PNG
            </button>
            <button @click="exportAsPDF" class="export-btn">
              <i class="bi bi-file-pdf"></i> PDF
            </button>
          </div>

          <div class="sidebar-section">
            <h3>Tools</h3>
            <button @click="clearPage" class="tool-action-btn full-width">
              <i class="bi bi-trash"></i> Clear Page
            </button>
          </div>

          <div class="sidebar-section" v-if="activeTool === 'text'">
            <h3>Text Tool</h3>
            <small style="color:#6c757d">Click to place an Aa box, drag it to position, then double-click to type.</small>
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
import { useThemeStore } from '@/stores/themeStore'
import * as pdfjsLib from 'pdfjs-dist'

const themeStore = useThemeStore()

// Form data passed from submission/amendment

// Set worker - try local file first, then fallback to CDN
// Start with local file path (served from /public)
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

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
  }
}

// State
const pdfLoaded = ref(false)
const sidebarOpen = ref(false)
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

const TEXT_PLACEHOLDER_LABEL = 'Aa'
const TEXT_FONT_SIZE = 14
const TEXT_BOX_PADDING = 6

const isDarkTheme = () => document.documentElement.getAttribute('data-bs-theme') === 'dark'

// Canvas references
const pdfCanvasRef = ref(null)
const annotationCanvasRef = ref(null)
let pdfDoc = null
let pdfBytes = null // original file bytes, used for the vector PDF export
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
  const fontSize = annotation.fontSize || TEXT_FONT_SIZE
  const displayText = annotation.isDraft ? TEXT_PLACEHOLDER_LABEL : (annotation.text || TEXT_PLACEHOLDER_LABEL)
  if (annotCtx) {
    annotCtx.save()
    annotCtx.font = `${fontSize}px Arial`
    const width = annotCtx.measureText(displayText).width
    annotCtx.restore()
    return { width, height: fontSize }
  }
  return { width: displayText.length * fontSize * 0.55, height: fontSize }
}

const findTextAnnotationAtPoint = (x, y) => {
  const annotations = pageAnnotations[currentPage.value] || []
  const padding = TEXT_BOX_PADDING
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

const createTextDraft = (x, y) => {
  if (!pageAnnotations[currentPage.value]) {
    pageAnnotations[currentPage.value] = []
  }

  const draftAnnotation = {
    id: nextAnnotationId(),
    type: 'text',
    text: '',
    isDraft: true,
    x,
    y,
    color: penColor.value,
    fontSize: TEXT_FONT_SIZE
  }

  clampTextPosition(draftAnnotation)
  pageAnnotations[currentPage.value].push(draftAnnotation)
  selectedTextAnnotationId.value = draftAnnotation.id
  editingTextAnnotationId.value = null
  return draftAnnotation
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
  } else if (newTool === 'text') {
    // the text tool has no colour picker, so never inherit e.g. the highlighter's yellow
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
    
    const arrayBuffer = await file.arrayBuffer()
    pdfBytes = arrayBuffer.slice(0) // pdf.js takes ownership of the buffer it is given

    pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise

    pageCount.value = pdfDoc.numPages
    currentPage.value = 1
    fileName.value = file.name || 'document.pdf'
    pdfLoaded.value = true
    successMsg.value = ''
    
    // Wait for DOM to update, then initialize
    await nextTick()
    // Small delay to ensure canvas elements are mounted
    await new Promise(resolve => setTimeout(resolve, 100))

    const initialized = initializeCanvases()
    if (!initialized) {
      errorMsg.value = 'Failed to initialize canvas'
      return
    }

    await renderPage()
  } catch (e) {
    errorMsg.value = 'Failed to load PDF: ' + e.message
  }
}

// Initialize canvases
const initializeCanvases = () => {
  const pdfCanvas = document.getElementById('pdf-canvas')
  const annotationCanvas = document.getElementById('annotation-canvas')
  
  if (!pdfCanvas || !annotationCanvas) {
    return false
  }

  pdfCtx = pdfCanvas.getContext('2d')
  annotCtx = annotationCanvas.getContext('2d')

  if (!pdfCtx || !annotCtx) {
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
// A canvas can only host one pdf.js render at a time, so renders run one after another,
// and a request that is already superseded by a newer one is skipped (fast zoom clicks).
let renderChain = Promise.resolve()
let renderRequestId = 0
const renderPage = () => {
  const id = ++renderRequestId
  renderChain = renderChain.then(() => (id === renderRequestId ? renderPageNow() : undefined))
  return renderChain
}
const renderPageNow = async () => {
  if (!pdfDoc) {
    return
  }

  // Validate page number
  if (currentPage.value < 1 || currentPage.value > pageCount.value) {
    return
  }

  try {
    const pdfCanvas = document.getElementById('pdf-canvas')
    const annotationCanvas = document.getElementById('annotation-canvas')

    if (!pdfCanvas || !annotationCanvas) {
      return
    }

    const page = await pdfDoc.getPage(currentPage.value)

    const scale = zoomLevel.value / 100
    const viewport = page.getViewport({ scale })

    pdfCanvas.width = viewport.width
    pdfCanvas.height = viewport.height
    annotationCanvas.width = viewport.width
    annotationCanvas.height = viewport.height

    // Clear canvas
    pdfCtx.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height)

    await page.render({
      canvasContext: pdfCtx,
      viewport
    }).promise

    redrawAnnotations()
  } catch (e) {
    errorMsg.value = 'Failed to render page: ' + e.message
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
    const draftAnnotation = createTextDraft(x, y)
    textX.value = draftAnnotation.x
    textY.value = draftAnnotation.y
    textContent.value = ''
    showTextInput.value = false
    redrawAnnotations()
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
    activeTool.value = ''
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
      annotation.isDraft = false
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
      fontSize: TEXT_FONT_SIZE,
      isDraft: false
    }
    clampTextPosition(newAnnotation)
    pageAnnotations[currentPage.value].push(newAnnotation)
    selectedTextAnnotationId.value = newAnnotation.id
  }
  
  showTextInput.value = false
  textContent.value = ''
  editingTextAnnotationId.value = null
  activeTool.value = ''
  redrawAnnotations()
}

const cancelTextInput = () => {
  showTextInput.value = false
  textContent.value = ''
  editingTextAnnotationId.value = null
  activeTool.value = ''
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

  const darkMode = isDarkTheme()
  const draftColor = darkMode ? '#b6c5d0' : '#8c8c8c'
  const selectionColor = darkMode ? '#7ea2bd' : '#0d6efd'
  
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
      const metrics = getTextMetrics(stroke)
      const fontSize = stroke.fontSize || TEXT_FONT_SIZE
      const isDraft = Boolean(stroke.isDraft)
      const displayText = isDraft ? TEXT_PLACEHOLDER_LABEL : (stroke.text || '')

      annotCtx.save()
      annotCtx.font = `${fontSize}px Arial`
      annotCtx.textBaseline = 'top'

      if (isDraft) {
        annotCtx.strokeStyle = draftColor
        annotCtx.setLineDash([4, 2])
        annotCtx.strokeRect(stroke.x, stroke.y, metrics?.width || 0, metrics?.height || 0)
        annotCtx.fillStyle = draftColor
      } else {
        annotCtx.fillStyle = stroke.color
      }

      annotCtx.fillText(displayText, stroke.x, stroke.y)

      if (stroke.id && stroke.id === selectedTextAnnotationId.value) {
        if (metrics) {
          annotCtx.strokeStyle = selectionColor
          annotCtx.setLineDash([4, 2])
          annotCtx.lineWidth = 1
          annotCtx.strokeRect(stroke.x - TEXT_BOX_PADDING / 2, stroke.y - TEXT_BOX_PADDING / 2, metrics.width + TEXT_BOX_PADDING, metrics.height + TEXT_BOX_PADDING)
        }
      }

      annotCtx.restore()
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
// Annotations are stored in canvas pixels, so they must follow the zoom or they drift off the PDF
const scaleAnnotation = (a, k) => {
  if (a.type === 'path') {
    a.points.forEach(pt => { pt.x *= k; pt.y *= k })
    a.width *= k
  } else if (a.type === 'rect') {
    a.x *= k; a.y *= k; a.w *= k; a.h *= k; a.width *= k
  } else if (a.type === 'text') {
    a.x *= k; a.y *= k
    a.fontSize = (a.fontSize || TEXT_FONT_SIZE) * k
  }
}

const setZoom = (next) => {
  const prev = zoomLevel.value
  if (next === prev) return
  const k = next / prev
  for (const store of [pageAnnotations, redoHistory]) {
    Object.values(store).forEach(list => (Array.isArray(list) ? list : []).forEach(a => scaleAnnotation(a, k)))
  }
  zoomLevel.value = next
  renderPage()
}

const zoomIn = () => setZoom(Math.min(zoomLevel.value + 10, 300))

const zoomOut = () => setZoom(Math.max(zoomLevel.value - 10, 50))

// Helper: render a given page number to an offscreen canvas with annotations composited on top
// Exports render at a fixed 2x of the PDF's own size so output quality does not depend on the zoom
const EXPORT_SCALE = 2
const renderPageToCanvas = async (pageNum) => {
  const page = await pdfDoc.getPage(pageNum)
  const scale = EXPORT_SCALE
  const k = EXPORT_SCALE / (zoomLevel.value / 100)
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
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, composite.width, composite.height)
  ctx.drawImage(pdfC, 0, 0)
  ctx.scale(k, k)

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
      if (stroke.isDraft) return
      ctx.fillStyle = stroke.color
      ctx.font = (stroke.fontSize || TEXT_FONT_SIZE) + 'px Arial'
      ctx.textBaseline = 'top'
      ctx.fillText(stroke.text, stroke.x, stroke.y)
      ctx.textBaseline = 'alphabetic'
    }
  })

  return composite
}

// Export functions
const exportAsPNG = async () => {
  try {
    if (showTextInput.value) addText() // do not lose text that is still being typed
    const baseName = fileName.value.replace(/\.pdf$/i, '')
    successMsg.value = 'Exporting PNG…'

    const pageCanvases = []
    for (let p = 1; p <= pageCount.value; p++) {
      pageCanvases.push(await renderPageToCanvas(p))
    }

    const PAGE_GAP = 16
    const combinedWidth = Math.max(...pageCanvases.map(c => c.width))
    const combinedHeight = pageCanvases.reduce((sum, c) => sum + c.height, 0) + PAGE_GAP * (pageCanvases.length - 1)

    const combinedCanvas = document.createElement('canvas')
    combinedCanvas.width = combinedWidth
    combinedCanvas.height = combinedHeight
    const ctx = combinedCanvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, combinedWidth, combinedHeight)

    let yOffset = 0
    for (const pageCanvas of pageCanvases) {
      const xOffset = (combinedWidth - pageCanvas.width) / 2
      ctx.drawImage(pageCanvas, xOffset, yOffset)
      yOffset += pageCanvas.height + PAGE_GAP
    }

    const link = document.createElement('a')
    link.href = combinedCanvas.toDataURL('image/png')
    link.download = `${baseName}_annotated.png`
    link.click()

    successMsg.value = `Exported ${pageCount.value} page(s) as PNG!`
    setTimeout(() => successMsg.value = '', 3000)
  } catch (e) {
    errorMsg.value = 'Export failed: ' + e.message
    setTimeout(() => errorMsg.value = '', 3000)
  }
}

// Vector export: keeps the original pages (selectable text, small file) and draws the
// annotations on top. Returns null when it cannot do that faithfully (rotated or offset
// pages, text outside the Latin-1 range) so the caller can fall back to the raster export.
const buildVectorPDF = async () => {
  const { PDFDocument, StandardFonts, rgb, LineCapStyle } = await import('pdf-lib')
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const z = zoomLevel.value / 100
  const toColor = (hex) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''))
    const n = m ? parseInt(m[1], 16) : 0
    return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
  }

  const pages = doc.getPages()
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const box = page.getMediaBox()
    if (page.getRotation().angle !== 0 || box.x !== 0 || box.y !== 0) return null
    const H = box.height
    for (const a of pageAnnotations[i + 1] || []) {
      if (a.type === 'path' && a.points.length > 0) {
        const d = a.points.map((pt, n) => `${n === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ')
        page.drawSvgPath(a.points.length === 1 ? d + ' l 0.01 0' : d, {
          x: 0, y: H, scale: 1 / z,
          borderColor: toColor(a.color), borderWidth: a.width / z,
          borderOpacity: a.opacity ?? 1, borderLineCap: LineCapStyle.Round
        })
      } else if (a.type === 'rect') {
        page.drawRectangle({
          x: Math.min(a.x, a.x + a.w) / z, y: H - Math.max(a.y, a.y + a.h) / z,
          width: Math.abs(a.w) / z, height: Math.abs(a.h) / z,
          borderColor: toColor(a.color), borderWidth: a.width / z
        })
      } else if (a.type === 'text' && !a.isDraft && a.text) {
        try { font.widthOfTextAtSize(a.text, 1) } catch { return null }
        const size = (a.fontSize || TEXT_FONT_SIZE) / z
        // canvas text is drawn from the top of the line box, pdf-lib from the baseline
        page.drawText(a.text, { x: a.x / z, y: H - a.y / z - size * 0.8, size, font, color: toColor(a.color) })
      }
    }
  }
  return doc.save()
}

const saveBlob = (bytes, name) => {
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const exportAsPDF = async () => {
  try {
    const { jsPDF } = await import('jspdf')
    const baseName = fileName.value.replace(/\.pdf$/i, '')
    successMsg.value = 'Exporting PDF…'

    if (showTextInput.value) addText() // do not lose text that is still being typed
    const vector = pdfBytes ? await buildVectorPDF() : null
    if (vector) {
      saveBlob(vector, `${baseName}_annotated.pdf`)
      successMsg.value = `Exported ${pageCount.value} page(s) as PDF!`
      setTimeout(() => successMsg.value = '', 3000)
      return
    }

    let pdf = null
    for (let p = 1; p <= pageCount.value; p++) {
      const canvas = await renderPageToCanvas(p)
      // JPEG q0.95 at 2x keeps text crisp at ~1/10 of the PNG file size
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      // jsPDF pt = original PDF size, so the export prints at the same size as the source
      const w = canvas.width / EXPORT_SCALE
      const h = canvas.height / EXPORT_SCALE

      if (!pdf) {
        pdf = new jsPDF({
          orientation: w > h ? 'l' : 'p',
          unit: 'pt',
          format: [w, h]
        })
      } else {
        pdf.addPage([w, h], w > h ? 'l' : 'p')
      }
      pdf.addImage(imgData, 'JPEG', 0, 0, w, h)
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

onMounted(() => {
  // Setup worker fallback after component is mounted
  setupWorkerFallback().catch(() => {})

  window.addEventListener('keydown', handleGlobalKeydown)
  
})

watch(() => themeStore.theme, async () => {
  if (!pdfLoaded.value) return
  await nextTick()
  redrawAnnotations()
})

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
  max-width: 100vw;
}

.sidebar-toggle-btn {
  display: none;
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
  cursor: default;
}

.annotation-overlay.tool-active {
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

[data-bs-theme="dark"] .pdf-editor-container {
  background: linear-gradient(180deg, #0f1722 0%, #0a111b 100%);
  color: #d6e0e8;
}

[data-bs-theme="dark"] .header-nav {
  background: rgba(21,33,51,0.92);
  border-bottom-color: rgba(122,154,184,0.14);
  box-shadow: 0 1px 16px rgba(0,0,0,0.38);
}

[data-bs-theme="dark"] .header-title {
  color: #d6e0e8;
}

[data-bs-theme="dark"] .nav-btn-back {
  background: linear-gradient(135deg, #6f8fa8, #5f7b92);
  color: #f4f7fa;
}

[data-bs-theme="dark"] .nav-btn-back:hover {
  background: linear-gradient(135deg, #7ea2bd, #6f8fa8);
}

[data-bs-theme="dark"] .file-upload-area {
  background: rgba(21,33,51,0.82);
  border-color: rgba(122,154,184,0.22);
  box-shadow: 0 4px 28px rgba(0,0,0,0.34);
}

[data-bs-theme="dark"] .file-upload-area.dragover {
  background: rgba(30,58,95,0.34);
  border-color: rgba(126,162,189,0.54);
}

[data-bs-theme="dark"] .file-upload-area h2,
[data-bs-theme="dark"] .sidebar-section h3,
[data-bs-theme="dark"] .page-info,
[data-bs-theme="dark"] .zoom-info {
  color: #d6e0e8;
}

[data-bs-theme="dark"] .file-upload-area p {
  color: #8aa0af;
}

[data-bs-theme="dark"] .toolbar,
[data-bs-theme="dark"] .right-sidebar {
  background: rgba(21,33,51,0.92);
  border-color: rgba(122,154,184,0.16);
  color: #d6e0e8;
}

[data-bs-theme="dark"] .pdf-viewer {
  background: radial-gradient(ellipse at top, rgba(122,154,184,0.10), transparent 60%), #0f1722;
}

[data-bs-theme="dark"] .pdf-container {
  background: #f8fafc;
  box-shadow: 0 12px 32px rgba(0,0,0,0.48);
  border: 1px solid rgba(122,154,184,0.18);
}

[data-bs-theme="dark"] .toolbar-group {
  border-right-color: rgba(122,154,184,0.14);
}

[data-bs-theme="dark"] .tool-btn,
[data-bs-theme="dark"] .nav-btn,
[data-bs-theme="dark"] .zoom-btn,
[data-bs-theme="dark"] .action-btn,
[data-bs-theme="dark"] .export-btn,
[data-bs-theme="dark"] .tool-action-btn,
[data-bs-theme="dark"] .btn-secondary {
  background: rgba(15,23,34,0.82);
  border-color: rgba(122,154,184,0.22);
  color: #d6e0e8;
}

[data-bs-theme="dark"] .tool-btn:hover,
[data-bs-theme="dark"] .nav-btn:hover,
[data-bs-theme="dark"] .zoom-btn:hover,
[data-bs-theme="dark"] .action-btn:hover,
[data-bs-theme="dark"] .export-btn:hover,
[data-bs-theme="dark"] .tool-action-btn:hover,
[data-bs-theme="dark"] .btn-secondary:hover {
  background: rgba(30,58,95,0.42);
  border-color: rgba(126,162,189,0.46);
}

[data-bs-theme="dark"] .tool-btn.active,
[data-bs-theme="dark"] .btn-primary,
[data-bs-theme="dark"] .upload-btn {
  background: linear-gradient(135deg, #6f8fa8, #5f7b92);
  border-color: transparent;
  color: #f4f7fa;
}

[data-bs-theme="dark"] .color-btn {
  border-color: rgba(122,154,184,0.32);
  box-shadow: 0 0 0 2px rgba(21,33,51,0.85), 0 0 0 4px rgba(122,154,184,0.18);
}

[data-bs-theme="dark"] .color-btn.active {
  border-color: #d6e0e8;
  box-shadow: 0 0 0 2px rgba(21,33,51,0.9), 0 0 0 4px rgba(126,162,189,0.38);
}

[data-bs-theme="dark"] .page-input,
[data-bs-theme="dark"] .direct-text-input {
  background: rgba(15,23,34,0.92);
  border-color: rgba(126,162,189,0.45);
  color: #d6e0e8;
}

[data-bs-theme="dark"] .message.success-msg {
  background: rgba(20,87,63,0.55);
  color: #c7f3dd;
  border-color: rgba(41,154,111,0.28);
}

[data-bs-theme="dark"] .message.error-msg {
  background: rgba(117,26,41,0.56);
  color: #ffd4da;
  border-color: rgba(220,53,69,0.28);
}

[data-bs-theme="dark"] .modal-overlay {
  background: rgba(4,8,14,0.7);
}

[data-bs-theme="dark"] .modal {
  background: rgba(21,33,51,0.96);
  color: #d6e0e8;
  border: 1px solid rgba(122,154,184,0.14);
}

/* ============================================
   RESPONSIVE (mobile) — toolbar/sidebar only
   ============================================ */
@media (max-width: 767.98px) {
  .sidebar-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    min-width: 44px;
    min-height: 44px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    color: #333;
    margin-left: auto;
  }

  .tool-btn, .nav-btn, .zoom-btn, .color-btn {
    min-width: 44px;
    min-height: 44px;
  }

  .editor-content {
    position: relative;
  }

  .right-sidebar {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 85vw;
    max-width: 300px;
    transform: translateX(100%);
    transition: transform 0.2s ease;
    box-shadow: -2px 0 12px rgba(0,0,0,0.15);
    z-index: 5;
  }

  .right-sidebar.open {
    transform: translateX(0);
  }
}

[data-bs-theme="dark"] .sidebar-toggle-btn {
  background: rgba(21,33,51,0.85);
  border-color: rgba(122,154,184,0.22);
  color: #d6e0e8;
}
</style>
