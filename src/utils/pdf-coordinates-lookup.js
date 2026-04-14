/**
 * Grade Amendment Form PDF - Coordinate Lookup Module
 * Quick reference for field coordinates when filling PDFs with pdf-lib
 * 
 * Usage in Node.js:
 *   import { getFieldCoord, getAllCoordinates, validateFormData } from './pdf-coordinates-lookup.js'
 *   const coord = getFieldCoord('studentNo')  // { x: 340, y: 1855, size: 26 }
 */

export const PDF_PAGES = {
  PAGE_1: {
    width: 1581.03,
    height: 2225.22,
    name: 'Form Data Entry'
  },
  PAGE_2: {
    width: 1667.85,
    height: 2353.83,
    name: 'Academic Registry Approval'
  }
}

/**
 * PAGE 1: Student Information & Common Fields
 */
export const STUDENT_INFO = {
  studentNo: { x: 340, y: 1876, size: 26, page: 1, dataKey: 'student_no' },
  studentName: { x: 980, y: 1876, size: 26, page: 1, dataKey: 'student_name' },
  courseInfo: { x: 400, y: 1812, size: 24, page: 1, dataKeys: ['course_code', 'course_title'], format: '${code} - ${title}', maxLength: 50 },
  originalGrade: { x: 350, y: 1756, size: 26, page: 1, dataKey: 'original_grade' },
  newGrade: { x: 950, y: 1753, size: 26, page: 1, dataKey: 'new_grade' }
}

/**
 * PAGE 1: Academic Year & Term
 */
export const ACADEMIC_YEAR_TERM = {
  academicYearYear1: { x: 912, y: 1930, size: 26, page: 1, dataKey: 'academic_year', extraction: 'firstYear' },
  academicYearYear2: { x: 1037, y: 1932, size: 26, page: 1, dataKey: 'academic_year', extraction: 'secondYear' },
  term: { x: 1208, y: 1933, size: 26, page: 1, dataKey: 'term' }
}

/**
 * PAGE 1: Final Year Student Checkbox
 */
export const CHECKBOXES_GENERAL = {
  finalYearStudent: { x: 105, y: 1650, page: 1, type: 'checkbox', dataKey: 'final_year_student' }
}

/**
 * PAGE 1: Reason Type Checkboxes (LEFT COLUMN - Non-Appeal)
 */
export const REASON_TYPES = {
  conversion: {
    checkbox: { x: 155, y: 1496, page: 1, type: 'checkbox' },
    reasonType: 'conversion'
  },
  makeup: {
    checkbox: { x: 159, y: 1459, page: 1, type: 'checkbox' },
    details: { x: 200, y: 1459, size: 22, page: 1, lines: 2, spacing: 4.5 },
    reasonType: 'makeup'
  },
  supplementary: {
    checkbox: { x: 157, y: 1336, page: 1, type: 'checkbox' },
    details: { x: 200, y: 1336, size: 22, page: 1, lines: 2, spacing: 4.5 },
    reasonType: 'supplementary'
  },
  review: {
    checkbox: { x: 148, y: 1217, page: 1, type: 'checkbox' },
    details: { x: 200, y: 1217, size: 22, page: 1, lines: 2, spacing: 4.5 },
    reasonType: 'review'
  },
  others: {
    checkbox: { x: 142, y: 1069, page: 1, type: 'checkbox' },
    details: { x: 200, y: 1069, size: 22, page: 1, lines: 2, spacing: 4.5 },
    reasonType: 'others'
  }
}

/**
 * PAGE 1: Appeal Checkboxes & Details (RIGHT COLUMN)
 */
export const APPEAL_FIELDS = {
  appealCheckbox: { x: 820, y: 1499, page: 1, type: 'checkbox', reasonType: 'appeal' },
  technicalErrors: { x: 874, y: 1401, page: 1, type: 'checkbox', appealGround: 'Technical errors' },
  proceduralFaults: { x: 1182, y: 1405, page: 1, type: 'checkbox', appealGround: 'Procedural faults' },
  appealDetails: { x: 825, y: 1318, size: 22, page: 1, lines: 2, spacing: 4.5 }
}

