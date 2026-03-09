<template>
  <div class="signature-board">
    <!-- 標題 -->
    <div class="mb-3">
      <h6 class="mb-2">
        <i class="bi bi-pen me-2"></i>Digital Signature Board
      </h6>
      <p class="text-muted small">Please sign below. Your signature will be saved as PNG.</p>
    </div>

    <!-- Canvas -->
    <div class="signature-canvas-wrapper border rounded p-3 mb-3" :class="{ 'border-danger': hasValidationError }">
      <canvas
        ref="signatureCanvas"
        class="w-100 bg-white border rounded"
        style="cursor: crosshair; touch-action: none; display: block; max-width: 100%;"
      ></canvas>
    </div>

    <!-- 驗證錯誤 -->
    <div v-if="hasValidationError" class="alert alert-danger alert-sm mb-3 py-2">
      <i class="bi bi-exclamation-circle me-1"></i>{{ validationError }}
    </div>

    <!-- 控制按鈕 -->
    <div class="d-flex gap-2 mb-3">
      <button
        type="button"
        class="btn btn-sm btn-outline-secondary"
        @click="clearSignature"
      >
        <i class="bi bi-arrow-counterclockwise me-1"></i>Clear
      </button>
      <button
        type="button"
        class="btn btn-sm btn-outline-success"
        @click="updatePreview"
      >
        <i class="bi bi-check-lg me-1"></i>Confirm
      </button>
    </div>

    <!-- 簽名預覽 -->
    <div v-if="signaturePreview" class="mb-3">
      <p class="small text-muted mb-2">Preview:</p>
      <div class="p-3 border rounded bg-light d-flex align-items-center justify-content-center" 
           style="min-height: 80px;">
        <img :src="signaturePreview" :alt="'Signature preview'" style="max-width: 100%; max-height: 80px;" />
      </div>
    </div>

    <!-- 確認按鈕 -->
    <div class="d-flex gap-2">
      <button
        type="button"
        class="btn btn-primary flex-grow-1"
        @click="confirmSignature"
        :disabled="!isSignatureValid && !signaturePreview"
      >
        <i class="bi bi-check-circle me-1"></i>Confirm Signature
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary"
        @click="cancelSignature"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import SignaturePad from 'signature_pad'

const props = defineProps({
  existingSignature: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['signature-confirmed', 'cancelled'])

// Ref
const signatureCanvas = ref(null)
let signaturePad = null

// 狀態
const signaturePreview = ref(props.existingSignature || null)
const hasValidationError = ref(false)
const validationError = ref('')

// 計算屬性
const isSignatureValid = ref(!!props.existingSignature) // Start as true if existing signature exists

// 生命週期
onMounted(async () => {
  await nextTick()
  initSignaturePad()
})

// 方法
const initSignaturePad = () => {
  if (!signatureCanvas.value) return

  // 設置canvas尺寸
  const container = signatureCanvas.value.parentElement
  const rect = container.getBoundingClientRect()
  
  signatureCanvas.value.width = rect.width - 24 // 減去padding
  signatureCanvas.value.height = 300

  // 高分辨率支持
  const dpr = window.devicePixelRatio || 1
  signatureCanvas.value.width *= dpr
  signatureCanvas.value.height *= dpr
  signatureCanvas.value.getContext('2d').scale(dpr, dpr)
  signatureCanvas.value.style.width = (rect.width - 24) + 'px'
  signatureCanvas.value.style.height = '300px'

  // 初始化簽名板
  signaturePad = new SignaturePad(signatureCanvas.value, {
    minWidth: 0.5,
    maxWidth: 2.5,
    throttle: 16,
    penColor: '#000000',
    backgroundColor: 'rgba(255, 255, 255, 0)'
  })

  // 監聽繪製事件
  signatureCanvas.value.addEventListener('mousedown', () => {
    hasValidationError.value = false
  })

  signatureCanvas.value.addEventListener('mouseup', () => {
    setTimeout(checkSignatureValidity, 50) // Small delay to ensure stroke is complete
  })
  
  signatureCanvas.value.addEventListener('touchstart', (e) => {
    e.preventDefault()
    hasValidationError.value = false
  })
  
  signatureCanvas.value.addEventListener('touchmove', (e) => {
    e.preventDefault()
  })
  
  signatureCanvas.value.addEventListener('touchend', (e) => {
    e.preventDefault()
    setTimeout(checkSignatureValidity, 50) // Small delay to ensure stroke is complete
  })

  // If editing existing signature, ensure it's loaded and valid
  if (props.existingSignature) {
    signaturePreview.value = props.existingSignature
    isSignatureValid.value = true
  }
}

const checkSignatureValidity = () => {
  if (!signaturePad) return
  
  const isEmpty = signaturePad.isEmpty()
  isSignatureValid.value = !isEmpty
  hasValidationError.value = false // Clear any validation errors
  
  if (!isEmpty) {
    updatePreview()
  } else {
    signaturePreview.value = null
  }
}

const updatePreview = () => {
  if (!signaturePad || signaturePad.isEmpty()) return
  
  // 轉換為PNG數據URL
  signaturePreview.value = signaturePad.toDataURL('image/png')
}

const clearSignature = () => {
  if (!signaturePad) return
  signaturePad.clear()
  signaturePreview.value = null
  isSignatureValid.value = false
  hasValidationError.value = false
}

const undoSignature = () => {
  if (!signaturePad) return
  
  const data = signaturePad.toData()
  if (data.length > 0) {
    data.pop()
    signaturePad.fromData(data)
    checkSignatureValidity()
  }
}

const confirmSignature = () => {
  // If there's a preview, use it; otherwise check if signature pad has valid signature
  if (signaturePreview.value) {
    emit('signature-confirmed', signaturePreview.value)
    return
  }
  
  if (!isSignatureValid.value) {
    hasValidationError.value = true
    validationError.value = 'Please draw your signature'
    return
  }

  const signatureData = signaturePad.toDataURL('image/png')
  emit('signature-confirmed', signatureData)
}

const cancelSignature = () => {
  emit('cancelled')
}
</script>

<style scoped>
.signature-board {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
}

.signature-canvas-wrapper {
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

canvas {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}

:deep(.dark-mode) .signature-board {
  background: rgba(30, 50, 80, 0.2);
}

@media (max-width: 576px) {
  .signature-canvas-wrapper {
    min-height: 250px;
  }

  .signature-board {
    padding: 1rem;
  }
}
</style>
