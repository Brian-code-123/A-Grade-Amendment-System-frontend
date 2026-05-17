<script setup>
import { ref, onMounted, watch } from 'vue'
import SignaturePad from 'signature_pad'
import { useAuthStore } from '@/stores/authStore'

const canvasRef = ref(null)
let signaturePad = null
const isDrawing = ref(false)
const hasSignature = ref(false)
const agreementChecked = ref(false)
const isLoading = ref(false)
const message = ref('')
const messageType = ref('info') // 'info', 'success', 'danger'

const auth = useAuthStore()

onMounted(() => {
  if (!canvasRef.value) return
  
  // Set canvas size
  const canvas = canvasRef.value
  const rect = canvas.parentElement.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = 200
  
  // Initialize signature pad
  signaturePad = new SignaturePad(canvas, {
    backgroundColor: 'rgb(255, 255, 255)',
    penColor: 'rgb(0, 0, 0)',
    minWidth: 1,
    maxWidth: 3
  })
  
  // Check if user already has a signature
  if (auth.user?.signature) {
    hasSignature.value = true
  }
})

function startDrawing() {
  isDrawing.value = true
}

function stopDrawing() {
  isDrawing.value = false
  if (signaturePad && !signaturePad.isEmpty()) {
    hasSignature.value = true
  }
}

function clearSignature() {
  if (signaturePad) {
    signaturePad.clear()
    hasSignature.value = false
  }
}

async function saveSignature() {
  if (!signaturePad || signaturePad.isEmpty()) {
    message.value = 'Please draw your signature'
    messageType.value = 'danger'
    return
  }
  
  if (!agreementChecked.value) {
    message.value = 'Please agree to the terms'
    messageType.value = 'danger'
    return
  }
  
  isLoading.value = true
  message.value = ''
  
  try {
    // Get signature as data URL
    const signatureImage = signaturePad.toDataURL('image/png')
    
    // Save to auth store
    await auth.saveSignature(signatureImage)
    
    message.value = 'Signature saved successfully! It will be used on all future PDF forms.'
    messageType.value = 'success'
    
    // Clear form
    setTimeout(() => {
      clearSignature()
      agreementChecked.value = false
    }, 1500)
    
    // Redirect to home after 2.5 seconds with refresh
    setTimeout(() => {
      window.location.replace('/') // Full page reload
    }, 2500)
    
  } catch (error) {
    console.error('Error saving signature:', error)
    message.value = 'Error saving signature. Your signature has been saved locally and will work on PDFs. Please refresh the page.'
    messageType.value = 'warning'
    
    // Still allow retry or navigation
    setTimeout(() => {
      window.location.replace('/')
    }, 3000)
  } finally {
    isLoading.value = false
  }
}

function resizeCanvas() {
  if (!canvasRef.value || !signaturePad) return
  
  const canvas = canvasRef.value
  const imageData = signaturePad.toData()
  
  const rect = canvas.parentElement.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = 200
  
  signaturePad.fromData(imageData)
}

watch(() => window.innerWidth, () => {
  resizeCanvas()
})
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-lg">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0"><i class="bi bi-pen"></i> Digital Signature Setup</h4>
          </div>
          
          <div class="card-body">
            <!-- Message -->
            <div v-if="message" :class="`alert alert-${messageType}`" role="alert">
              {{ message }}
            </div>
            
            <!-- Info -->
            <div class="alert alert-info">
              <i class="bi bi-info-circle"></i> 
              <strong>Important:</strong> Your digital signature will be saved to your account and automatically used on all grade amendment PDF forms. You only need to sign once.
            </div>
            
            <!-- Signature Canvas -->
            <div class="mb-4">
              <label class="form-label fw-bold">Please Sign Below:</label>
              <div class="border rounded border-2" style="background: white;">
                <canvas
                  ref="canvasRef"
                  @mousedown="startDrawing"
                  @mouseup="stopDrawing"
                  @mouseleave="stopDrawing"
                  @touchstart="startDrawing"
                  @touchend="stopDrawing"
                  style="display: block; cursor: crosshair; width: 100%;"
                ></canvas>
              </div>
              <small class="text-muted">Draw your signature above using your mouse or touch device</small>
            </div>
            
            <!-- Actions -->
            <div class="d-flex gap-2 mb-4">
              <button 
                @click="clearSignature" 
                class="btn btn-outline-secondary"
                :disabled="!hasSignature"
              >
                <i class="bi bi-arrow-clockwise"></i> Clear
              </button>
              <button 
                @click="saveSignature" 
                class="btn btn-primary"
                :disabled="!hasSignature || !agreementChecked || isLoading"
              >
                <i v-if="!isLoading" class="bi bi-check-circle"></i>
                <i v-else class="bi bi-hourglass-split"></i>
                {{ isLoading ? 'Saving...' : 'Save Signature' }}
              </button>
            </div>
            
            <!-- Agreement Checkbox -->
            <div class="form-check mb-4 p-3 border rounded bg-light">
              <input 
                v-model="agreementChecked"
                type="checkbox" 
                class="form-check-input" 
                id="agreement"
              />
              <label class="form-check-label" for="agreement">
                <small>
                  I agree that my digital signature above is the authentic signature for this account and will be used 
                  on all grade amendment forms. I understand that this signature is legally binding.
                </small>
              </label>
            </div>
            
            <!-- Info Box -->
            <div class="alert alert-secondary">
              <h6 class="fw-bold mb-2"><i class="bi bi-shield-check"></i> What Happens Next?</h6>
              <ul class="mb-0">
                <li>Your signature will be stored securely in your account</li>
                <li>Every PDF you download will include your signature</li>
                <li>You can update your signature anytime in Settings</li>
                <li>Your signature is unique and cannot be changed by others</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
canvas {
  touch-action: none;
}
</style>
