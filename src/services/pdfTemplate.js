/**
 * PDF Template Generator — HKBU Grade Amendment Form
 * Generates a PDF that matches the official HKBU Academic Registry Grade Amendment Form
 * Last modified: Dec 2025
 */
import { jsPDF } from 'jspdf'

/**
 * Draw a bordered box on the PDF
 */
function drawBox(doc, x, y, w, h) {
  doc.setDrawColor(0)
  doc.setLineWidth(0.5)
  doc.rect(x, y, w, h)
}

/**
 * Draw a horizontal line
 */
function drawLine(doc, x1, y1, x2, y2, thick) {
  doc.setLineWidth(thick ? 1 : 0.3)
  doc.line(x1, y1, x2, y2)
}

/**
 * Draw an underlined text field with label
 */
function drawField(doc, label, x, y, lineWidth) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(label, x, y)
  const labelWidth = doc.getTextWidth(label)
  drawLine(doc, x + labelWidth + 2, y + 0.5, x + labelWidth + 2 + lineWidth, y + 0.5)
}

/**
 * Draw a checkbox
 */
function drawCheckbox(doc, x, y, size = 3.5) {
  doc.setLineWidth(0.3)
  doc.rect(x, y - size + 0.5, size, size)
}

export function generateGradeAmendmentPDF(data = {}) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const margin = 18
  const contentWidth = pageWidth - margin * 2
  let y = 18

  // ===== Title =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('HONG KONG BAPTIST UNIVERSITY', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(12)
  doc.text('ACADEMIC REGISTRY', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(13)
  doc.text('Grade Amendment Form', pageWidth / 2, y, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  y += 4

  // Thick line under title
  drawLine(doc, margin, y, pageWidth - margin, y, true)
  y += 7

  // ===== REQUEST FOR GRADE AMENDMENT header + AY / Term =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('REQUEST FOR GRADE AMENDMENT', margin, y)

  // AY field
  const ayX = 108
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('AY:  20', ayX, y)
  const ay1X = ayX + doc.getTextWidth('AY:  20')
  drawLine(doc, ay1X, y + 0.5, ay1X + 8, y + 0.5)
  doc.text('- 20', ay1X + 8, y)
  const ay2X = ay1X + 8 + doc.getTextWidth('- 20')
  drawLine(doc, ay2X, y + 0.5, ay2X + 8, y + 0.5)

  // Term
  const termX = ay2X + 14
  doc.text('Term:', termX, y)
  drawLine(doc, termX + doc.getTextWidth('Term:') + 2, y + 0.5, termX + doc.getTextWidth('Term:') + 14, y + 0.5)

  // Fill in AY and Term if provided
  if (data.academicYear) {
    const parts = data.academicYear.split('-')
    if (parts.length === 2) {
      doc.setFont('helvetica', 'normal')
      doc.text(parts[0].slice(-2), ay1X + 1, y)
      doc.text(parts[1].slice(-2), ay2X + 1, y)
    }
  }
  if (data.term) {
    doc.text(data.term, termX + doc.getTextWidth('Term:') + 5, y)
  }

  y += 9

  // ===== Student No. / Student Name =====
  drawField(doc, 'Student No.:', margin, y, 40)
  drawField(doc, 'Student Name:', pageWidth / 2 + 2, y, 50)
  if (data.studentNo) {
    doc.text(data.studentNo, margin + doc.getTextWidth('Student No.:') + 5, y)
  }
  if (data.studentName) {
    doc.text(data.studentName, pageWidth / 2 + 2 + doc.getTextWidth('Student Name:') + 5, y)
  }
  y += 9

  // ===== Course Code & Title =====
  drawField(doc, 'Course Code & Title:', margin, y, contentWidth - doc.getTextWidth('Course Code & Title:') - 2)
  if (data.courseCode && data.courseTitle) {
    doc.text(`${data.courseCode} — ${data.courseTitle}`, margin + doc.getTextWidth('Course Code & Title:') + 5, y)
  }
  y += 9

  // ===== Original Grade / New Grade =====
  drawField(doc, 'Original Grade:', margin, y, 30)
  drawField(doc, 'New Grade:', pageWidth / 2 + 2, y, 40)
  if (data.originalGrade) {
    doc.text(data.originalGrade, margin + doc.getTextWidth('Original Grade:') + 5, y)
  }
  if (data.newGrade) {
    doc.text(data.newGrade, pageWidth / 2 + 2 + doc.getTextWidth('New Grade:') + 5, y)
  }
  y += 8

  // ===== Warning note =====
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('*', margin, y)
  drawCheckbox(doc, margin + 3, y)

  const noteX = margin + 9
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const noteText = 'If the grade amendment involves a student who is in his/her final semester of final year, please make sure that the'
  doc.text(noteText, noteX, y)
  y += 3.5
  doc.setFont('helvetica', 'bold')
  doc.text('student is well informed', noteX, y)
  doc.setFont('helvetica', 'normal')
  const cont1 = ' that if the grade amendment affects the classification of honours, his/her graduation with the'
  doc.text(cont1, noteX + doc.getTextWidth('student is well informed'), y)
  y += 3.5
  doc.text('revised classification of honours will need to be re-submitted to the Senate for approval. As a result, the approval date', noteX, y)
  y += 3.5
  doc.text('of his/her graduation by the Senate and the award date for his/her diploma will be postponed accordingly.', noteX, y)
  y += 7

  // ===== Reason for Amendment =====
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Reason for Amendment (please "', margin, y)
  doc.setFont('helvetica', 'bold')
  // checkmark symbol
  doc.text('/', margin + doc.getTextWidth('Reason for Amendment (please "'), y)
  doc.setFont('helvetica', 'normal')
  doc.text('" as appropriate):', margin + doc.getTextWidth('Reason for Amendment (please "/'), y)
  y += 7

  // Left column checkboxes
  const leftX = margin + 4
  const rightX = pageWidth / 2 + 8

  // Conversion
  drawCheckbox(doc, margin, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Conversion of temporary grade (I, NR, PR, YR)', leftX + 4, y)
  if (data.reasonType === 'conversion') {
    doc.text('X', margin + 0.7, y - 0.3)
  }

  // Appeal (right side)
  drawCheckbox(doc, rightX - 6, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Appeal by student*', rightX - 1, y)
  if (data.reasonType === 'appeal') {
    doc.text('X', rightX - 5.3, y - 0.3)
  }
  y += 7

  // Make up examination
  drawCheckbox(doc, margin, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Make up examination', leftX + 4, y)
  doc.setFont('helvetica', 'normal')
  doc.text(' (Please provide details):', leftX + 4 + doc.getTextWidth('Make up examination'), y)
  if (data.reasonType === 'makeup') {
    doc.setFont('helvetica', 'bold')
    doc.text('X', margin + 0.7, y - 0.3)
  }

  // Appeal grounds (right side)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Grounds for Appeal:', rightX - 1, y)
  y += 5
  drawCheckbox(doc, rightX - 1, y)
  doc.text('Technical errors', rightX + 4, y)
  const procX = rightX + 34
  drawCheckbox(doc, procX, y)
  doc.text('Procedural faults', procX + 5, y)
  if (data.appealGrounds === 'Technical errors') {
    doc.setFont('helvetica', 'bold')
    doc.text('X', rightX - 0.3, y - 0.3)
    doc.setFont('helvetica', 'normal')
  }
  if (data.appealGrounds === 'Procedural faults') {
    doc.setFont('helvetica', 'bold')
    doc.text('X', procX + 0.7, y - 0.3)
    doc.setFont('helvetica', 'normal')
  }
  y += 2

  // Details line (left - makeup)
  drawLine(doc, leftX + 4, y + 3, pageWidth / 2 - 4, y + 3)
  // Please provide details below (right)
  doc.text('Please provide details below:', rightX - 1, y + 3)
  y += 7
  drawLine(doc, leftX + 4, y, pageWidth / 2 - 4, y)
  drawLine(doc, rightX - 1, y, pageWidth - margin, y)
  y += 5

  // Supplementary examination
  drawCheckbox(doc, margin, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Supplementary examination', leftX + 4, y)
  doc.setFont('helvetica', 'normal')
  doc.text(' (Please provide details):', leftX + 4 + doc.getTextWidth('Supplementary examination'), y)
  if (data.reasonType === 'supplementary') {
    doc.setFont('helvetica', 'bold')
    doc.text('X', margin + 0.7, y - 0.3)
    doc.setFont('helvetica', 'normal')
  }

  // Course-Instructor's Name (right side)
  drawField(doc, "Course-Instructor's Name:", rightX - 1, y, 42)
  if (data.instructorName) {
    doc.text(data.instructorName, rightX - 1 + doc.getTextWidth("Course-Instructor's Name:") + 3, y)
  }
  y += 5
  drawLine(doc, leftX + 4, y, pageWidth / 2 - 4, y)
  y += 5

  // Review initiated by academic staff
  drawCheckbox(doc, margin, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Review initiated by academic staff', leftX + 4, y)
  doc.setFont('helvetica', 'normal')
  doc.text(' * (Please provide', leftX + 4 + doc.getTextWidth('Review initiated by academic staff'), y)
  if (data.reasonType === 'review') {
    doc.setFont('helvetica', 'bold')
    doc.text('X', margin + 0.7, y - 0.3)
    doc.setFont('helvetica', 'normal')
  }

  // Department (right side)
  drawField(doc, 'Department:', rightX - 1, y, 52)
  if (data.department) {
    doc.text(data.department, rightX - 1 + doc.getTextWidth('Department:') + 3, y)
  }
  y += 4
  doc.text('details):', leftX + 4, y)
  y += 4

  // Signature (right)
  drawField(doc, 'Signature:', rightX - 1, y - 1, 52)
  drawLine(doc, leftX + 4, y, pageWidth / 2 - 4, y)
  y += 5

  // Others
  drawCheckbox(doc, margin, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Others', leftX + 4, y)
  doc.setFont('helvetica', 'normal')
  doc.text(' (please specify):', leftX + 4 + doc.getTextWidth('Others'), y)
  if (data.reasonType === 'others') {
    doc.setFont('helvetica', 'bold')
    doc.text('X', margin + 0.7, y - 0.3)
    doc.setFont('helvetica', 'normal')
  }

  // Date (right)
  drawField(doc, 'Date:', rightX - 1, y, 56)
  y += 4
  drawLine(doc, leftX + 4, y, pageWidth / 2 - 4, y)
  y += 3

  // ===== Left: Course-Instructor section =====
  y += 3
  drawField(doc, "Course-Instructor's Name:", margin, y, 48)
  y += 6
  drawField(doc, 'Department:', margin, y, 56)
  y += 6
  drawField(doc, 'Signature:', margin, y, 56)
  y += 6
  drawField(doc, 'Date:', margin, y, 60)

  y += 8

  // ===== Programme Director / Department Head's Endorsement (2 columns) =====
  const boxY = y
  const halfWidth = contentWidth / 2 - 2

  // Left box
  drawBox(doc, margin, boxY, halfWidth, 42)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text("Programme Director / Department Head's", margin + halfWidth / 2, boxY + 6, { align: 'center' })
  doc.text('Endorsement', margin + halfWidth / 2, boxY + 11, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  drawLine(doc, margin + 6, boxY + 20, margin + halfWidth - 6, boxY + 20)
  doc.text('Name & Signature', margin + halfWidth / 2, boxY + 24, { align: 'center' })
  drawLine(doc, margin + 6, boxY + 30, margin + halfWidth - 6, boxY + 30)
  doc.text('Date', margin + halfWidth / 2, boxY + 34, { align: 'center' })
  doc.text('Remarks:', margin + 4, boxY + 39)
  drawLine(doc, margin + 4 + doc.getTextWidth('Remarks:') + 2, boxY + 39.5, margin + halfWidth - 4, boxY + 39.5)

  // Right box
  const rightBoxX = margin + halfWidth + 4
  drawBox(doc, rightBoxX, boxY, halfWidth, 42)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text("Programme Director / Department Head's", rightBoxX + halfWidth / 2, boxY + 6, { align: 'center' })
  doc.text('Endorsement', rightBoxX + halfWidth / 2, boxY + 11, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  drawLine(doc, rightBoxX + 6, boxY + 20, rightBoxX + halfWidth - 6, boxY + 20)
  doc.text('Name & Signature', rightBoxX + halfWidth / 2, boxY + 24, { align: 'center' })
  drawLine(doc, rightBoxX + 6, boxY + 30, rightBoxX + halfWidth - 6, boxY + 30)
  doc.text('Date', rightBoxX + halfWidth / 2, boxY + 34, { align: 'center' })
  doc.text('Remarks:', rightBoxX + 4, boxY + 39)
  drawLine(doc, rightBoxX + 4 + doc.getTextWidth('Remarks:') + 2, boxY + 39.5, rightBoxX + halfWidth - 4, boxY + 39.5)

  y = boxY + 48

  // ===== Faculty/School Dean's Approval =====
  drawBox(doc, margin + halfWidth + 4, y, halfWidth, 32)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text("Faculty/School Dean's Approval", rightBoxX + halfWidth / 2, y + 5, { align: 'center' })
  doc.setFontSize(9)
  doc.text('(Required for Appeal by Student)', rightBoxX + halfWidth / 2, y + 9, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  drawLine(doc, rightBoxX + 6, y + 17, rightBoxX + halfWidth - 6, y + 17)
  doc.text('Name & Signature', rightBoxX + halfWidth / 2, y + 21, { align: 'center' })
  drawLine(doc, rightBoxX + 6, y + 25, rightBoxX + halfWidth - 6, y + 25)
  doc.text('Date', rightBoxX + halfWidth / 2, y + 29, { align: 'center' })

  y += 36

  // ===== Thick separator =====
  drawLine(doc, margin, y, pageWidth - margin, y, true)
  y += 5

  // ===== Assistant Academic Registrar's Approval =====
  drawBox(doc, margin, y, contentWidth, 26)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text("Assistant Academic Registrar's Approval", margin + 4, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  // Approved / Not Approved checkboxes
  drawCheckbox(doc, margin + 6, y + 12)
  doc.text('Approved', margin + 12, y + 12)
  drawCheckbox(doc, margin + 36, y + 12)
  doc.text('Not Approved', margin + 42, y + 12)

  // Signature and Date
  drawField(doc, 'Signature:', margin + 4, y + 18, 50)
  drawField(doc, 'Date:', margin + contentWidth / 2 + 8, y + 18, 44)

  // Remarks
  doc.text('Remarks:', margin + 4, y + 24)
  drawLine(doc, margin + 4 + doc.getTextWidth('Remarks:') + 2, y + 24.5, margin + contentWidth - 4, y + 24.5)

  y += 32

  // ===== For Use of the Academic Registry =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('For Use of the Academic Registry', margin + 4, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  y += 7
  drawField(doc, 'Grade Entry by:', margin + 4, y, 46)
  drawField(doc, 'Checked by:', margin + contentWidth / 2 + 8, y, 44)
  y += 6
  drawField(doc, 'Date:', margin + 4, y, 55)
  drawField(doc, 'Date:', margin + contentWidth / 2 + 8, y, 49)

  y += 12

  // ===== Privacy Policy =====
  drawLine(doc, margin, y, pageWidth - margin, y)
  y += 5
  doc.setFontSize(8)
  doc.text('Privacy Policy Statement and Personal Information Collection Statement of the University is available at:', margin, y)
  y += 4
  doc.setTextColor(0, 0, 200)
  doc.text('https://bupdpo.hkbu.edu.hk/policies-and-procedures/pps-pics/', margin, y)
  doc.setTextColor(0, 0, 0)

  y += 8
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('Last modified: Dec 2025', margin, y)

  return doc
}

/**
 * Download the Grade Amendment Form template as PDF
 */
export function downloadTemplate(data = {}) {
  const doc = generateGradeAmendmentPDF(data)
  doc.save('HKBU_Grade_Amendment_Form.pdf')
}

/**
 * Download a filled-in Grade Amendment Form
 */
/**
 * Download filled form with user signature
 */
import { useAuthStore } from '@/stores/authStore'

export async function downloadFilledForm(amendment) {
  try {
    const { PDFDocument, PDFImage } = await import('pdf-lib')
    const auth = useAuthStore()
    
    const data = {
      academicYear: amendment.academic_year || '',
      term: amendment.term || '',
      studentNo: amendment.student_no || amendment.student_id || '',
      studentName: amendment.student_name || '',
      courseCode: amendment.course_code || '',
      courseTitle: amendment.course_title || '',
      originalGrade: amendment.original_grade || '',
      newGrade: amendment.new_grade || '',
      reasonType: amendment.reason_type || '',
      reasonDetails: amendment.reason_details || '',
      appealGrounds: amendment.appeal_grounds || '',
      appealDetails: amendment.appeal_details || '',
      instructorName: amendment.instructor_name || auth.user?.name || '',
      instructorSignature: auth.user?.signature || '',
      instructorDate: new Date().toLocaleDateString(),
      department: amendment.department || '',
      departmentHeadName: '',
      departmentHeadSignature: auth.user?.signature || '',
      departmentHeadDate: new Date().toLocaleDateString(),
      registrarSignature: auth.user?.signature || '',
      registrarDate: new Date().toLocaleDateString()
    }
    
    // Load template PDF
    const templateUrl = '/grade-amendment-template.pdf'
    const response = await fetch(templateUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.status}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    
    // Add text to the PDF
    const { rgb } = await import('pdf-lib')
    
    // Define positions (adjust these based on your template layout)
    const positions = {
      academicYear: { x: 50, y: 750 },
      term: { x: 150, y: 750 },
      studentNo: { x: 50, y: 710 },
      studentName: { x: 150, y: 710 },
      courseCode: { x: 50, y: 670 },
      courseTitle: { x: 150, y: 670 },
      originalGrade: { x: 50, y: 630 },
      newGrade: { x: 150, y: 630 },
      reasonTypeConversion: { x: 50, y: 590 },
      reasonTypeMakeup: { x: 50, y: 575 },
      reasonTypeSupplementary: { x: 50, y: 560 },
      reasonTypeReview: { x: 50, y: 545 },
      reasonTypeAppeal: { x: 50, y: 530 },
      reasonTypeOthers: { x: 50, y: 515 },
      reasonDetails: { x: 50, y: 490 },
      appealGrounds: { x: 50, y: 460 },
      appealDetails: { x: 50, y: 430 },
      instructorName: { x: 50, y: 400 },
      instructorSignature: { x: 50, y: 370, width: 100, height: 30 },
      instructorDate: { x: 150, y: 370 },
      department: { x: 50, y: 340 },
      departmentHeadName: { x: 150, y: 340 },
      departmentHeadSignature: { x: 50, y: 310, width: 100, height: 30 },
      departmentHeadDate: { x: 150, y: 310 },
      registrarSignature: { x: 50, y: 280, width: 100, height: 30 },
      registrarDate: { x: 150, y: 280 }
    }
    
    // Helper function to add field
    const addField = (fieldData, fieldKey) => {
      if (fieldData && positions[fieldKey]) {
        firstPage.drawText(String(fieldData), { 
          x: positions[fieldKey].x, 
          y: positions[fieldKey].y,
          size: 10,
          color: rgb(0, 0, 0)
        })
      }
    }
    
    // Helper function to add signature image
    const addSignature = async (signatureData, positionKey) => {
      if (!signatureData || !positions[positionKey]) return
      
      try {
        const signatureImage = await pdfDoc.embedPng(signatureData)
        const pos = positions[positionKey]
        firstPage.drawImage(signatureImage, {
          x: pos.x,
          y: pos.y - pos.height,
          width: pos.width,
          height: pos.height
        })
      } catch (e) {
        console.warn('Could not embed signature:', e)
      }
    }
    
    // Helper function to draw checkbox
    const drawCheckbox = (x, y, isChecked, size = 3) => {
      // Draw box outline
      firstPage.drawRectangle({
        x: x,
        y: y - size,
        width: size * 2,
        height: size * 2,
        borderColor: rgb(0, 0, 0),
        borderWidth: 0.5
      })
      
      // Draw checkmark if checked
      if (isChecked) {
        firstPage.drawText('✓', {
          x: x + 1,
          y: y - 1,
          size: 8,
          color: rgb(0, 0, 0)
        })
      }
    }
    
    // Add all text fields
    addField(data.academicYear, 'academicYear')
    addField(data.term, 'term')
    addField(data.studentNo, 'studentNo')
    addField(data.studentName, 'studentName')
    addField(data.courseCode, 'courseCode')
    addField(data.courseTitle, 'courseTitle')
    addField(data.originalGrade, 'originalGrade')
    addField(data.newGrade, 'newGrade')
    addField(data.reasonDetails, 'reasonDetails')
    addField(data.appealGrounds, 'appealGrounds')
    addField(data.appealDetails, 'appealDetails')
    addField(data.instructorName, 'instructorName')
    addField(data.instructorDate, 'instructorDate')
    addField(data.department, 'department')
    addField(data.departmentHeadName, 'departmentHeadName')
    addField(data.departmentHeadDate, 'departmentHeadDate')
    addField(data.registrarDate, 'registrarDate')
    
    // Add signatures
    await addSignature(data.instructorSignature, 'instructorSignature')
    await addSignature(data.departmentHeadSignature, 'departmentHeadSignature')
    await addSignature(data.registrarSignature, 'registrarSignature')
    
    // Draw checkboxes for reason types
    const reasonType = data.reasonType.toLowerCase()
    if (positions.reasonTypeConversion) {
      drawCheckbox(positions.reasonTypeConversion.x, positions.reasonTypeConversion.y, reasonType === 'conversion')
    }
    if (positions.reasonTypeMakeup) {
      drawCheckbox(positions.reasonTypeMakeup.x, positions.reasonTypeMakeup.y, reasonType === 'makeup')
    }
    if (positions.reasonTypeSupplementary) {
      drawCheckbox(positions.reasonTypeSupplementary.x, positions.reasonTypeSupplementary.y, reasonType === 'supplementary')
    }
    if (positions.reasonTypeReview) {
      drawCheckbox(positions.reasonTypeReview.x, positions.reasonTypeReview.y, reasonType === 'review')
    }
    if (positions.reasonTypeAppeal) {
      drawCheckbox(positions.reasonTypeAppeal.x, positions.reasonTypeAppeal.y, reasonType === 'appeal')
    }
    if (positions.reasonTypeOthers) {
      drawCheckbox(positions.reasonTypeOthers.x, positions.reasonTypeOthers.y, reasonType === 'others')
    }
    
    // Save and download
    const modifiedPdfBytes = await pdfDoc.save()
    const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Grade_Amendment_${data.studentNo || 'Form'}_${data.courseCode || ''}.pdf`
    link.click()
    URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error('Error generating PDF from template:', error)
    // Fallback to original jsPDF generation
    const data = {
      academicYear: amendment.academic_year || '',
      term: amendment.term || '',
      studentNo: amendment.student_no || amendment.student_id || '',
      studentName: amendment.student_name || '',
      courseCode: amendment.course_code || '',
      courseTitle: amendment.course_title || '',
      originalGrade: amendment.original_grade || '',
      newGrade: amendment.new_grade || '',
      reasonType: amendment.reason_type || '',
      reasonDetails: amendment.reason_details || '',
      appealGrounds: amendment.appeal_grounds || '',
      appealDetails: amendment.appeal_details || '',
      instructorName: amendment.instructor_name || '',
      department: amendment.department || ''
    }
    const doc = generateGradeAmendmentPDF(data)
    doc.save(`Grade_Amendment_${data.studentNo || 'Form'}_${data.courseCode || ''}.pdf`)
  }
}
