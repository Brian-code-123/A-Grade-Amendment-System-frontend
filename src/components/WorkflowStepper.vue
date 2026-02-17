<template>
  <div class="workflow-stepper">
    <div class="stepper-container">
      <div 
        v-for="(step, index) in steps" 
        :key="step.id"
        class="step-item"
        :class="{ 'active': index === currentStep }"
      >
        <div class="step-circle" :class="getStepClass(index)">
          <i v-if="index < currentStep" class="bi bi-check-lg"></i>
          <i v-else :class="step.icon"></i>
        </div>
        
        <div class="step-content">
          <h6 class="step-title">{{ step.title }}</h6>
          <p class="step-description">{{ step.description }}</p>
          
          <!-- 角色標籤 -->
          <div v-if="step.role" class="role-badge">
            <span class="badge" :class="getRoleBadgeClass(step.role)">
              <i :class="getRoleIcon(step.role)"></i>
              {{ step.role }}
            </span>
          </div>
        </div>
        
        <!-- 連接線 -->
        <div v-if="index < steps.length - 1" class="step-connector" :class="{ 'completed': index < currentStep }"></div>
      </div>
    </div>

    <!-- 工作流程詳細說明 -->
    <div class="workflow-details mt-4">
      <div class="accordion" id="workflowAccordion">
        <div v-for="(step, index) in steps" :key="'detail-' + step.id" class="accordion-item">
          <h2 class="accordion-header">
            <button 
              class="accordion-button" 
              :class="{ 'collapsed': index !== 0 }"
              type="button" 
              data-bs-toggle="collapse" 
              :data-bs-target="'#collapse' + index"
              :aria-expanded="index === 0"
            >
              <span class="me-2">{{ index + 1 }}.</span>
              {{ step.title }}
            </button>
          </h2>
          <div 
            :id="'collapse' + index" 
            class="accordion-collapse collapse" 
            :class="{ 'show': index === 0 }"
            data-bs-parent="#workflowAccordion"
          >
            <div class="accordion-body">
              <h6 class="text-primary mb-3">
                <i :class="step.icon"></i>
                {{ step.description }}
              </h6>
              
              <div class="row">
                <div class="col-md-6">
                  <h6 class="text-muted mb-2">操作說明：</h6>
                  <ul class="list-unstyled">
                    <li v-for="(action, idx) in step.actions" :key="idx" class="mb-2">
                      <i class="bi bi-arrow-right-circle text-success me-2"></i>
                      {{ action }}
                    </li>
                  </ul>
                </div>
                
                <div class="col-md-6">
                  <h6 class="text-muted mb-2">驗證要求：</h6>
                  <ul class="list-unstyled">
                    <li v-for="(validation, idx) in step.validations" :key="idx" class="mb-2">
                      <i class="bi bi-shield-check text-info me-2"></i>
                      {{ validation }}
                    </li>
                  </ul>
                </div>
              </div>
              
              <div v-if="step.tips" class="alert alert-light mt-3">
                <i class="bi bi-lightbulb text-warning me-2"></i>
                <strong>提示：</strong> {{ step.tips }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentStep = ref(0)

const steps = [
  {
    id: 1,
    title: '收到改分通知',
    description: '教師收到需要修改成績的通知',
    icon: 'bi bi-bell',
    role: 'Teacher',
    actions: [
      '查收郵件或系統通知',
      '確認需要修改的學生成績',
      '準備相關證明文件'
    ],
    validations: [
      '確認學生信息正確',
      '確認修改原因合理',
      '準備支持文件'
    ],
    tips: '及時處理通知，避免錯過截止日期'
  },
  {
    id: 2,
    title: 'Excel 模板或表單填寫',
    description: '選擇使用 Excel 批量導入或使用網頁表單',
    icon: 'bi bi-file-earmark-excel',
    role: 'Teacher',
    actions: [
      '下載 Excel 模板或使用網頁表單',
      '填寫學生 ID、姓名、課程代碼等信息',
      '填寫原始成績和修改後成績',
      '詳細說明修改原因'
    ],
    validations: [
      '所有必填字段已填寫',
      '成績格式正確（A-F 或數字）',
      '學生 ID 格式正確',
      '修改原因清晰具體'
    ],
    tips: '批量修改建議使用 Excel 模板，單條記錄可直接使用網頁表單'
  },
  {
    id: 3,
    title: 'Excel 上傳與數據驗證',
    description: '上傳 Excel 文件，系統逐行驗證數據',
    icon: 'bi bi-cloud-upload',
    role: 'System',
    actions: [
      '選擇已填寫的 Excel 文件',
      '點擊上傳按鈕',
      '等待系統驗證',
      '查看驗證結果'
    ],
    validations: [
      '文件格式為 .xlsx 或 .xls',
      '文件大小不超過 5MB',
      '表頭格式符合模板要求',
      '每行數據完整且格式正確',
      '沒有重複的修改記錄'
    ],
    tips: '驗證失敗時，系統會提示具體錯誤位置，修正後重新上傳'
  },
  {
    id: 4,
    title: '格式與內容驗證',
    description: '系統自動驗證所有字段的格式和內容',
    icon: 'bi bi-shield-check',
    role: 'System',
    actions: [
      '驗證學生 ID 格式',
      '驗證課程代碼存在性',
      '驗證成績格式和範圍',
      '檢查修改原因長度',
      '生成驗證報告'
    ],
    validations: [
      '學生 ID 符合學校規範',
      '課程代碼在系統中存在',
      '成績在允許範圍內',
      '修改原因至少 10 個字符',
      '無邏輯錯誤'
    ],
    tips: '系統會自動標記可疑記錄，需要人工複核'
  },
  {
    id: 5,
    title: 'Programme Director 提交',
    description: '課程主任審核並提交所有修改記錄',
    icon: 'bi bi-person-check',
    role: 'Programme Director',
    actions: [
      '登錄系統查看待審核記錄',
      '逐條審核修改記錄',
      '檢查修改原因的合理性',
      '批量提交或逐條提交',
      '添加審核意見'
    ],
    validations: [
      '所有記錄已審核',
      '修改原因合理',
      '符合學校政策',
      '有必要的證明文件',
      '審核意見完整'
    ],
    tips: '可以批量審核相同類型的修改，提高效率'
  },
  {
    id: 6,
    title: 'Admin 確認和打印',
    description: '管理員最終確認並打印正式文件',
    icon: 'bi bi-printer',
    role: 'Admin',
    actions: [
      '登錄管理員帳戶',
      '查看待確認的記錄',
      '最終審核所有信息',
      '打印正式文件',
      '記錄確認狀態和時間'
    ],
    validations: [
      '課程主任已審核',
      '無格式錯誤',
      '符合學校規範',
      '所有簽名完整',
      '文件打印清晰'
    ],
    tips: '打印後的文件需要存檔備查，建議同時保存電子版'
  },
  {
    id: 7,
    title: '完成',
    description: '成績修改流程完成，系統更新記錄',
    icon: 'bi bi-check-circle',
    role: 'System',
    actions: [
      '更新成績記錄',
      '發送完成通知',
      '歸檔相關文件',
      '生成修改報告',
      '更新學生成績單'
    ],
    validations: [
      '所有步驟已完成',
      '記錄已更新',
      '通知已發送',
      '文件已歸檔',
      '可追溯完整流程'
    ],
    tips: '流程完成後，相關人員會收到郵件通知'
  }
]

const getStepClass = (index) => {
  if (index < currentStep.value) {
    return 'completed'
  } else if (index === currentStep.value) {
    return 'active'
  }
  return ''
}

const getRoleBadgeClass = (role) => {
  const classes = {
    'Teacher': 'bg-primary',
    'Programme Director': 'bg-info',
    'Admin': 'bg-success',
    'System': 'bg-secondary'
  }
  return classes[role] || 'bg-secondary'
}

const getRoleIcon = (role) => {
  const icons = {
    'Teacher': 'bi bi-person',
    'Programme Director': 'bi bi-person-badge',
    'Admin': 'bi bi-shield-lock',
    'System': 'bi bi-gear'
  }
  return icons[role] || 'bi bi-person'
}
</script>

<style scoped>
.workflow-stepper {
  width: 100%;
}

/* Stepper Container */
.stepper-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
}

