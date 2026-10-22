/*
 * Builds the data object for the grade amendment PDF from what the server stored on the
 * amendment (and its submission). Shared by every role that can export a PDF so the form
 * shows who really submitted and endorsed it, never whoever happens to click the button.
 */

const pickFieldValue = (sources, keys) => {
  for (const src of sources) {
    if (!src) continue
    for (const key of keys) {
      if (!key) continue
      const value = src[key]
      if (value !== undefined && value !== null && value !== '') {
        return value
      }
    }
  }
  return null
}

const normalizeSignatureImage = (value) => {
  if (value === null || value === undefined) return null
  const normalized = String(value).trim()
  if (!normalized) return null
  if (/^data:image\/(png|jpe?g|webp);base64,/i.test(normalized)) {
    return normalized
  }
  return null
}

const pickSignatureFieldValue = (sources, keys) => {
  for (const src of sources) {
    if (!src) continue
    for (const key of keys) {
      if (!key) continue
      const normalized = normalizeSignatureImage(src[key])
      if (normalized) return normalized
    }
  }
  return null
}

const formatDateValue = (value, fallback) => {
  if (!value) return fallback
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString()
  return typeof value === 'string' ? value : fallback
}

export function buildPdfData(a, submission) {
  const sources = submission ? [a, submission] : [a]
  const instructorSignature = pickSignatureFieldValue(sources, [
    'instructor_signature',
    'instructorSignature',
    'teacher_signature',
    'teacherSignature',
    'faculty_signature',
    'facultySignature',
    'submitted_by_signature',
    'submittedBySignature',
    'submitted_signature',
    'submittedSignature',
    'signature'
  ]) || null
  const endorsementSignature = pickSignatureFieldValue(sources, [
    'endorsement_signature',
    'endorsementSignature',
    'programme_director_signature',
    'programmeDirectorSignature',
    'director_signature',
    'directorSignature',
    'approved_by_signature',
    'approvedBySignature',
    'pd_signature',
    'pdSignature',
    'approver_signature',
    'approverSignature'
  ]) || null
  const instructorDateRaw = pickFieldValue(sources, [
    'instructor_date',
    'instructorDate',
    'submitted_at',
    'amendmentDate',
    'submissionDate'
  ]) || a.created_at // not submitted yet: fall back to the day it was filed
  const endorsementDateRaw = pickFieldValue(sources, [
    'endorsement_date',
    'endorsementDate',
    'programme_director_date',
    'programmeDirectorDate',
    'directorDate',
    'pd_date',
    'pdDate',
    'approved_at'
  ])
  const instructorName = pickFieldValue(sources, [
    'instructor_name',
    'instructorName',
    'course_instructor',
    'teacherName',
    'submitted_by_name'
  ]) || a.instructor_name || ''
  const endorserName = pickFieldValue(sources, [
    'endorser_name',
    'endorserName',
    'programme_director_name',
    'programmeDirectorName',
    'directorName',
    'pd_name',
    'pdName',
    'approver_name',
    'approverName',
    'approved_by',
    'approvedBy',
    'approved_by_name',
    'approvedByName'
  ]) || ''
  const instructorDate = formatDateValue(instructorDateRaw, '')
  const endorsementDate = formatDateValue(endorsementDateRaw, '')

  return {
    academicYear: a.academic_year || '',
    term: a.term || '',
    studentNo: a.student_no || a.student_id || '',
    studentName: a.student_name || '',
    courseCode: a.course_code || '',
    courseTitle: a.course_title || '',
    originalGrade: a.original_grade || '',
    newGrade: a.new_grade || '',
    reasonType: a.reason_type || '',
    reasonDetails: a.reason_details || '',
    appealGrounds: a.appeal_grounds || '',
    appealDetails: a.appeal_details || '',
    instructorName,
    instructorSignature,
    instructorDate,
    department: a.department || '',
    endorsementSignature,
    endorserName,
    endorsementDate
  }
}
