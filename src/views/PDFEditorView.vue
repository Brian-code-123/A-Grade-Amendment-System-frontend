<script setup>
import { ref, nextTick, onMounted, onUnmounted, computed, watch } from 'vue'
import jsPDF from 'jspdf'

/* ── State ──────────────────────────────────────────────────────── */
const pdfLoaded = ref(false)
const fileName = ref('')
const pageCount = ref(0)
const currentPage = ref(1)
const zoom = ref(1.5)
const activeTool = ref('select')
const penColor = ref('#000000')
const penWidth = ref(3)
const textSize = ref(18)
const thumbnails = ref([])
const isDragOver = ref(false)
const isExporting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

let pdfjsLib = null
let fabric = null
let pdfDoc = null
let fCanvas = null
const pageStates = {}

/* ── Library Init (dynamic import for browser-only libs) ─────── */
async function ensureLibs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
  }
  if (!fabric) {
    fabric = await import('fabric')
  }
}

/* ── File Handling ──────────────────────────────────────────────── */
function onDragOver(e) { e.preventDefault(); isDragOver.value = true }
function onDragLeave() { isDragOver.value = false }
async function onDrop(e) {
  e.preventDefault(); isDragOver.value = false
  const f = e.dataTransfer?.files[0]
  if (f) await loadPdf(f)
}
async function onFileInput(e) {
  const f = e.target?.files[0]
  if (f) await loadPdf(f)
}

async function loadPdf(file) {
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    errorMsg.value = 'Please select a PDF file'; return
  }
  errorMsg.value = ''
  try {
    await ensureLibs()
    fileName.value = file.name
    const buf = await file.arrayBuffer()
    pdfDoc = await pdfjsLib.getDocument({ data: buf }).promise
    pageCount.value = pdfDoc.numPages
    currentPage.value = 1
    Object.keys(pageStates).forEach(k => delete pageStates[k])
    if (fCanvas) { fCanvas.dispose(); fCanvas = null }
    pdfLoaded.value = true
    await nextTick()
    await renderPage(1)
    buildThumbnails()
  } catch (e) {
    errorMsg.value = 'Failed to load PDF: ' + e.message
  }
}

function loadNewPdf() {
  pdfLoaded.value = false
  if (fCanvas) { fCanvas.dispose(); fCanvas = null }
  pdfDoc = null
  pageCount.value = 0
  thumbnails.value = []
  Object.keys(pageStates).forEach(k => delete pageStates[k])
}

/* ── PDF → Image ────────────────────────────────────────────────── */
async function pdfPageImage(num, scale) {
  const page = await pdfDoc.getPage(num)
  const vp = page.getViewport({ scale })
  const c = document.createElement('canvas')
  c.width = vp.width; c.height = vp.height
  await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise
  return { url: c.toDataURL('image/png'), w: vp.width, h: vp.height }
}

/* ── Page Rendering ─────────────────────────────────────────────── */
async function renderPage(num) {
  saveAnnotations()
  const { url, w, h } = await pdfPageImage(num, zoom.value)

  if (!fCanvas) {
    await nextTick()
    const el = document.getElementById('editor-canvas')
    if (!el) return
    fCanvas = new fabric.Canvas(el, { width: w, height: h })
  } else {
    fCanvas.clear()
    fCanvas.setDimensions({ width: w, height: h })
  }

  const bg = await fabric.FabricImage.fromURL(url)
  bg.scaleToWidth(w)
  fCanvas.backgroundImage = bg

  const saved = pageStates[num]
  if (saved?.length) {
    try {
      const objs = await fabric.util.enlivenObjects(saved)
      objs.forEach(o => fCanvas.add(o))
    } catch (e) { console.warn('Restore failed:', e) }
  }

  fCanvas.renderAll()
  applyTool()
}

function saveAnnotations() {
  if (!fCanvas) return
  const objs = fCanvas.getObjects()
  if (objs.length > 0) {
    pageStates[currentPage.value] = objs.map(o => o.toObject())
  } else {
    delete pageStates[currentPage.value]
  }
}

