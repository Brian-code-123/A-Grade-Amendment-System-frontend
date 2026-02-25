import PDFDocument from 'pdfkit'

/**
 * Generate a PDF document
 * @param {string} filename - Name of the output file
 * @param {function} contentFunction - Function that receives doc and populates it with content
 */
export function generatePDF(filename, contentFunction) {
  const doc = new PDFDocument()
  
  // Pipe to file (Node.js environment)
  const stream = require('fs').createWriteStream(filename)
  doc.pipe(stream)
  
  // Call the content function to populate the PDF
  contentFunction(doc)
  
  // End the document
  doc.end()
  
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filename))
    stream.on('error', reject)
  })
}

/**
 * Example: Create a grade amendment report
 */
export function createAmendmentReport(doc, amendments) {
  // Title
  doc.fontSize(20).font('Helvetica-Bold').text('Grade Amendment Report', { align: 'center' })
  doc.moveDown()
  
  // Date
  doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' })
  doc.moveDown(1.5)
  
  // Table header
  const tableTop = doc.y
  const col1 = 50
  const col2 = 150
  const col3 = 250
  const col4 = 350
  const col5 = 450
  
  doc.fontSize(9).font('Helvetica-Bold')
  doc.text('Student ID', col1, tableTop)
  doc.text('Name', col2, tableTop)
  doc.text('Course', col3, tableTop)
  doc.text('Old Grade', col4, tableTop)
  doc.text('New Grade', col5, tableTop)
  
  // Draw line
  doc.moveTo(col1, tableTop + 15).lineTo(550, tableTop + 15).stroke()
  
  // Table rows
  let y = tableTop + 25
  doc.fontSize(8).font('Helvetica')
  
  amendments.forEach((amendment) => {
    if (y > 700) {
      doc.addPage()
      y = 50
    }
    
    doc.text(amendment.studentId, col1, y)
    doc.text(amendment.name, col2, y)
    doc.text(amendment.courseCode, col3, y)
    doc.text(amendment.oldGrade, col4, y)
    doc.text(amendment.newGrade, col5, y)
    
    y += 20
  })
  
  // Footer
  doc.fontSize(8).text('This is an auto-generated report from the Grade Amendment System', 50, doc.page.height - 30, { align: 'center' })
}
