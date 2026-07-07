<template>
  <div class="card glass-card border-0 shadow-sm">
    <div class="card-header border-0 bg-transparent py-3">
      <h5 class="mb-0">
        <i class="bi bi-pencil-square me-2"></i>Edit Profile
      </h5>
    </div>

    <div class="card-body">
      <!-- 簽名強制設定提示 -->
      <div v-if="requiresSignature && !formData.signature" class="alert alert-warning alert-dismissible fade show mb-4" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        <strong>Signature Required!</strong> You must set up your digital signature to proceed.
      </div>

      <!-- 表單 -->
      <form @submit.prevent="handleSave">
        <!-- 顯示名稱 -->
        <div class="mb-4">
          <label for="displayName" class="form-label">
            Display Name <span class="text-danger">*</span>
          </label>
          <input
            id="displayName"
            v-model="formData.name"
            type="text"
            class="form-control glass-input"
            :class="{ 'is-invalid': errors.name }"
            placeholder="Enter your name"
            required
            @blur="validateField('name')"
          />
          <div v-if="errors.name" class="invalid-feedback d-block mt-1">
            {{ errors.name }}
          </div>
        </div>

        <!-- 郵件 (可編輯) -->
        <div class="mb-4">
          <label for="email" class="form-label">
            Email <span class="text-danger">*</span>
          </label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-control glass-input"
            :class="{ 'is-invalid': errors.email }"
            placeholder="Enter your email address"
            required
            @blur="validateField('email')"
          />
          <div v-if="errors.email" class="invalid-feedback d-block mt-1">
            {{ errors.email }}
          </div>
        </div>

        <!-- 用戶角色 (唯讀) -->
        <div class="mb-4">
          <label for="role" class="form-label">Role</label>
          <input
            id="role"
            :value="formatRole(formData.role)"
            type="text"
            class="form-control"
            disabled
            readonly
          />
          <small class="text-muted d-block mt-2">
            <i class="bi bi-info-circle me-1"></i>Role is managed by administrators
          </small>
        </div>

        <!-- 簽名 (非Admin強制設定) -->
        <div v-if="requiresSignature" class="mb-4">
          <label class="form-label">
            Digital Signature <span class="text-danger">*</span>
          </label>

          <!-- 已有簽名 - 顯示預覽 -->
          <div v-if="formData.signature && !showSignatureBoard" class="mb-3">
            <div class="p-3 border rounded bg-light d-flex align-items-center justify-content-center" 
                 style="min-height: 100px; max-width: 300px;">
              <img :src="formData.signature" :alt="formData.name + ' signature'" style="max-width: 100%; max-height: 100px;" />
            </div>
            <div class="mt-2 d-flex gap-2">
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="editSignature"
              >
                <i class="bi bi-pencil me-1"></i>Edit Signature
              </button>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                @click="removeSignature"
              >
                <i class="bi bi-trash me-1"></i>Remove
              </button>
            </div>
          </div>

          <!-- 簽名板 (編輯或新增) -->
          <div v-if="!formData.signature || showSignatureBoard" class="mb-3">
            <SignatureBoard
              :existing-signature="formData.signature"
              @signature-confirmed="handleSignatureConfirmed"
              @cancelled="handleSignatureCancelled"
            />
          </div>

          <!-- 錯誤提示 -->
          <div v-if="errors.signature" class="invalid-feedback d-block mt-2">
            <i class="bi bi-exclamation-circle me-1"></i>{{ errors.signature }}
          </div>
        </div>
        <div v-else class="mb-4">
          <label class="form-label">Digital Signature</label>
          <div class="alert alert-info mb-0">
            <i class="bi bi-info-circle me-2"></i>Admins do not need a stored digital signature. PDF downloads will use Programme Director records.
          </div>
        </div>

        <!-- 表單按鈕 -->
        <div class="d-flex gap-2 mt-5 pt-3 border-top">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting || !hasChanges || hasErrors"
          >
            <span v-if="!isSubmitting">
              <i class="bi bi-check-circle me-1"></i>Save Changes
            </span>
            <span v-else>
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </span>
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="handleReset"
            :disabled="isSubmitting"
          >
            <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- 確認對話框 -->
  <div v-if="showConfirmDialog" class="modal d-block" style="background-color: rgba(0, 0, 0, 0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content glass-card border-0">
        <div class="modal-header border-0 bg-transparent">
          <h5 class="modal-title">
            <i class="bi bi-question-circle text-warning me-2"></i>Confirm Changes
          </h5>
          <button type="button" class="btn-close" @click="showConfirmDialog = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-3">Please review the changes you are about to make:</p>
          
          <div class="bg-light p-3 rounded mb-3">
            <div v-if="getChanges().displayName" class="mb-2">
              <strong>Display Name:</strong>
              <div class="text-muted text-small">
                <span class="text-danger">{{ originalData.name }}</span> → 
                <span class="text-success">{{ formData.name }}</span>
              </div>
            </div>

            <div v-if="getChanges().email" class="mb-2">
              <strong>Email:</strong>
              <div class="text-muted text-small">
                <span class="text-danger">{{ originalData.email }}</span> → 
                <span class="text-success">{{ formData.email }}</span>
              </div>
            </div>

            <div v-if="getChanges().signature" class="mb-2">
              <strong>Signature:</strong>
              <div class="text-success text-muted text-small">
                <i class="bi bi-check-circle me-1"></i>
                {{ formData.signature ? 'Updated' : 'Removed' }}
              </div>
            </div>
          </div>

          <p class="text-muted small mb-0">
            <i class="bi bi-info-circle me-1"></i>Click <strong>Confirm</strong> to save these changes permanently.
          </p>
        </div>
        <div class="modal-footer border-0 bg-transparent">
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="showConfirmDialog = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="confirmAndSave"
            :disabled="isSubmitting"
          >
            <span v-if="!isSubmitting">
              <i class="bi bi-check-circle me-1"></i>Confirm & Save
            </span>
            <span v-else>
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import SignatureBoard from '@/components/SignatureBoard.vue'