/* Step Item */
.step-item {
  display: flex;
  align-items: flex-start;
  position: relative;
  padding-left: 80px;
  min-height: 100px;
}

/* Step Circle */
.step-circle {
  position: absolute;
  left: 0;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #e9ecef;
  border: 3px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #6c757d;
  transition: all 0.3s ease;
  z-index: 2;
}

.step-circle.active {
  background-color: #4472C4;
  border-color: #4472C4;
  color: white;
  box-shadow: 0 0 0 4px rgba(68, 114, 196, 0.2);
}

.step-circle.completed {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

/* Step Content */
.step-content {
  flex: 1;
  padding: 0.5rem 0;
}

.step-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.step-description {
  color: #6c757d;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.role-badge {
  margin-top: 0.5rem;
}

.role-badge .badge {
  font-size: 0.85rem;
  padding: 0.35rem 0.75rem;
}

/* Step Connector */
.step-connector {
  position: absolute;
  left: 29px;
  top: 60px;
  bottom: -32px;
  width: 3px;
  background-color: #dee2e6;
  z-index: 1;
}

.step-connector.completed {
  background-color: #28a745;
}

/* Accordion Customization */
.accordion-button {
  font-weight: 600;
  background-color: #f8f9fa;
}

.accordion-button:not(.collapsed) {
  background-color: #4472C4;
  color: white;
}

.accordion-button:focus {
  box-shadow: none;
  border-color: rgba(68, 114, 196, 0.5);
}

.accordion-body {
  background-color: #f8f9fa;
}

/* Responsive */
@media (max-width: 768px) {
  .step-item {
    padding-left: 60px;
  }
  
  .step-circle {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  
  .step-connector {
    left: 24px;
  }
  
  .step-title {
    font-size: 1rem;
  }
  
  .step-description {
    font-size: 0.85rem;
  }
}
</style>
