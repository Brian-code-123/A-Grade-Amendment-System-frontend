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
    try {
      // Add to local state
      const newAmendment = {
        id: nextId.value++,
        ...amendment,
        status: amendment.status || 'Pending'
      }
      amendments.value.push(newAmendment)
      
      // Send to backend
      await amendmentService.addAmendment(amendment)
      setMessage('Amendment added successfully')
      return newAmendment
    } catch (err) {
      setError('Failed to add amendment: ' + err.message)
      // Remove from local state if API call failed
      amendments.value = amendments.value.filter(a => a.id !== newAmendment.id)
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

  return {
    // State
    amendments,
    loading,
    error,
    message,
    // Getters
    amendmentCount,
    pendingAmendments,
    approvedAmendments,
    rejectedAmendments,
    // Actions
    addAmendment,
    updateAmendment,
    deleteAmendment,
    deleteAllAmendments,
    importFromExcel,
    exportToExcel,
    downloadTemplate
  }
})
