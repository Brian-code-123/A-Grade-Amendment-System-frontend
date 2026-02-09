import apiClient from './api'

export default {
  // Get all amendments (returns HTML, so we need to parse it)
  // For Vue frontend, we'll need the backend to provide JSON API
  // For now, we'll work with the existing endpoints
  
  /**
   * Add a new amendment
   * @param {Object} amendment - Amendment data
   * @returns {Promise}
   */
  async addAmendment(amendment) {
    const formData = new URLSearchParams()
    Object.keys(amendment).forEach(key => {
      formData.append(key, amendment[key])
    })
    
    return apiClient.post('/amendments/add', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },

  /**
   * Import amendments from Excel file
   * @param {File} file - Excel file
   * @returns {Promise}
   */
  async importExcel(file) {
    const formData = new FormData()
    formData.append('excelFile', file)
    
    return apiClient.post('/amendments/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * Export amendments to Excel
   * @returns {Promise}
   */
  async exportExcel() {
    return apiClient.get('/amendments/export', {
      responseType: 'blob'
    })
  },

  /**
   * Download Excel template
   * @returns {Promise}
   */
  async downloadTemplate() {
    return apiClient.get('/amendments/template', {
      responseType: 'blob'
    })
  },

  /**
   * Update an amendment
   * @param {Number} id - Amendment ID
   * @param {Object} amendment - Updated amendment data
   * @returns {Promise}
   */
  async updateAmendment(id, amendment) {
    const formData = new URLSearchParams()
    Object.keys(amendment).forEach(key => {
      formData.append(key, amendment[key])
    })
    
    return apiClient.post(`/amendments/update/${id}`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },

  /**
   * Delete an amendment
   * @param {Number} id - Amendment ID
   * @returns {Promise}
   */
  async deleteAmendment(id) {
    return apiClient.post(`/amendments/delete/${id}`)
  },

  /**
   * Delete all amendments
   * @returns {Promise}
   */
  async deleteAllAmendments() {
    return apiClient.post('/amendments/delete-all')
  },

  /**
   * Get all amendments (workaround for HTML response)
   * Note: This assumes you'll add a JSON API endpoint to the backend
   * For now, we'll manage data on the frontend
   */
  async getAmendments() {
    // This will need a new JSON endpoint on the backend
    // For now, we'll use local state management
    return { data: [] }
  }
}
