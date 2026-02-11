import * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

/**
 * Excel Service for handling Excel operations
 * Provides client-side Excel generation and parsing
 */
export default {
  /**
   * Generate and download Excel template
   * @returns {Promise<void>}
   */
  async generateTemplate() {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Grade Amendments')

    // Define columns
    worksheet.columns = [
      { header: 'Student ID', key: 'studentId', width: 15 },
      { header: 'Student Name', key: 'studentName', width: 20 },
      { header: 'Course Code', key: 'courseCode', width: 15 },
      { header: 'Course Name', key: 'courseName', width: 30 },
      { header: 'Original Grade', key: 'originalGrade', width: 15 },
      { header: 'Amended Grade', key: 'amendedGrade', width: 15 },
      { header: 'Reason', key: 'reason', width: 40 },
      { header: 'Status', key: 'status', width: 15 }
    ]

    // Style the header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0066CC' }
    }
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

    // Add sample data
    worksheet.addRow({
      studentId: '20123456',
      studentName: 'John Doe',
      courseCode: 'COMP3047',
      courseName: 'Mobile Application Development',
      originalGrade: 'B',
      amendedGrade: 'A-',
      reason: 'Grading error corrected',
      status: 'Pending'
    })

    worksheet.addRow({
      studentId: '20123457',
      studentName: 'Jane Smith',
      courseCode: 'COMP3278',
      courseName: 'Database Systems',
      originalGrade: 'C+',
      amendedGrade: 'B',
      reason: 'Missing assignment found',
      status: 'Pending'
    })

    // Add data validation for status column
    for (let i = 2; i <= 100; i++) {
      worksheet.getCell(`H${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['"Pending,Approved,Rejected"']
      }
    }

    // Generate buffer and save
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    saveAs(blob, 'grade_amendment_template.xlsx')
  },

  /**
   * Export amendments to Excel
   * @param {Array} amendments - Array of amendment objects
   * @returns {Promise<void>}
   */
  async exportToExcel(amendments) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Grade Amendments')

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Student ID', key: 'studentId', width: 15 },
      { header: 'Student Name', key: 'studentName', width: 20 },
      { header: 'Course Code', key: 'courseCode', width: 15 },
      { header: 'Course Name', key: 'courseName', width: 30 },
      { header: 'Original Grade', key: 'originalGrade', width: 15 },
      { header: 'Amended Grade', key: 'amendedGrade', width: 15 },
      { header: 'Reason', key: 'reason', width: 40 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Workflow Status', key: 'workflowStatus', width: 20 },
      { header: 'Created By', key: 'createdBy', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 }
    ]

    // Style the header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0066CC' }
    }
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

    // Add data
    amendments.forEach(amendment => {
      worksheet.addRow({
        id: amendment.id,
        studentId: amendment.studentId,
        studentName: amendment.studentName,
        courseCode: amendment.courseCode,
        courseName: amendment.courseName,
        originalGrade: amendment.originalGrade,
        amendedGrade: amendment.amendedGrade,
        reason: amendment.reason,
        status: amendment.status,
        workflowStatus: amendment.workflowStatus || 'draft',
        createdBy: amendment.createdBy || '',
        createdAt: amendment.createdAt ? new Date(amendment.createdAt).toLocaleString() : '',
        updatedAt: amendment.updatedAt ? new Date(amendment.updatedAt).toLocaleString() : ''
      })
    })

    // Auto-fit columns (approximate)
    worksheet.columns.forEach(column => {
      if (column.eachCell) {
        let maxLength = 0
        column.eachCell({ includeEmpty: false }, cell => {
          const columnLength = cell.value ? cell.value.toString().length : 10
          if (columnLength > maxLength) {
            maxLength = columnLength
          }
        })
        column.width = Math.min(maxLength + 2, 50)
      }
    })

    // Add conditional formatting for status column
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const statusCell = row.getCell(9) // Status column
        const status = statusCell.value

        if (status === 'Approved') {
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF90EE90' }
          }
        } else if (status === 'Rejected') {
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF6B6B' }
          }
        } else if (status === 'Pending') {
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFD700' }
          }
        }
      }
    })

    // Generate buffer and save
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const timestamp = new Date().toISOString().split('T')[0]
    saveAs(blob, `grade_amendments_${timestamp}.xlsx`)
  },

  /**
   * Parse Excel file and extract amendment data
   * @param {File} file - Excel file
   * @returns {Promise<Array>} - Array of amendment objects
   */
  async parseExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const buffer = e.target.result
          const workbook = new ExcelJS.Workbook()
          await workbook.xlsx.load(buffer)
          
          const worksheet = workbook.worksheets[0]
          const amendments = []
          const errors = []
          
          // Skip header row
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return // Skip header
            
            try {
              const amendment = {
                studentId: this.getCellValue(row, 1) || this.getCellValue(row, 2), // Try column A or B
                studentName: this.getCellValue(row, 2) || this.getCellValue(row, 3),
                courseCode: this.getCellValue(row, 3) || this.getCellValue(row, 4),
                courseName: this.getCellValue(row, 4) || this.getCellValue(row, 5),
                originalGrade: this.getCellValue(row, 5) || this.getCellValue(row, 6),
                amendedGrade: this.getCellValue(row, 6) || this.getCellValue(row, 7),
                reason: this.getCellValue(row, 7) || this.getCellValue(row, 8),
                status: this.getCellValue(row, 8) || this.getCellValue(row, 9) || 'Pending'
              }
              
              // Validate required fields
              if (!amendment.studentId || !amendment.studentName || !amendment.courseCode) {
                errors.push(`Row ${rowNumber}: Missing required fields (Student ID, Name, or Course Code)`)
                return
              }
              
              amendments.push(amendment)
            } catch (err) {
              errors.push(`Row ${rowNumber}: ${err.message}`)
            }
          })
          
          if (errors.length > 0) {
            console.warn('Excel parsing warnings:', errors)
          }
          
          if (amendments.length === 0) {
            reject(new Error('No valid data found in Excel file. Please check the format.'))
          } else {
            resolve({ amendments, errors })
          }
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error.message}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsArrayBuffer(file)
    })
  },

  /**
   * Get cell value with proper formatting
   * @param {Row} row - Excel row
   * @param {Number} columnIndex - Column index (1-based)
   * @returns {String} - Cell value as string
   */
  getCellValue(row, columnIndex) {
    const cell = row.getCell(columnIndex)
    if (!cell || cell.value === null || cell.value === undefined) {
      return ''
    }
    
    // Handle different cell types
    if (typeof cell.value === 'object' && cell.value.text) {
      return cell.value.text
    }
    
    return String(cell.value).trim()
  },

  /**
   * Validate Excel file before upload
   * @param {File} file - File to validate
   * @returns {Object} - Validation result
   */
  validateFile(file) {
    const errors = []
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (!file) {
      errors.push('No file selected')
      return { valid: false, errors }
    }
    
    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (5MB)`)
    }
    
    // Check file type
    const validExtensions = ['.xlsx', '.xls']
    const fileName = file.name.toLowerCase()
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      errors.push('Invalid file type. Only .xlsx and .xls files are allowed')
    }
    
    // Check MIME type
    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    
    if (!validMimeTypes.includes(file.type) && file.type !== '') {
      errors.push('Invalid file format')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}