/**
 * PAGE 1: Course Instructor Details (LEFT SIDE - Non-Appeal)
 */
export const INSTRUCTOR_LEFT = {
  name: { x: 435, y: 932, size: 26, page: 1, dataKey: 'instructor_name' },
  department: { x: 310, y: 870, size: 26, page: 1, dataKey: 'department' },
  signature: { x: 320, y: 822, width: 120, height: 48, page: 1, type: 'image', format: 'PNG', dataKey: 'instructor_signature' },
  date: { x: 325, y: 760, size: 26, page: 1, dataKey: 'instructor_date' }
}

/**
 * PAGE 1: Programme Director Endorsement (LEFT SIDE - Non-Appeal)
 */
export const DIRECTOR_ENDORSEMENT_LEFT = {
  name: { x: 225, y: 553, size: 26, page: 1, dataKey: 'endorser_name' },
  signature: { x: 400, y: 510, width: 120, height: 48, page: 1, type: 'image', format: 'PNG', dataKey: 'endorsement_signature' },
  date: { x: 235, y: 463, size: 26, page: 1, dataKey: 'endorsement_date' }
}

/**
 * PAGE 1: Course Instructor Details (RIGHT SIDE - Appeal)
 */
export const INSTRUCTOR_RIGHT = {
  name: { x: 1100, y: 1196, size: 26, page: 1, dataKey: 'instructor_name' },
  department: { x: 975, y: 1143, size: 26, page: 1, dataKey: 'department' },
  signature: { x: 975, y: 1077, width: 120, height: 48, page: 1, type: 'image', format: 'PNG', dataKey: 'instructor_signature' },
  date: { x: 977, y: 1017, size: 26, page: 1, dataKey: 'instructor_date' }
}

/**
 * PAGE 1: Programme Director Endorsement (RIGHT SIDE - Appeal)
 */
export const DIRECTOR_ENDORSEMENT_RIGHT = {
  name: { x: 900, y: 836, size: 26, page: 1, dataKey: 'endorser_name' },
  signature: { x: 1100, y: 788, width: 120, height: 48, page: 1, type: 'image', format: 'PNG', dataKey: 'endorsement_signature' },
  date: { x: 900, y: 748, size: 26, page: 1, dataKey: 'endorsement_date' }
}

/**
 * PAGE 2: Assistant Academic Registrar's Approval (Pending detailed mapping)
 */
export const PAGE_2_AAR_APPROVAL = {
  status: 'PENDING',
  note: 'Coordinates for Page 2 fields need to be extracted/verified'
}

/**
 * Helper function to get coordinates for a specific field
 * @param {string} fieldName - Name of the field (e.g., 'studentNo', 'newGrade')
 * @returns {Object|null} Coordinate object or null if not found
 */