const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['profile-updated', 'profile-error', 'edit-cancelled'])

const auth = useAuthStore()

// 表單數據
const formData = ref({
  name: props.user?.name || '',
  email: props.user?.email || '',
  role: props.user?.role || '',
  signature: props.user?.signature || null
})

// 原始數據（用於重置）
const originalData = ref({
  name: props.user?.name || '',
  email: props.user?.email || '',
  role: props.user?.role || '',
  signature: props.user?.signature || null
})

// 狀態
const isSubmitting = ref(false)
const showConfirmDialog = ref(false)
const showSignatureBoard = ref(false)
const errors = ref({})

// 計算屬性
const isAdminUser = computed(() => auth.user?.role === 'admin')
const requiresSignature = computed(() => !isAdminUser.value)

const hasChanges = computed(() => {
  return formData.value.name !== originalData.value.name ||
         formData.value.email !== originalData.value.email ||
         (requiresSignature.value && formData.value.signature !== originalData.value.signature)
})

const hasErrors = computed(() => {
  // Only check for validation errors, not missing signature since signature is handled separately
  return Object.keys(errors.value).some(key => key !== 'signature' && errors.value[key])
})

const stripAdminSignature = () => {
  if (!isAdminUser.value) return
  if (formData.value.signature || originalData.value.signature || auth.user?.signature) {
    formData.value.signature = null
    originalData.value.signature = null
    if (auth.user) {
      auth.user.signature = null
      localStorage.setItem('user', JSON.stringify(auth.user))
    }
  }
}

onMounted(() => {
  stripAdminSignature()
})

watch(isAdminUser, () => {
  stripAdminSignature()
})