/* ── Thumbnails ─────────────────────────────────────────────────── */
async function buildThumbnails() {
  const arr = []
  for (let i = 1; i <= pageCount.value; i++) {
    const { url } = await pdfPageImage(i, 0.2)
    arr.push({ num: i, url })
  }
  thumbnails.value = arr
}

/* ── Navigation ─────────────────────────────────────────────────── */
async function goToPage(n) {
  if (n < 1 || n > pageCount.value || n === currentPage.value) return
  currentPage.value = n
  await renderPage(n)
}

/* ── Zoom ───────────────────────────────────────────────────────── */
async function zoomIn() { zoom.value = Math.min(zoom.value + 0.25, 3); await renderPage(currentPage.value) }
async function zoomOut() { zoom.value = Math.max(zoom.value - 0.25, 0.5); await renderPage(currentPage.value) }
const zoomPct = computed(() => Math.round(zoom.value * 100))

/* ── Pointer Helper ─────────────────────────────────────────────── */
function getPoint(opt) {
  if (opt.scenePoint) return opt.scenePoint
  try { return fCanvas.getScenePoint(opt.e) } catch {}
  try { return fCanvas.getPointer(opt.e) } catch {}
  const r = fCanvas.getElement().getBoundingClientRect()
  return { x: opt.e.clientX - r.left, y: opt.e.clientY - r.top }
}

/* ── Tools ──────────────────────────────────────────────────────── */
const tools = [
  { id: 'select',    icon: 'bi-cursor',      label: 'Select' },
  { id: 'text',      icon: 'bi-fonts',       label: 'Text' },
  { id: 'draw',      icon: 'bi-pencil',      label: 'Draw' },
  { id: 'highlight', icon: 'bi-highlighter', label: 'Highlight' },
  { id: 'rect',      icon: 'bi-square',      label: 'Rectangle' },
  { id: 'circle',    icon: 'bi-circle',      label: 'Circle' },
  { id: 'image',     icon: 'bi-image',       label: 'Image' },
]

function setTool(t) {
  activeTool.value = t
  if (t === 'image') { document.getElementById('img-input')?.click(); return }
  applyTool()
}

function applyTool() {
  if (!fCanvas) return
  const fc = fCanvas

  fc.isDrawingMode = false
  fc.selection = false
  fc.defaultCursor = 'default'
  fc.off('mouse:down'); fc.off('mouse:move'); fc.off('mouse:up')

  fc.getObjects().forEach(o => {
    o.selectable = activeTool.value === 'select'
    o.evented = activeTool.value === 'select'
  })

  switch (activeTool.value) {
    case 'select':
      fc.selection = true
      fc.defaultCursor = 'default'
      break

    case 'draw':
      fc.isDrawingMode = true
      fc.freeDrawingBrush = new fabric.PencilBrush(fc)
      fc.freeDrawingBrush.color = penColor.value
      fc.freeDrawingBrush.width = penWidth.value
      break

    case 'text':
      fc.defaultCursor = 'text'
      fc.on('mouse:down', (opt) => {
        if (opt.target) return
        const p = getPoint(opt)
        const txt = new fabric.IText('Text', {
          left: p.x, top: p.y,
          fontSize: textSize.value,
          fill: penColor.value,
          fontFamily: 'Arial',
        })
        fc.add(txt)
        fc.setActiveObject(txt)
        txt.enterEditing()
        txt.selectAll()
      })
      break

    case 'highlight':
      setupShapeDraw('rect', { fill: penColor.value + '50', stroke: '', strokeWidth: 0 })
      break

    case 'rect':
      setupShapeDraw('rect', { fill: 'transparent', stroke: penColor.value, strokeWidth: penWidth.value })
      break

    case 'circle':
      setupShapeDraw('ellipse', { fill: 'transparent', stroke: penColor.value, strokeWidth: penWidth.value })
      break
  }
}

