<<<<<<< HEAD
<script setup>
import TheWelcome from '../components/TheWelcome.vue'
</script>

<template>
  <main>
    <TheWelcome />
  </main>
</template>
=======
<template>
  <div class="home-view">
    <div class="container py-4">
      <!-- Header -->
      <div class="text-center mb-5">
        <h1 class="display-4 mb-3">Grade Amendment System</h1>
        <p class="lead text-muted">成績修改系統工作流程管理</p>
      </div>

      <!-- Statistics Cards -->
      <div class="row g-4 mb-5">
        <div class="col-md-3">
          <div class="stat-card card text-center">
            <div class="card-body">
              <div class="stat-icon bg-primary">
                <i class="bi bi-file-earmark-text"></i>
              </div>
              <h3 class="stat-number">{{ amendmentStore.amendmentCount }}</h3>
              <p class="stat-label">總修改記錄</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stat-card card text-center">
            <div class="card-body">
              <div class="stat-icon bg-warning">
                <i class="bi bi-clock-history"></i>
              </div>
              <h3 class="stat-number">{{ workflowStats.pending }}</h3>
              <p class="stat-label">待處理</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stat-card card text-center">
            <div class="card-body">
              <div class="stat-icon bg-info">
                <i class="bi bi-person-check"></i>
              </div>
              <h3 class="stat-number">{{ workflowStats.directorReview }}</h3>
              <p class="stat-label">主任審核中</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="stat-card card text-center">
            <div class="card-body">
              <div class="stat-icon bg-success">
                <i class="bi bi-check-circle"></i>
              </div>
              <h3 class="stat-number">{{ workflowStats.completed }}</h3>
              <p class="stat-label">已完成</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Workflow Process -->
      <div class="card workflow-card mb-5">
        <div class="card-header bg-white">
          <h4 class="mb-0">
            <i class="bi bi-diagram-3 me-2"></i>
            成績修改工作流程
          </h4>
        </div>
        <div class="card-body">
          <WorkflowStepper />
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card mb-5">
        <div class="card-header bg-white">
          <h4 class="mb-0">
            <i class="bi bi-lightning-charge me-2"></i>
            快速操作
          </h4>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <router-link to="/amendments" class="action-card card text-decoration-none h-100">
                <div class="card-body text-center">
                  <div class="action-icon bg-primary bg-opacity-10 text-primary mb-3">
                    <i class="bi bi-plus-circle fs-1"></i>
                  </div>
                  <h5 class="card-title">新增修改記錄</h5>
                  <p class="card-text text-muted">使用表單添加單條記錄</p>
                </div>
              </router-link>
            </div>
            
            <div class="col-md-4">
              <div class="action-card card h-100" @click="handleDownloadTemplate" style="cursor: pointer;">
                <div class="card-body text-center">
                  <div class="action-icon bg-success bg-opacity-10 text-success mb-3">
                    <i class="bi bi-download fs-1"></i>
                  </div>
                  <h5 class="card-title">下載 Excel 模板</h5>
                  <p class="card-text text-muted">批量導入前先下載模板</p>
                </div>
              </div>
            </div>
            
            <div class="col-md-4">
              <router-link to="/amendments" class="action-card card text-decoration-none h-100">
                <div class="card-body text-center">
                  <div class="action-icon bg-info bg-opacity-10 text-info mb-3">
                    <i class="bi bi-table fs-1"></i>
                  </div>
                  <h5 class="card-title">查看所有記錄</h5>
                  <p class="card-text text-muted">管理和編輯現有記錄</p>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="card-header bg-white">
          <h4 class="mb-0">
            <i class="bi bi-activity me-2"></i>
            最近活動
          </h4>
        </div>
        <div class="card-body">
          <div v-if="recentAmendments.length === 0" class="text-center text-muted py-4">
            <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
            <p>暫無最近活動</p>
          </div>
          <div v-else class="list-group list-group-flush">
            <div 
              v-for="amendment in recentAmendments" 
              :key="amendment.id"
              class="list-group-item list-group-item-action"
            >
              <div class="d-flex w-100 justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">{{ amendment.studentName }} ({{ amendment.studentId }})</h6>
                  <p class="mb-1 text-muted small">
                    {{ amendment.courseCode }} - {{ amendment.courseName }}
                  </p>
                  <small class="text-muted">
                    {{ amendment.originalGrade }} → {{ amendment.amendedGrade }}
                  </small>
                </div>
                <span 
                  class="badge" 
                  :class="getWorkflowStatusClass(amendment.workflowStatus || 'draft')"
                >
                  {{ getWorkflowStatusText(amendment.workflowStatus || 'draft') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAmendmentStore } from '@/stores/amendmentStore'
import WorkflowStepper from '@/components/WorkflowStepper.vue'

const amendmentStore = useAmendmentStore()

// 計算工作流程統計
const workflowStats = computed(() => {
  const stats = {
    pending: 0,
    directorReview: 0,
    completed: 0
  }
  
  amendmentStore.amendments.forEach(amendment => {
    const status = amendment.workflowStatus || 'draft'
    if (status === 'draft' || status === 'submitted') {
      stats.pending++
    } else if (status === 'director_review') {
      stats.directorReview++
    } else if (status === 'completed') {
      stats.completed++
    }
  })
  
  return stats
})

// 最近的 5 條記錄
const recentAmendments = computed(() => {
  return [...amendmentStore.amendments]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5)
})

// 工作流程狀態類別
const getWorkflowStatusClass = (status) => {
  const classes = {
    draft: 'bg-secondary',
    submitted: 'bg-warning text-dark',
    validated: 'bg-info',
    director_review: 'bg-primary',
    admin_confirmed: 'bg-success',
    completed: 'bg-success'
  }
  return classes[status] || 'bg-secondary'
}

// 工作流程狀態文字
const getWorkflowStatusText = (status) => {
  const texts = {
    draft: '草稿',
    submitted: '已提交',
    validated: '已驗證',
    director_review: '主任審核中',
    admin_confirmed: '管理員確認',
    completed: '已完成'
  }
  return texts[status] || '未知'
}

// 下載模板
const handleDownloadTemplate = async () => {
  try {
    await amendmentStore.downloadTemplate()
  } catch (error) {
    console.error('Failed to download template:', error)
  }
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.display-4 {
  font-weight: 700;
  color: #2c3e50;
}

.lead {
  font-size: 1.1rem;
}

/* Statistics Cards */
.stat-card {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  font-size: 1.5rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.stat-label {
  color: #6c757d;
  margin-bottom: 0;
  font-size: 0.9rem;
}

/* Workflow Card */
.workflow-card {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Action Cards */
.action-card {
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border-color: #4472C4;
}

.action-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* Recent Activity */
.list-group-item {
  border-left: none;
  border-right: none;
  transition: background-color 0.2s ease;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

/* Responsive */
@media (max-width: 768px) {
  .display-4 {
    font-size: 2rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .action-icon {
    width: 60px;
    height: 60px;
  }
}

/* Bootstrap Icons CDN (如果還沒引入) */
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
</style>
>>>>>>> 790780857e7104a65d2fff80315a2a9ab205cfed
