<template>
  <main class="container my-5">
    <!-- 簽名未設定的警告 -->
    <div v-if="requiresSignature && !auth.user?.signature" class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      <strong>Signature Setup Required!</strong> 
      You must set up your digital signature before you can use all features. Please complete the signature setup below.
      <button type="button" class="btn-close" @click="dismissSignatureWarning"></button>
    </div>

    <!-- 麵包屑 -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/">Home</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">Profile</li>
      </ol>
    </nav>

    <!-- 頁標題 + Edit 按鈕 -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h1 class="display-6 mb-2">User Profile</h1>
        <p class="text-muted">{{ isEditMode ? 'Edit your account information' : 'View your account information' }}</p>
      </div>
      <button
        v-if="!isEditMode"
        class="btn btn-primary"
        @click="enterEditMode"
      >
        <i class="bi bi-pencil-square me-2"></i>Edit Profile
      </button>
      <button
        v-else
        class="btn btn-outline-secondary"
        @click="exitEditMode"
      >
        <i class="bi bi-x-circle me-2"></i>Cancel
      </button>
    </div>

    <!-- ======== 只讀視圖 ======== -->
    <div v-if="!isEditMode">
      <!-- 用戶資料卡片 -->
      <div class="row">
        <!-- 主要卡片 -->
        <div class="col-lg-8 mb-4">
          <div class="card glass-card border-0 shadow-sm">
            <div class="card-body p-4">
              <!-- 用戶頭像 -->
              <div class="d-flex align-items-start gap-4 mb-4">
                <div class="avatar-placeholder rounded-circle bg-gradient d-flex align-items-center justify-content-center flex-shrink-0"
                     style="width: 100px; height: 100px;">
                  <i class="bi bi-person text-white" style="font-size: 2.5rem;"></i>
                </div>
                <div class="flex-grow-1">
                  <h3 class="mb-1">{{ auth.user?.name }}</h3>
                  <p class="text-muted mb-3">
                    <i class="bi bi-envelope me-2"></i>{{ auth.user?.email }}
                  </p>
                  <div>
                    <span class="badge" :class="getRoleBadgeClass(auth.user?.role)">
                      {{ formatRole(auth.user?.role) }}
                    </span>
                  </div>
                </div>
              </div>

              <hr class="my-4" />

              <!-- 詳細信息 -->
              <div class="row g-4">
                <!-- 顯示名稱 -->
                <div class="col-md-6">
                  <div class="info-group">
                    <label class="info-label">Display Name</label>
                    <p class="info-value">{{ auth.user?.name }}</p>
                  </div>
                </div>

                <!-- 郵件 -->
                <div class="col-md-6">
                  <div class="info-group">
                    <label class="info-label">Email Address</label>
                    <p class="info-value">{{ auth.user?.email }}</p>
                  </div>
                </div>

                <!-- 角色 -->
                <div class="col-md-6">
                  <div class="info-group">
                    <label class="info-label">Role</label>
                    <p class="info-value text-capitalize">{{ formatRole(auth.user?.role) }}</p>
                  </div>
                </div>

                <!-- 簽名狀態 -->
                <div class="col-md-6">
                  <div class="info-group">
                    <label class="info-label">Signature</label>
                    <template v-if="requiresSignature">
                      <p v-if="auth.user?.signature" class="info-value text-success">
                        <i class="bi bi-check-circle me-1"></i>Set
                      </p>
                      <p v-else class="info-value text-warning">
                        <i class="bi bi-exclamation-circle me-1"></i>Not Set
                      </p>
                    </template>
                    <p v-else class="info-value text-muted">
                      <i class="bi bi-info-circle me-1"></i>Not required for admins
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 簽名預覽卡片 -->
        <div class="col-lg-4">
          <div class="card glass-card border-0 shadow-sm">
            <div class="card-body text-center py-4">
              <h6 class="card-title mb-3">
                <i class="bi bi-pen me-2"></i>Digital Signature
              </h6>

              <!-- 簽名預覽 -->
              <div v-if="auth.user?.signature && requiresSignature" class="mb-3">
                <div class="p-3 border rounded bg-light d-flex align-items-center justify-content-center" 
                     style="min-height: 120px;">
                  <img :src="auth.user.signature" :alt="auth.user.name + ' signature'" 
                       style="max-width: 100%; max-height: 120px;" />
                </div>
              </div>
              <div v-else class="p-3 mb-3 border rounded-2 bg-light d-flex align-items-center justify-content-center" 
                   style="min-height: 120px;">
                <div class="text-center">
                  <i class="bi" :class="requiresSignature ? 'bi-exclamation-lg text-warning' : 'bi-info-circle text-primary'" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;"></i>
                  <small class="text-muted">{{ requiresSignature ? 'No signature set' : 'Admins do not need digital signatures' }}</small>
                </div>
              </div>

              <!-- 簽名狀態標籤 -->
              <p class="small mb-0">
                <span v-if="requiresSignature && auth.user?.signature" class="badge bg-success">
                  <i class="bi bi-check-circle me-1"></i>Signature Active
                </span>
                <span v-else-if="requiresSignature" class="badge bg-warning">
                  <i class="bi bi-exclamation-circle me-1"></i>Setup Required
                </span>
                <span v-else class="badge bg-info text-dark">
                  <i class="bi bi-info-circle me-1"></i>Not Required
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======== 編輯視圖 ======== -->
    <div v-else>
      <div class="row">
        <div class="col-lg-8">
          <ProfileForm 
            :user="auth.user"
            @profile-updated="handleProfileUpdated"
            @edit-cancelled="exitEditMode"
          />
        </div>
      </div>
    </div>

    <!-- 成功通知 -->
    <div v-if="showSuccessAlert" class="alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3" role="alert" style="z-index: 1050;">
      <i class="bi bi-check-circle me-2"></i>
      <strong>Success!</strong> Your profile has been updated.
      <button type="button" class="btn-close" @click="showSuccessAlert = false"></button>
    </div>

    <!-- 錯誤通知 -->
    <div v-if="showErrorAlert" class="alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3" role="alert" style="z-index: 1050;">
      <i class="bi bi-exclamation-circle me-2"></i>
      <strong>Error!</strong> {{ errorMessage }}
      <button type="button" class="btn-close" @click="showErrorAlert = false"></button>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import ProfileForm from '@/components/ProfileForm.vue'