export function getFieldCoord(fieldName) {
  const allCoords = {
    // Student Info
    studentNo: STUDENT_INFO.studentNo,
    studentName: STUDENT_INFO.studentName,
    courseInfo: STUDENT_INFO.courseInfo,
    originalGrade: STUDENT_INFO.originalGrade,
    newGrade: STUDENT_INFO.newGrade,
    
    // Academic Year & Term
    academicYearYear1: ACADEMIC_YEAR_TERM.academicYearYear1,
    academicYearYear2: ACADEMIC_YEAR_TERM.academicYearYear2,
    term: ACADEMIC_YEAR_TERM.term,
    
    // Checkboxes
    finalYearStudent: CHECKBOXES_GENERAL.finalYearStudent,
    
    // Reason Types
    conversionCheckbox: REASON_TYPES.conversion.checkbox,
    makeupCheckbox: REASON_TYPES.makeup.checkbox,
    makeupDetails: REASON_TYPES.makeup.details,
    supplementaryCheckbox: REASON_TYPES.supplementary.checkbox,
    supplementaryDetails: REASON_TYPES.supplementary.details,
    reviewCheckbox: REASON_TYPES.review.checkbox,
    reviewDetails: REASON_TYPES.review.details,
    othersCheckbox: REASON_TYPES.others.checkbox,
    othersDetails: REASON_TYPES.others.details,
    
    // Appeal Fields
    appealCheckbox: APPEAL_FIELDS.appealCheckbox,
    technicalErrorsCheckbox: APPEAL_FIELDS.technicalErrors,
    proceduralFaultsCheckbox: APPEAL_FIELDS.proceduralFaults,
    appealDetails: APPEAL_FIELDS.appealDetails,
    
    // Instructor (Left)
    instructorNameLeft: INSTRUCTOR_LEFT.name,
    departmentLeft: INSTRUCTOR_LEFT.department,
    signatureLeft: INSTRUCTOR_LEFT.signature,
    dateLeft: INSTRUCTOR_LEFT.date,
    
    // Director (Left)
    directorNameLeft: DIRECTOR_ENDORSEMENT_LEFT.name,
    directorSignatureLeft: DIRECTOR_ENDORSEMENT_LEFT.signature,
    directorDateLeft: DIRECTOR_ENDORSEMENT_LEFT.date,
    
    // Instructor (Right)
    instructorNameRight: INSTRUCTOR_RIGHT.name,
    departmentRight: INSTRUCTOR_RIGHT.department,
    signatureRight: INSTRUCTOR_RIGHT.signature,
    dateRight: INSTRUCTOR_RIGHT.date,
    
    // Director (Right)
    directorNameRight: DIRECTOR_ENDORSEMENT_RIGHT.name,
    directorSignatureRight: DIRECTOR_ENDORSEMENT_RIGHT.signature,
    directorDateRight: DIRECTOR_ENDORSEMENT_RIGHT.date
  }
  
  return allCoords[fieldName] || null
}

/**
 * Get all coordinates grouped by section
 * @returns {Object} All coordinate definitions
 */
export function getAllCoordinates() {
  return {
    studentInfo: STUDENT_INFO,
    academicYearTerm: ACADEMIC_YEAR_TERM,
    checkboxesGeneral: CHECKBOXES_GENERAL,
    reasonTypes: REASON_TYPES,
    appealFields: APPEAL_FIELDS,
    instructorLeft: INSTRUCTOR_LEFT,
    directorEndorsementLeft: DIRECTOR_ENDORSEMENT_LEFT,
    instructorRight: INSTRUCTOR_RIGHT,
    directorEndorsementRight: DIRECTOR_ENDORSEMENT_RIGHT
  }
}

/**
 * Get field coordinates for a specific reason type
 * @param {string} reasonType - Type of reason ('conversion', 'makeup', 'supplementary', 'review', 'others', 'appeal')
 * @returns {Object|null} Coordinates for checkbox and details (if applicable)
 */
export function getReasonTypeCoords(reasonType) {
  if (reasonType === 'appeal') {
    return APPEAL_FIELDS
  }
  
  return REASON_TYPES[reasonType] || null
}