function setupShapeDraw(type, opts) {
  const fc = fCanvas
  fc.defaultCursor = 'crosshair'
  let origin = null, shape = null

  fc.on('mouse:down', (opt) => {
    if (opt.target) return
    origin = getPoint(opt)
    const base = { left: origin.x, top: origin.y, selectable: false, ...opts }
    shape = type === 'ellipse'
      ? new fabric.Ellipse({ ...base, rx: 0, ry: 0 })
      : new fabric.Rect({ ...base, width: 0, height: 0 })
    fc.add(shape)
  })

  fc.on('mouse:move', (opt) => {
    if (!origin || !shape) return
    const p = getPoint(opt)
    const w = Math.abs(p.x - origin.x)
    const h = Math.abs(p.y - origin.y)
    const left = Math.min(origin.x, p.x)
    const top = Math.min(origin.y, p.y)
    if (type === 'ellipse') {
      shape.set({ left, top, rx: w / 2, ry: h / 2 })
    } else {
      shape.set({ left, top, width: w, height: h })
    }
    fc.renderAll()
  })

  fc.on('mouse:up', () => {
    if (shape) shape.set({ selectable: true, evented: true })
    origin = null; shape = null
  })
}

/* ── Image Insert ───────────────────────────────────────────────── */
async function onImageSelect(e) {
  const file = e.target?.files[0]
  if (!file || !fCanvas) return
  const url = URL.createObjectURL(file)
  try {
    const img = await fabric.FabricImage.fromURL(url)
    img.scaleToWidth(Math.min(200, fCanvas.width / 3))
    img.set({ left: 50, top: 50 })
    fCanvas.add(img)
    fCanvas.setActiveObject(img)
    fCanvas.renderAll()
    activeTool.value = 'select'
    applyTool()
  } finally {
    URL.revokeObjectURL(url)
    e.target.value = ''
  }
}

/* ── Actions ────────────────────────────────────────────────────── */
function deleteSelected() {
  if (!fCanvas) return
  fCanvas.getActiveObjects().forEach(o => fCanvas.remove(o))
  fCanvas.discardActiveObject()
  fCanvas.renderAll()
}

function clearPage() {
  if (!fCanvas || !confirm('Clear all annotations on this page?')) return
  ;[...fCanvas.getObjects()].forEach(o => fCanvas.remove(o))
  fCanvas.renderAll()
}

/* ── Export PDF ──────────────────────────────────────────────────── */
async function exportPdf() {
  if (!pdfDoc || !fCanvas) return
  isExporting.value = true
  errorMsg.value = ''

  try {
    saveAnnotations()
    const images = []

    for (let i = 1; i <= pageCount.value; i++) {
      const { url: bgUrl, w, h } = await pdfPageImage(i, zoom.value)

      if (i === currentPage.value) {
        // Current page — capture fabric canvas (bg + annotations)
        images.push({ url: fCanvas.toDataURL({ format: 'png' }), w, h })
      } else if (pageStates[i]?.length) {
        // Other page with annotations — composite off-screen
        const offEl = document.createElement('canvas')
        offEl.width = w; offEl.height = h
        offEl.style.cssText = 'position:fixed;left:-9999px;top:-9999px'
        document.body.appendChild(offEl)
        try {
          const offC = new fabric.Canvas(offEl, { width: w, height: h })
          const bg = await fabric.FabricImage.fromURL(bgUrl)
          bg.scaleToWidth(w)
          offC.backgroundImage = bg
          const objs = await fabric.util.enlivenObjects(pageStates[i])
          objs.forEach(o => offC.add(o))
          offC.renderAll()
          images.push({ url: offC.toDataURL({ format: 'png' }), w, h })
          offC.dispose()
        } catch { images.push({ url: bgUrl, w, h }) }
        finally { offEl.remove() }
      } else {
        // Plain PDF page
        images.push({ url: bgUrl, w, h })
      }
    }

    const f = images[0]
    const orient = f.w > f.h ? 'l' : 'p'
    const pdf = new jsPDF({ orientation: orient, unit: 'px', format: [f.w, f.h], hotfixes: ['px_scaling'] })

    for (let i = 0; i < images.length; i++) {
      if (i > 0) pdf.addPage([images[i].w, images[i].h])
      pdf.addImage(images[i].url, 'PNG', 0, 0, images[i].w, images[i].h)
    }

    pdf.save(fileName.value.replace(/\.pdf$/i, '') + ' - Annotated.pdf')
    successMsg.value = 'PDF exported successfully!'
  } catch (e) {
    errorMsg.value = 'Export failed: ' + e.message
  } finally {
    isExporting.value = false
  }
}

