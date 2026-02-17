import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import amendmentService from '@/services/amendmentService'

export const useAmendmentStore = defineStore('amendment', () => {
  // State
  const amendments = ref([])
  const loading = ref(false)
  const error = ref(null)
  const message = ref(null)
  const nextId = ref(1)
  const currentUser = ref({ role: 'Teacher', name: 'John Doe' }) // 模擬當前用戶

  // Workflow status: draft -> submitted -> validated -> director_review -> admin_confirmed -> completed
  const workflowStatuses = [
    { id: 'draft', label: '草稿', color: 'secondary' },
    { id: 'submitted', label: '已提交', color: 'warning' },
    { id: 'validated', label: '已驗證', color: 'info' },
    { id: 'director_review', label: '主任審核中', color: 'primary' },
    { id: 'admin_confirmed', label: '管理員確認', color: 'success' },
    { id: 'completed', label: '已完成', color: 'success' }
  ]

  // Getters
  const amendmentCount = computed(() => amendments.value.length)
  
  const pendingAmendments = computed(() => 
    amendments.value.filter(a => a.status === 'Pending')
  )
  
  const approvedAmendments = computed(() => 
    amendments.value.filter(a => a.status === 'Approved')
  )
  
  const rejectedAmendments = computed(() => 
    amendments.value.filter(a => a.status === 'Rejected')
  )

  // Workflow status filters
  const draftAmendments = computed(() =>
    amendments.value.filter(a => a.workflowStatus === 'draft')
  )

  const submittedAmendments = computed(() =>
    amendments.value.filter(a => a.workflowStatus === 'submitted')
  )

  const directorReviewAmendments = computed(() =>
    amendments.value.filter(a => a.workflowStatus === 'director_review')
  )

  const completedAmendments = computed(() =>
    amendments.value.filter(a => a.workflowStatus === 'completed')
  )

  // Actions
  const setMessage = (msg) => {
    message.value = msg
    setTimeout(() => {
      message.value = null
    }, 5000)
  }

  const setError = (err) => {
    error.value = err
    setTimeout(() => {
      error.value = null
    }, 5000)
  }

  const addAmendment = async (amendment) => {
    loading.value = true
    error.value = null
    let newAmendment = null
    try {
      // Add to local state
      newAmendment = {
        id: nextId.value++,
        ...amendment,
        status: amendment.status || 'Pending',
        workflowStatus: 'draft', // 初始工作流狀態
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.value.name,
        history: [
          {
            status: 'draft',
            timestamp: new Date().toISOString(),
            user: currentUser.value.name,
            role: currentUser.value.role,
            action: '創建記錄'
          }
        ]
      }
      amendments.value.push(newAmendment)
      
      // Send to backend
      await amendmentService.addAmendment(amendment)
      setMessage('Amendment added successfully')
      return newAmendment
    } catch (err) {
      setError('Failed to add amendment: ' + err.message)
      // Remove from local state if API call failed
      if (newAmendment) {
        amendments.value = amendments.value.filter(a => a.id !== newAmendment.id)
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAmendment = async (id, updatedData) => {
    loading.value = true
    error.value = null
    try {
      const index = amendments.value.findIndex(a => a.id === id)
      if (index !== -1) {
        const oldData = { ...amendments.value[index] }
        // Update local state
        amendments.value[index] = { ...amendments.value[index], ...updatedData }
        
        try {
          // Send to backend
          await amendmentService.updateAmendment(id, updatedData)
          setMessage('Amendment updated successfully')
        } catch (err) {
          // Revert on error
          amendments.value[index] = oldData
          throw err
        }
      } else {
        throw new Error('Amendment not found')
      }
    } catch (err) {
      setError('Failed to update amendment: ' + err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAmendment = async (id) => {
    loading.value = true
    error.value = null
    try {
      const index = amendments.value.findIndex(a => a.id === id)
      if (index !== -1) {
        const oldAmendment = amendments.value[index]
        // Remove from local state
        amendments.value.splice(index, 1)
        
        try {
          // Send to backend
          await amendmentService.deleteAmendment(id)
          setMessage('Amendment deleted successfully')
        } catch (err) {
          // Restore on error
          amendments.value.splice(index, 0, oldAmendment)
          throw err
        }
      } else {
        throw new Error('Amendment not found')
      }
    } catch (err) {
      setError('Failed to delete amendment: ' + err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAllAmendments = async () => {
    loading.value = true
    error.value = null
    try {
      const oldAmendments = [...amendments.value]
      // Clear local state
      amendments.value = []
      nextId.value = 1
      
      try {
        // Send to backend
        await amendmentService.deleteAllAmendments()
        setMessage('All amendments deleted successfully')
      } catch (err) {
        // Restore on error
        amendments.value = oldAmendments
        throw err
      }
    } catch (err) {
      setError('Failed to delete all amendments: ' + err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  const importFromExcel = async (file) => {
    loading.value = true
    error.value = null
    try {
      await amendmentService.importExcel(file)
      // Note: In a real app, you'd fetch the updated amendments list
      // For now, we'll need to manually parse or reload
      setMessage('Excel file imported successfully')
    } catch (err) {
      setError('Failed to import Excel file: ' + err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportToExcel = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await amendmentService.exportExcel()
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'grade_amendments.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      setMessage('Excel file exported successfully')
    } catch (err) {
      setError('Failed to export Excel file: ' + err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  const downloadTemplate = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await amendmentService.downloadTemplate()
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'grade_amendment_template.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      setMessage('Template downloaded successfully')
    } catch (err) {
      setError('Failed to download template: ' + err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Workflow actions
  const updateWorkflowStatus = (id, newStatus, comment = '') => {
    const amendment = amendments.value.find(a => a.id === id)
    if (amendment) {
      amendment.workflowStatus = newStatus
      amendment.updatedAt = new Date().toISOString()
      
      // Add to history
      if (!amendment.history) {
        amendment.history = []
      }
      amendment.history.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        user: currentUser.value.name,
        role: currentUser.value.role,
        action: getStatusActionText(newStatus),
        comment: comment
      })
      
      setMessage(`狀態已更新為: ${getWorkflowStatusLabel(newStatus)}`)
    }
  }

  const submitForReview = (id) => {
    updateWorkflowStatus(id, 'submitted', '提交審核')
  }

  const validateAmendment = (id, isValid) => {
    if (isValid) {
      updateWorkflowStatus(id, 'validated', '驗證通過')
    } else {
      updateWorkflowStatus(id, 'draft', '驗證失敗，退回修改')
    }
  }

  const directorApprove = (id, comment = '') => {
    updateWorkflowStatus(id, 'director_review', comment || '課程主任已審核')
  }

  const adminConfirm = (id, comment = '') => {
    updateWorkflowStatus(id, 'admin_confirmed', comment || '管理員已確認')
  }

  const completeAmendment = (id) => {
    updateWorkflowStatus(id, 'completed', '流程完成')
  }

  const getWorkflowStatusLabel = (status) => {
    const found = workflowStatuses.find(s => s.id === status)
    return found ? found.label : status
  }

  const getStatusActionText = (status) => {
    const actions = {
      draft: '創建草稿',
      submitted: '提交審核',
      validated: '驗證通過',
      director_review: '主任審核',
      admin_confirmed: '管理員確認',
      completed: '完成流程'
    }
    return actions[status] || '更新狀態'
  }

  // Change user role (for testing)
  const setUserRole = (role, name) => {
    currentUser.value = { role, name }
  }

  return {
    // State
    amendments,
    loading,
    error,
    message,
    currentUser,
    workflowStatuses,
    // Getters
    amendmentCount,
    pendingAmendments,
    approvedAmendments,
    rejectedAmendments,
    draftAmendments,
    submittedAmendments,
    directorReviewAmendments,
    completedAmendments,
    // Actions
    addAmendment,
    updateAmendment,
    deleteAmendment,
    deleteAllAmendments,
    importFromExcel,
    exportToExcel,
    downloadTemplate,
    // Workflow actions
    updateWorkflowStatus,
    submitForReview,
    validateAmendment,
    directorApprove,
    adminConfirm,
    completeAmendment,
    getWorkflowStatusLabel,
    setUserRole
  }
})