/**
 * Validate form data structure
 * @param {Object} data - Form data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateFormData(data) {
  const errors = []
  
  // Required fields check
  if (!data.studentNo) errors.push('Student No. is required')
  if (!data.studentName) errors.push('Student Name is required')
  if (!data.originalGrade) errors.push('Original Grade is required')
  if (!data.newGrade) errors.push('New Grade is required')
  
  // Reason type validation
  const validReasonTypes = ['conversion', 'makeup', 'supplementary', 'review', 'others', 'appeal']
  if (data.reasonType && !validReasonTypes.includes(data.reasonType)) {
    errors.push(`Invalid reason type: ${data.reasonType}`)
  }
  
  // Appeal-specific validation
  if (data.reasonType === 'appeal') {
    const validAppealGrounds = ['Technical errors', 'Procedural faults']
    if (data.appealGrounds && !validAppealGrounds.includes(data.appealGrounds)) {
      errors.push(`Invalid appeal ground: ${data.appealGrounds}`)
    }
  }
  
  // Academic year format validation
  if (data.academicYear && !data.academicYear.match(/^\d{2}-\d{2}$/)) {
    errors.push(`Invalid academic year format: ${data.academicYear} (expected: YY-YY)`)
  }
  
  // Course code + title length validation
  if (data.courseCode && data.courseTitle) {
    const combined = `${data.courseCode} - ${data.courseTitle}`
    if (combined.length > 50) {
      errors.push(`Course info too long (${combined.length} chars, max 50): ${combined}`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get display-friendly field information
 * Shows which fields are required, their types, and constraints
 * @returns {Object} Field metadata
 */
export function getFieldMetadata() {
  return {
    sections: [
      {
        name: 'Student Information',
        required: true,
        fields: Object.keys(STUDENT_INFO)
      },
      {
        name: 'Academic Year & Term',
        required: true,
        fields: Object.keys(ACADEMIC_YEAR_TERM)
      },
      {
        name: 'Reason Type Selection',
        required: true,
        note: 'Only one reason type should be selected',
        fields: Object.keys(REASON_TYPES)
      },
      {
        name: 'Instructor Information',
        required: true,
        note: 'Different instructors for appeal vs non-appeal',
        fields: [...Object.keys(INSTRUCTOR_LEFT), ...Object.keys(INSTRUCTOR_RIGHT)]
      },
      {
        name: 'Director Endorsement',
        required: true,
        fields: [...Object.keys(DIRECTOR_ENDORSEMENT_LEFT), ...Object.keys(DIRECTOR_ENDORSEMENT_RIGHT)]
      }
    ]
  }
}

/**
 * Convert page coordinates if needed (e.g., for screen display with zoom)
 * @param {Object} coord - Original coordinate object
 * @param {number} scale - Scale factor (e.g., 1.0 for 100%, 2.0 for 200%)
 * @returns {Object} Scaled coordinate
 */
export function scaleCoordinate(coord, scale) {
  return {
    ...coord,
    x: coord.x * scale,
    y: coord.y * scale,
    ...(coord.width && { width: coord.width * scale }),
    ...(coord.height && { height: coord.height * scale }),
    ...(coord.size && { size: coord.size * scale })
  }
}

/**
 * Export quick reference table for documentation
 * @returns {string} Markdown table format
 */
export function generateReferenceTable() {
  const rows = []
  
  Object.entries(STUDENT_INFO).forEach(([key, value]) => {
    rows.push(`| ${key} | ${value.x} | ${value.y} | ${value.size || 'N/A'}pt | ✓ Page ${value.page} |`)
  })
  
  Object.entries(ACADEMIC_YEAR_TERM).forEach(([key, value]) => {
    rows.push(`| ${key} | ${value.x} | ${value.y} | ${value.size || 'N/A'}pt | ✓ Page ${value.page} |`)
  })
  
  const header = `| Field | X | Y | Size | Status |
|-------|---|---|------|--------|`
  
  return `${header}\n${rows.join('\n')}`
}

// Default export for convenience
export default {
  PDF_PAGES,
  STUDENT_INFO,
  ACADEMIC_YEAR_TERM,
  CHECKBOXES_GENERAL,
  REASON_TYPES,
  APPEAL_FIELDS,
  INSTRUCTOR_LEFT,
  DIRECTOR_ENDORSEMENT_LEFT,
  INSTRUCTOR_RIGHT,
  DIRECTOR_ENDORSEMENT_RIGHT,
  getFieldCoord,
  getAllCoordinates,
  getReasonTypeCoords,
  validateFormData,
  getFieldMetadata,
  scaleCoordinate,
  generateReferenceTable
}