/* ── Keyboard Shortcuts ─────────────────────────────────────────── */
function onKeyDown(e) {
  if (!fCanvas) return
  if ((e.key === 'Delete' || e.key === 'Backspace') && !fCanvas.getActiveObject()?.isEditing) {
    deleteSelected()
    e.preventDefault()
  }
}

/* ── Reactivity: update brush on color/width change ────────────── */
watch(penColor, () => {
  if (fCanvas?.isDrawingMode && fCanvas.freeDrawingBrush) {
    fCanvas.freeDrawingBrush.color = penColor.value
  }
})
watch(penWidth, () => {
  if (fCanvas?.isDrawingMode && fCanvas.freeDrawingBrush) {
    fCanvas.freeDrawingBrush.width = penWidth.value
  }
})

onMounted(() => document.addEventListener('keydown', onKeyDown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
  if (fCanvas) { fCanvas.dispose(); fCanvas = null }
})
</script>

<template>
  <div class="d-flex flex-column" style="height: calc(100vh - 56px)">
    <!-- Alerts -->
    <div v-if="errorMsg" class="alert alert-danger alert-dismissible m-2 mb-0 py-2">
      {{ errorMsg }}<button class="btn-close btn-sm" @click="errorMsg = ''"></button>
    </div>
    <div v-if="successMsg" class="alert alert-success alert-dismissible m-2 mb-0 py-2">
      {{ successMsg }}<button class="btn-close btn-sm" @click="successMsg = ''"></button>
    </div>

    <!-- ═══ Drop Zone (no PDF loaded) ═══ -->
    <div
      v-if="!pdfLoaded"
      class="flex-grow-1 d-flex align-items-center justify-content-center"
      :class="{ 'drop-active': isDragOver }"
      style="border: 3px dashed #ccc; margin: 2rem; border-radius: 1rem; transition: all .2s"
      @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop"
    >
      <div class="text-center">
        <i class="bi bi-file-earmark-pdf display-1 text-danger mb-3 d-block"></i>
        <h4 class="fw-bold">Drag & Drop PDF Here</h4>
        <p class="text-muted mb-3">or click to browse</p>
        <label class="btn btn-primary btn-lg">
          <i class="bi bi-folder2-open me-2"></i>Browse Files
          <input type="file" accept=".pdf,application/pdf" class="d-none" @change="onFileInput" />
        </label>
      </div>
    </div>

    <!-- ═══ Editor (PDF loaded) ═══ -->
    <template v-else>
      <!-- Toolbar -->
      <div class="bg-white border-bottom px-3 py-2 d-flex align-items-center gap-2 flex-wrap">
        <!-- File -->
        <button class="btn btn-sm btn-outline-secondary" @click="loadNewPdf" title="Open New PDF">
          <i class="bi bi-file-earmark-plus"></i>
        </button>
        <div class="vr mx-1"></div>

        <!-- Tool Buttons -->
        <button
          v-for="t in tools" :key="t.id"
          class="btn btn-sm"
          :class="activeTool === t.id ? 'btn-primary' : 'btn-outline-secondary'"
          @click="setTool(t.id)" :title="t.label"
        >
          <i class="bi" :class="t.icon"></i>
          <span class="d-none d-md-inline ms-1">{{ t.label }}</span>
        </button>
        <input id="img-input" type="file" accept="image/*" class="d-none" @change="onImageSelect" />

        <div class="vr mx-1"></div>

        <!-- Color -->
        <label class="d-flex align-items-center gap-1 small">
          <span class="text-muted">Color:</span>
          <input type="color" v-model="penColor" class="form-control form-control-color p-0 border-0" style="width:28px;height:28px" />
        </label>

        <!-- Pen Width (draw/shape tools) -->
        <label v-if="['draw','rect','circle'].includes(activeTool)" class="d-flex align-items-center gap-1 small">
          <span class="text-muted">Width:</span>
          <input type="range" v-model.number="penWidth" min="1" max="20" class="form-range" style="width:80px" />
          <span class="badge bg-secondary">{{ penWidth }}</span>
        </label>

        <!-- Font Size (text tool) -->
        <label v-if="activeTool === 'text'" class="d-flex align-items-center gap-1 small">
          <span class="text-muted">Size:</span>
          <select v-model.number="textSize" class="form-select form-select-sm" style="width:70px">
            <option v-for="s in [12,14,16,18,20,24,28,36,48]" :key="s" :value="s">{{ s }}</option>
          </select>
        </label>

        <div class="ms-auto d-flex align-items-center gap-2">
          <!-- Delete / Clear -->
          <button class="btn btn-sm btn-outline-danger" @click="deleteSelected" title="Delete Selected">
            <i class="bi bi-trash"></i>
          </button>
          <button class="btn btn-sm btn-outline-warning" @click="clearPage" title="Clear Page Annotations">
            <i class="bi bi-eraser"></i>
          </button>
          <div class="vr mx-1"></div>
          <!-- Export -->
          <button class="btn btn-sm btn-success" @click="exportPdf" :disabled="isExporting">
            <span v-if="isExporting" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-download me-1"></i>Download
          </button>
        </div>
      </div>

      <!-- Main Area: Sidebar + Canvas -->
      <div class="flex-grow-1 d-flex overflow-hidden">
        <!-- Thumbnails sidebar -->
        <div class="border-end bg-light" style="width:110px;overflow-y:auto;flex-shrink:0">
          <div class="p-2">
            <div
              v-for="t in thumbnails" :key="t.num"
              class="mb-2 text-center cursor-pointer"
              @click="goToPage(t.num)"
            >
              <div
                class="border rounded overflow-hidden mx-auto"
                :class="{ 'border-primary border-2 shadow': t.num === currentPage }"
                style="max-width:90px"
              >
                <img :src="t.url" class="w-100" :alt="'Page ' + t.num" />
              </div>
              <small class="text-muted">{{ t.num }}</small>
            </div>
          </div>
        </div>

        <!-- Canvas area -->
        <div class="flex-grow-1 overflow-auto d-flex justify-content-center align-items-start p-3"
             style="background:linear-gradient(135deg,#e2e8f0 0%,#cbd5e1 100%)">
          <div class="shadow-lg" style="line-height:0">
            <canvas id="editor-canvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Bottom Bar: Page Nav + Zoom -->
      <div class="bg-white border-top px-3 py-2 d-flex align-items-center justify-content-between">
        <!-- Page Navigation -->
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary" @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1">
            <i class="bi bi-chevron-left"></i>
          </button>
          <span class="fw-semibold">
            Page
            <input
              type="number" :value="currentPage" min="1" :max="pageCount"
              class="form-control form-control-sm d-inline-block text-center"
              style="width:50px"
              @change="goToPage(+$event.target.value)"
            />
            / {{ pageCount }}
          </span>
          <button class="btn btn-sm btn-outline-secondary" @click="goToPage(currentPage + 1)" :disabled="currentPage >= pageCount">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>

        <!-- File name -->
        <span class="text-muted small d-none d-md-inline">
          <i class="bi bi-file-earmark-pdf text-danger me-1"></i>{{ fileName }}
        </span>

        <!-- Zoom -->
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary" @click="zoomOut" title="Zoom Out">
            <i class="bi bi-zoom-out"></i>
          </button>
          <span class="badge bg-secondary">{{ zoomPct }}%</span>
          <button class="btn btn-sm btn-outline-secondary" @click="zoomIn" title="Zoom In">
            <i class="bi bi-zoom-in"></i>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.drop-active {
  border-color: #0d6efd !important;
  background: rgba(13, 110, 253, 0.05);
}
.cursor-pointer { cursor: pointer; }
.canvas-container { /* fabric.js wrapper class */
  margin: 0 auto;
  line-height: 0;
}
</style>