const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.role === 'admin')
const requiresSignature = computed(() => !isAdmin.value)

// 狀態
const isEditMode = ref(false)
const showSuccessAlert = ref(false)
const showErrorAlert = ref(false)
const errorMessage = ref('')

// 方法
const getRoleBadgeClass = (role) => {
  const classes = {
    'admin': 'bg-danger',
    'programme_director': 'bg-primary',
    'user': 'bg-info'
  }
  return classes[role?.toLowerCase()] || 'bg-secondary'
}

const formatRole = (role) => {
  if (!role) return 'User'
  return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const enterEditMode = () => {
  isEditMode.value = true
}

const exitEditMode = () => {
  isEditMode.value = false
}

const handleProfileUpdated = () => {
  showSuccessAlert.value = true
  isEditMode.value = false
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 3000)
}

const handleProfileError = (message) => {
  errorMessage.value = message
  showErrorAlert.value = true
  setTimeout(() => {
    showErrorAlert.value = false
  }, 4000)
}

const dismissSignatureWarning = () => {
  // 用戶可以先關閉警告，但路由守衛仍會強制導向profile
}
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.avatar-placeholder {
  background: linear-gradient(135deg, #0c8eeb 0%, #36a9fa 100%);
}

.info-group {
  padding-bottom: 1rem;
}

.info-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
  color: inherit;
  margin: 0;
}

:deep(.dark-mode) .glass-card {
  background: rgba(30, 50, 80, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
}

:deep(.dark-mode) .info-label {
  color: #adb5bd;
}
</style>