// 監聽props變化
watch(() => props.user, (newUser) => {
  if (newUser) {
    formData.value = {
      name: newUser.name || '',
      email: newUser.email || '',
      role: newUser.role || '',
      signature: newUser.signature || null
    }
    originalData.value = {
      name: newUser.name || '',
      email: newUser.email || '',
      role: newUser.role || '',
      signature: newUser.signature || null
    }
    stripAdminSignature()
  }
}, { deep: true })

// 方法
const validateField = (field) => {
  errors.value = {}
  
  if (field === 'name') {
    if (!formData.value.name.trim()) {
      errors.value.name = 'Display name is required'
    } else if (formData.value.name.trim().length < 2) {
      errors.value.name = 'Display name must be at least 2 characters'
    } else if (formData.value.name.trim().length > 50) {
      errors.value.name = 'Display name must not exceed 50 characters'
    }
  }
  
  if (field === 'email') {
    if (!formData.value.email.trim()) {
      errors.value.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
      errors.value.email = 'Please enter a valid email address'
    }
  }
}

const formatRole = (role) => {
  if (!role) return 'User'
  return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const getChanges = () => {
  return {
    displayName: formData.value.name !== originalData.value.name,
    email: formData.value.email !== originalData.value.email,
    signature: requiresSignature.value && formData.value.signature !== originalData.value.signature
  }
}

const editSignature = () => {
  showSignatureBoard.value = true
}

const handleSignatureConfirmed = (signatureData) => {
  formData.value.signature = signatureData
  showSignatureBoard.value = false
  errors.value.signature = null
}

const handleSignatureCancelled = () => {
  showSignatureBoard.value = false
}

const removeSignature = () => {
  if (confirm('Are you sure you want to remove your signature?')) {
    formData.value.signature = null
  }
}

const handleSave = () => {
  validateField('name')
  validateField('email')
  
  if (requiresSignature.value && !formData.value.signature) {
    errors.value.signature = 'Signature is required'
    return
  } else if (requiresSignature.value) {
    delete errors.value.signature // Clear signature error if signature exists
  } else {
    delete errors.value.signature
  }
  
  if (Object.keys(errors.value).length === 0) {
    showConfirmDialog.value = true
  }
}

const confirmAndSave = async () => {
  isSubmitting.value = true
  
  try {
    const signatureValue = requiresSignature.value ? formData.value.signature : null

    auth.user.name = formData.value.name
    auth.user.email = formData.value.email
    auth.user.signature = signatureValue
    
    // 保存到localStorage
    localStorage.setItem('user', JSON.stringify(auth.user))

    // 嘗試保存簽名到後端
    if (requiresSignature.value && formData.value.signature && !originalData.value.signature) {
      try {
        await auth.saveSignature(formData.value.signature)
      } catch {
        // saved locally; backend sync failed silently
      }
    }

    // 更新原始數據
    originalData.value = {
      ...formData.value,
      signature: requiresSignature.value ? formData.value.signature : null
    }

    showConfirmDialog.value = false
    emit('profile-updated')

    // 清除錯誤
    errors.value = {}

  } catch (error) {
    emit('profile-error', error.message || 'Failed to save profile')
  } finally {
    isSubmitting.value = false
  }
}

const handleReset = () => {
  if (hasChanges.value && !confirm('Are you sure you want to discard your changes?')) {
    return
  }

  formData.value = {
    ...originalData.value
  }
  errors.value = {}
  showConfirmDialog.value = false
  showSignatureBoard.value = false
}
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-input {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: inherit;
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(0, 0, 0, 0.2);
  color: inherit;
}

.upload-area {
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  background-color: rgba(0, 123, 255, 0.05);
  border-color: #0d6efd;
}

.upload-area.border-primary {
  background-color: rgba(0, 123, 255, 0.1);
}

.modal.d-block {
  display: block !important;
}

:deep(.dark-mode) .glass-card {
  background: rgba(30, 50, 80, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
}

:deep(.dark-mode) .glass-input {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}
</style>
