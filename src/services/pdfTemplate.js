/**
 * PDF Template Generator — HKBU Grade Amendment Form
 * Generates a 2-page PDF matching the official HKBU Academic Registry Grade Amendment Form
 * Reference: /Grade Amendments.pdf
 */
import { jsPDF } from 'jspdf'
import { useAuthStore } from '@/stores/authStore'
import { PDFDocument } from 'pdf-lib'

/* ── PDF-Lib Helper for Template Download ────────────────────────── */
export async function downloadTemplate() {
  try {
    const existingPdfBytes = await fetch('/form.pdf').then(res => res.arrayBuffer())
    const blob = new Blob([existingPdfBytes], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'form.pdf'
    link.click()
  } catch (e) {
    console.error('Error downloading template:', e)
    alert('Failed to download form.pdf from server root.')
  }
}


/* ── Drawing helpers (jsPDF) ─────────────────────────────────────── */

function box(doc, x, y, w, h) {
  doc.setDrawColor(0)
  doc.setLineWidth(0.5)
  doc.rect(x, y, w, h)
}

function line(doc, x1, y1, x2, y2, thick) {
  doc.setDrawColor(0)
  doc.setLineWidth(thick ? 0.8 : 0.3)
  doc.line(x1, y1, x2, y2)
}

function checkbox(doc, x, y, sz = 3.5) {
  doc.setDrawColor(0)
  doc.setLineWidth(0.3)
  doc.rect(x, y - sz + 0.5, sz, sz)
}

function tick(doc, x, y) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('X', x + 0.6, y)
}

/** Draw label + underline that ends at endX; optionally fill value in bold */
function field(doc, label, x, y, endX, value) {
  doc.setFont('helvetica', 'normal')
  doc.text(label, x, y)
  const ls = x + doc.getTextWidth(label) + 2
  line(doc, ls, y + 0.5, endX, y + 0.5)
  if (value) {
    doc.setFont('helvetica', 'bold')
    doc.text(String(value), ls + 2, y)
    doc.setFont('helvetica', 'normal')
  }
}

/* ── Signature background removal ────────────────────────────────
 *  Takes a data URL (PNG from signature_pad) and returns a new
 *  data URL with white/light background pixels made transparent.

 *  Only dark signature strokes remain.
 * ─────────────────────────────────────────────────────────────── */
export function removeSignatureBackground(dataUrl) {
  return new Promise((resolve) => {
    if (!dataUrl) { resolve(null); return }
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = imageData.data
      // Threshold: if R+G+B > 600 (near-white), make transparent
      for (let i = 0; i < d.length; i += 4) {
        const brightness = d[i] + d[i + 1] + d[i + 2]
        if (brightness > 600) {
          d[i + 3] = 0 // set alpha to 0
        }
      }
      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => resolve(dataUrl) // fallback to original
    img.src = dataUrl
  })
}

/* ── Constants ───────────────────────────────────────────────────── */
const PW = 210          // A4 width
const M  = 18           // left / right margin
const CW = PW - 2 * M  // content width  = 174
const MID = PW / 2      // centre         = 105

/* ════════════════════════════════════════════════════════════════════
   MAIN  GENERATOR
   ════════════════════════════════════════════════════════════════════ */
export function generateGradeAmendmentPDF(data = {}) {
  const doc = new jsPDF('p', 'mm', 'a4')
  let y = 14

  /*
   * Column constants
   *   Left  col: x = M  (18)  →  LCR (100)   width ≈ 82 mm
   *   Divider:   x = DIVX (102)
   *   Right col: x = RCX (104) →  RE  (192)   width ≈ 88 mm
   */
  const LCR  = 100        // left column right edge
  const DIVX = 101        // vertical divider x
  const RCX  = 103        // right column left edge
  const RE   = PW - M     // right column right edge  (192)

  /* ── TITLE BLOCK ─────────────────────────────────────────────── */
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('HONG KONG BAPTIST UNIVERSITY', MID, y, { align: 'center' })
  y += 5.5
  doc.setFontSize(10.5)
  doc.text('ACADEMIC REGISTRY', MID, y, { align: 'center' })
  y += 5.5

  /* "Grade Amendment Form" — underlined via manual line */
  doc.setFontSize(11)
  const gafW = doc.getTextWidth('Grade Amendment Form')
  const gafX = MID - gafW / 2
  doc.text('Grade Amendment Form', MID, y, { align: 'center' })
  line(doc, gafX, y + 0.8, gafX + gafW, y + 0.8)
  y += 4
  line(doc, M, y, PW - M, y, true)
  y += 6

  /* ── REQUEST FOR GRADE AMENDMENT  +  AY / Term ───────────────── */
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  // underline "REQUEST FOR GRADE AMENDMENT"
  const rga = 'REQUEST FOR GRADE AMENDMENT'
  doc.text(rga, M, y)
  line(doc, M, y + 0.8, M + doc.getTextWidth(rga), y + 0.8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  let cx = 108
  doc.text('AY:  20', cx, y)
  cx += doc.getTextWidth('AY:  20')
  const ay1x = cx
  line(doc, cx, y + 0.5, cx + 7, y + 0.5)
  cx += 7
  doc.text(' - 20', cx, y)
  cx += doc.getTextWidth(' - 20')
  const ay2x = cx
  line(doc, cx, y + 0.5, cx + 7, y + 0.5)
  cx += 7 + 3
  doc.text('Term:', cx, y)
  const tlx = cx + doc.getTextWidth('Term:') + 2
  line(doc, tlx, y + 0.5, PW - M, y + 0.5)

  if (data.academicYear) {
    doc.setFont('helvetica', 'bold')
    const p = data.academicYear.split('-')
    if (p[0]) doc.text(p[0].slice(-2), ay1x + 1, y)
    if (p[1]) doc.text(p[1].slice(-2), ay2x + 1, y)
    doc.setFont('helvetica', 'normal')
  }
  if (data.term) {
    doc.setFont('helvetica', 'bold')
    doc.text(String(data.term), tlx + 2, y)
    doc.setFont('helvetica', 'normal')
  }
  y += 7

  /* ── Student No. / Student Name ──────────────────────────────── */
  doc.setFontSize(9.5)
  field(doc, 'Student No.:', M, y, MID - 2, data.studentNo)
  field(doc, 'Student Name:', MID + 2, y, PW - M, data.studentName)
  y += 7

  /* ── Course Code & Title ─────────────────────────────────────── */
  field(doc, 'Course Code & Title:', M, y, PW - M,
    data.courseCode && data.courseTitle
      ? `${data.courseCode} \u2013 ${data.courseTitle}`
      : data.courseCode || '')
  y += 7

  /* ── Original Grade / New Grade ──────────────────────────────── */
  field(doc, 'Original Grade:', M, y, MID - 2, data.originalGrade)
  field(doc, 'New Grade:', MID + 2, y, PW - M, data.newGrade)
  y += 6

  /* ── Warning note (small print) ──────────────────────────────── */
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  const nx = M + 8
  doc.text('*', M + 1, y)
  checkbox(doc, M + 3, y, 3)
  doc.text(
    'If the grade amendment involves a student who is in his/her final semester of final year, please make sure that the',
    nx, y)
  y += 3.2
  doc.setFont('helvetica', 'bold')
  doc.text('student is well informed', nx, y)
  doc.setFont('helvetica', 'normal')
  doc.text(
    ' that if the grade amendment affects the classification of honours, his/her graduation with the',
    nx + doc.getTextWidth('student is well informed'), y)
  y += 3.2
  doc.text(
    'revised classification of honours will need to be re-submitted to the Senate for approval. As a result, the approval date',
    nx, y)
  y += 3.2
  doc.text(
    'of his/her graduation by the Senate and the award date for his/her diploma will be postponed accordingly.',
    nx, y)
  y += 5

  /* ── Reason for Amendment header ─────────────────────────────── */
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'normal')
  const r1 = 'Reason for Amendment (please \u201c'
  doc.text(r1, M, y)
  let rLx = M + doc.getTextWidth(r1)
  doc.setFont('helvetica', 'bold')
  doc.text('\u2713', rLx, y)
  rLx += doc.getTextWidth('\u2713')
  doc.setFont('helvetica', 'normal')
  doc.text('\u201d as appropriate):', rLx, y)
  y += 5.5

  /* ══════════════════════════════════════════════════════════════════
     TWO-COLUMN SECTION
     Left  col: checkboxes + instructor fields + PD endorsement box
     Right col: appeal + grounds + instructor fields + PD endorsement + Dean box
     Columns grow independently; vertical divider drawn after.
  ══════════════════════════════════════════════════════════════════ */
  const colTop = y
  let yL = colTop   // left col cursor
  let yR = colTop   // right col cursor

  /* ── Left-column positions ──────────────────────────────────── */
  const LX = M        // checkbox x
  const LT = M + 6    // text x (right of checkbox)
  const LE = LCR      // right edge of left col

  /* ── Right-column positions ─────────────────────────────────── */
  const RX = RCX      // checkbox / text x for right col
  const RT = RCX + 5  // text x after right checkbox

  doc.setFontSize(9)

  /* ══ LEFT COLUMN ═══════════════════════════════════════════════ */

  /* 1 ── Conversion of temporary grade */
  checkbox(doc, LX, yL)
  if (data.reasonType === 'conversion') tick(doc, LX, yL)
  doc.setFont('helvetica', 'bold')
  doc.text('Conversion of temporary grade (I, NR, PR, YR)', LT, yL)
  yL += 5.5

  /* 2 ── Make up examination */
  checkbox(doc, LX, yL)
  if (data.reasonType === 'makeup') tick(doc, LX, yL)
  doc.setFont('helvetica', 'bold')
  const muW = doc.getTextWidth('Make up examination')
  doc.text('Make up examination', LT, yL)
  doc.setFont('helvetica', 'normal')
  doc.text(' (Please provide details):', LT + muW, yL)
  yL += 4.5
  // detail lines (×2)
  for (let di = 0; di < 2; di++) {
    line(doc, LT, yL + 1, LE, yL + 1)
    if (data.reasonType === 'makeup' && data.reasonDetails) {
      const chunks = doc.splitTextToSize(data.reasonDetails, LE - LT - 2)
      doc.setFontSize(8)
      if (chunks[di]) doc.text(chunks[di], LT + 1, yL)
      doc.setFontSize(9)
    }
    yL += 4.5
  }
  yL += 1

  /* 3 ── Supplementary examination */
  checkbox(doc, LX, yL)
  if (data.reasonType === 'supplementary') tick(doc, LX, yL)
  doc.setFont('helvetica', 'bold')
  const seW = doc.getTextWidth('Supplementary examination')
  doc.text('Supplementary examination', LT, yL)
  doc.setFont('helvetica', 'normal')
  doc.text(' (Please provide details):', LT + seW, yL)
  yL += 4.5
  for (let di = 0; di < 2; di++) {
    line(doc, LT, yL + 1, LE, yL + 1)
    if (data.reasonType === 'supplementary' && data.reasonDetails) {
      const chunks = doc.splitTextToSize(data.reasonDetails, LE - LT - 2)
      doc.setFontSize(8)
      if (chunks[di]) doc.text(chunks[di], LT + 1, yL)
      doc.setFontSize(9)
    }
    yL += 4.5
  }
  yL += 1

  /* 4 ── Review initiated by academic staff */
  checkbox(doc, LX, yL)
  if (data.reasonType === 'review') tick(doc, LX, yL)
  doc.setFont('helvetica', 'bold')
  doc.text('Review initiated by academic staff', LT, yL)
  doc.setFont('helvetica', 'normal')
  doc.text(' * (Please provide', LT + doc.getTextWidth('Review initiated by academic staff'), yL)
  yL += 4
  doc.text('details):', LT, yL)
  yL += 4.5
  for (let di = 0; di < 2; di++) {
    line(doc, LT, yL + 1, LE, yL + 1)
    if (data.reasonType === 'review' && data.reasonDetails) {
      const chunks = doc.splitTextToSize(data.reasonDetails, LE - LT - 2)
      doc.setFontSize(8)
      if (chunks[di]) doc.text(chunks[di], LT + 1, yL)
      doc.setFontSize(9)
    }
    yL += 4.5
  }
  yL += 1

  /* 5 ── Others */
  checkbox(doc, LX, yL)
  if (data.reasonType === 'others') tick(doc, LX, yL)
  doc.setFont('helvetica', 'bold')
  doc.text('Others', LT, yL)
  doc.setFont('helvetica', 'normal')
  doc.text(' (please specify):', LT + doc.getTextWidth('Others'), yL)
  yL += 4.5
  for (let di = 0; di < 2; di++) {
    line(doc, LT, yL + 1, LE, yL + 1)
    if (data.reasonType === 'others' && data.reasonDetails) {
      const chunks = doc.splitTextToSize(data.reasonDetails, LE - LT - 2)
      doc.setFontSize(8)
      if (chunks[di]) doc.text(chunks[di], LT + 1, yL)
      doc.setFontSize(9)
    }
    yL += 4.5
  }
  yL += 3

  /* ── Left-column instructor fields ────────────────────────────── */
  doc.setFontSize(9)
  const isAppeal = data.reasonType === 'appeal'

  // Course-Instructor's Name
  doc.setFont('helvetica', 'normal')
  doc.text("Course-Instructor\u2019s Name:", LX, yL)
  const ciLX = LX + doc.getTextWidth("Course-Instructor\u2019s Name:") + 2
  line(doc, ciLX, yL + 0.5, LE, yL + 0.5)
  if (!isAppeal && data.instructorName) {
    doc.setFont('helvetica', 'bold')
    doc.text(data.instructorName, ciLX + 1, yL)
    doc.setFont('helvetica', 'normal')
  }
  yL += 6

  // Department
  doc.text('Department:', LX, yL)
  const dpLX = LX + doc.getTextWidth('Department:') + 2
  line(doc, dpLX, yL + 0.5, LE, yL + 0.5)
  if (!isAppeal && data.department) {
    doc.setFont('helvetica', 'bold')
    doc.text(data.department, dpLX + 1, yL)
    doc.setFont('helvetica', 'normal')
  }
  yL += 6

  // Signature (always blank — physical signature)
  doc.text('Signature:', LX, yL)
  line(doc, LX + doc.getTextWidth('Signature:') + 2, yL + 0.5, LE, yL + 0.5)
  yL += 6

  // Date
  doc.text('Date:', LX, yL)
  const dtLX = LX + doc.getTextWidth('Date:') + 2
  line(doc, dtLX, yL + 0.5, LE, yL + 0.5)
  if (!isAppeal && data.instructorDate) {
    doc.setFont('helvetica', 'bold')
    doc.text(data.instructorDate, dtLX + 1, yL)
    doc.setFont('helvetica', 'normal')
  }
  yL += 6

  /* ══ RIGHT COLUMN ══════════════════════════════════════════════ */

  /* 1 ── Appeal by student */
  checkbox(doc, RX, yR)
  if (isAppeal) tick(doc, RX, yR)
  doc.setFont('helvetica', 'bold')
  doc.text('Appeal by student*', RT, yR)
  yR += 6

  /* 2 ── Grounds for Appeal label */
  doc.setFont('helvetica', 'normal')
  doc.text('Grounds for Appeal:', RX, yR)
  yR += 4.5

  /* 3 ── Technical errors / Procedural faults checkboxes */
  checkbox(doc, RX + 2, yR)
  doc.text('Technical errors', RX + 8, yR)
  const pfX = RX + 45
  checkbox(doc, pfX, yR)
  doc.text('Procedural faults', pfX + 6, yR)
  if (data.appealGrounds === 'Technical errors') tick(doc, RX + 2, yR)
  if (data.appealGrounds === 'Procedural faults') tick(doc, pfX, yR)
  yR += 6

  /* 4 ── Please provide details below */
  doc.text('Please provide details below:', RX, yR)
  yR += 4.5
  for (let di = 0; di < 2; di++) {
    line(doc, RX, yR + 1, RE, yR + 1)
    if (isAppeal && data.appealDetails) {
      const al = doc.splitTextToSize(data.appealDetails, RE - RX - 2)
      doc.setFontSize(8)
      if (al[di]) doc.text(al[di], RX + 1, yR)
      doc.setFontSize(9)
    }
    yR += 4.5
  }
  yR += 3

  /* ── Right-column instructor fields ───────────────────────────── */
  // Course-Instructor's Name
  doc.setFont('helvetica', 'normal')
  doc.text("Course-Instructor\u2019s Name:", RX, yR)
  const ciRX = RX + doc.getTextWidth("Course-Instructor\u2019s Name:") + 2
  line(doc, ciRX, yR + 0.5, RE, yR + 0.5)
  if (isAppeal && data.instructorName) {
    doc.setFont('helvetica', 'bold')
    doc.text(data.instructorName, ciRX + 1, yR)
    doc.setFont('helvetica', 'normal')
  }
  yR += 6

  // Department
  doc.text('Department:', RX, yR)
  const dpRX = RX + doc.getTextWidth('Department:') + 2
  line(doc, dpRX, yR + 0.5, RE, yR + 0.5)
  if (isAppeal && data.department) {
    doc.setFont('helvetica', 'bold')
    doc.text(data.department, dpRX + 1, yR)
    doc.setFont('helvetica', 'normal')
  }
  yR += 6

  // Signature
  doc.text('Signature:', RX, yR)
  line(doc, RX + doc.getTextWidth('Signature:') + 2, yR + 0.5, RE, yR + 0.5)
  yR += 6

  // Date
  doc.text('Date:', RX, yR)
  const dtRX = RX + doc.getTextWidth('Date:') + 2
  line(doc, dtRX, yR + 0.5, RE, yR + 0.5)
  if (isAppeal && data.instructorDate) {
    doc.setFont('helvetica', 'bold')
    doc.text(data.instructorDate, dtRX + 1, yR)
    doc.setFont('helvetica', 'normal')
  }
  yR += 6

  /* ── Sync both columns to the same baseline ──────────────────── */
  const syncY = Math.max(yL, yR) + 2

  /* ── Vertical divider for the two-column section ─────────────── */
  line(doc, DIVX, colTop - 1, DIVX, syncY, false)

  /* ══ ENDORSEMENT BOXES ═══════════════════════════════════════ */
  const bwL = LCR - M          // left box width  (≈ 82 mm)
  const bwR = RE  - RCX        // right box width (≈ 89 mm)
  const bh  = 42               // box height

  /* helper: draw one PD endorsement box */
  function drawEndBox(bx, by, bw, name, sig, date) {
    box(doc, bx, by, bw, bh)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text("Programme Director / Department Head\u2019s", bx + bw / 2, by + 5.5, { align: 'center' })
    doc.text('Endorsement', bx + bw / 2, by + 10, { align: 'center' })

    // Name typed above the Name & Signature line
    if (name) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(name, bx + bw / 2, by + 18, { align: 'center' })
    }

    // Signature image centred on the Name & Signature line
    if (sig) {
      try {
        const sw = 34, sh = 11
        doc.addImage(sig, 'PNG', bx + bw / 2 - sw / 2, by + 14, sw, sh)
      } catch { /* ignore */ }
    }

    // Name & Signature line + label
    line(doc, bx + 4, by + 22, bx + bw - 4, by + 22)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('Name & Signature', bx + bw / 2, by + 26, { align: 'center' })

    // Date typed above the Date line
    if (date) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(date, bx + bw / 2, by + 32, { align: 'center' })
    }

    // Date line + label
    line(doc, bx + 4, by + 34, bx + bw - 4, by + 34)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('Date', bx + bw / 2, by + 38, { align: 'center' })

    // Remarks
    doc.text('Remarks:', bx + 3, by + 41.5)
    line(doc, bx + 3 + doc.getTextWidth('Remarks:') + 2, by + 42, bx + bw - 3, by + 42)
  }

  /* Left PD box — carries the signature when non-appeal reason */
  drawEndBox(
    M, syncY, bwL,
    !isAppeal ? (data.endorserName || '') : '',
    !isAppeal ? (data.endorsementSignature || null) : null,
    !isAppeal ? (data.endorsementDate || '') : ''
  )

  /* Right PD box — carries the signature when appeal reason */
  drawEndBox(
    RCX, syncY, bwR,
    isAppeal ? (data.endorserName || '') : '',
    isAppeal ? (data.endorsementSignature || null) : null,
    isAppeal ? (data.endorsementDate || '') : ''
  )

  /* Extend divider through the endorsement boxes */
  line(doc, DIVX, syncY, DIVX, syncY + bh, false)

  const afterBoxes = syncY + bh + 4

  /* ── Faculty / School Dean's Approval (right col, below PD box) */
  const dh  = 34
  box(doc, RCX, afterBoxes, bwR, dh)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text("Faculty/School Dean\u2019s Approval", RCX + bwR / 2, afterBoxes + 5.5, { align: 'center' })
  doc.setFontSize(8)
  doc.text('(Required for Appeal by Student)', RCX + bwR / 2, afterBoxes + 9.5, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  line(doc, RCX + 4, afterBoxes + 18, RCX + bwR - 4, afterBoxes + 18)
  doc.text('Name & Signature', RCX + bwR / 2, afterBoxes + 22, { align: 'center' })
  line(doc, RCX + 4, afterBoxes + 28, RCX + bwR - 4, afterBoxes + 28)
  doc.text('Date', RCX + bwR / 2, afterBoxes + 32, { align: 'center' })

  /* ═══════════════  PAGE 2  ═══════════════════════════════════════ */
  doc.addPage()
  y = 16
  line(doc, M, y, PW - M, y, true)
  y += 5

  /* ── Assistant Academic Registrar's Approval ─────────────────── */
  box(doc, M, y, CW, 30)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const aarLabel = "Assistant Academic Registrar\u2019s Approval"
  doc.text(aarLabel, M + 4, y + 5.5)
  line(doc, M + 4, y + 6.2, M + 4 + doc.getTextWidth(aarLabel), y + 6.2)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  checkbox(doc, M + 6, y + 12)
  doc.text('Approved', M + 12, y + 12)
  checkbox(doc, M + 40, y + 12)
  doc.text('Not Approved', M + 46, y + 12)
  field(doc, 'Signature:', M + 4, y + 19, M + CW / 2)
  field(doc, 'Date:', M + CW / 2 + 8, y + 19, M + CW - 4)
  doc.text('Remarks:', M + 4, y + 25)
  line(doc, M + 4 + doc.getTextWidth('Remarks:') + 2, y + 25.5, M + CW - 4, y + 25.5)
  line(doc, M + 4 + doc.getTextWidth('Remarks:') + 2, y + 29, M + CW - 4, y + 29)
  y += 36

  /* ── For Use of the Academic Registry ────────────────────────── */
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const forUseLabel = 'For Use of the Academic Registry'
  doc.text(forUseLabel, M + 4, y)
  line(doc, M + 4, y + 0.8, M + 4 + doc.getTextWidth(forUseLabel), y + 0.8)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  y += 7
  field(doc, 'Grade Entry by:', M + 4, y, M + CW / 2)
  field(doc, 'Checked by:', M + CW / 2 + 8, y, M + CW - 4)
  y += 6
  field(doc, 'Date:', M + 4, y, M + CW / 2)
  field(doc, 'Date:', M + CW / 2 + 8, y, M + CW - 4)
  y += 10

  /* ── Privacy Policy ──────────────────────────────────────────── */
  line(doc, M, y, PW - M, y)
  y += 4
  doc.setFontSize(7.5)
  doc.text(
    'Privacy Policy Statement and Personal Information Collection Statement of the University is available at:',
    M, y)
  y += 3.5
  doc.setTextColor(0, 0, 200)
  doc.text('https://bupdpo.hkbu.edu.hk/policies-and-procedures/pps-pics/', M, y)
  doc.setTextColor(0, 0, 0)
  y += 7
  doc.setFont('helvetica', 'italic')
  doc.text('Last modified: Dec 2025', M, y)

  return doc
}

/**
 * Download a filled-in Grade Amendment Form
 * Generates a 2-page PDF using jsPDF matching the official HKBU form layout
 */

export async function downloadFilledForm(amendment) {
  const auth = useAuthStore()

  // Process signature to remove white background
  const rawSig = auth.user?.signature || null
  const cleanSig = rawSig ? await removeSignatureBackground(rawSig) : null

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
    instructorSignature: cleanSig,
    instructorDate: amendment.submitted_at
      ? new Date(amendment.submitted_at).toLocaleDateString()
      : new Date().toLocaleDateString(),
    department: amendment.department || '',
    // Endorsement box (Programme Director)
    endorsementSignature: cleanSig,
    endorserName: auth.user?.name || '',
    endorsementDate: new Date().toLocaleDateString(),
    // Final year student warning checkbox (Page 1)
    finalYearStudent: amendment.final_year_student || false,
    // Page 2 — AAR Approval section (filled by Academic Registry)
    approved: amendment.approved === true ? true : undefined,
    notApproved: amendment.approved === false ? true : undefined,
    registrarSignature: amendment.registrar_signature || null,
    registrarDate: amendment.registrar_date || '',
    registrarRemarks: amendment.registrar_remarks || ''
  }

  try {
    // Try template-based PDF first
    const pdfDoc = await generateGradeAmendmentPDFWithTemplate(data)
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Grade Amendments - ${amendment.student_id || amendment.student_no || 'Form'}.pdf`
    link.click()
    URL.revokeObjectURL(link.href)
  } catch (e) {
    console.warn('Template-based export failed, falling back to generated PDF:', e.message)
    // Fallback to original generated PDF
    const doc = generateGradeAmendmentPDF(data)
    doc.save(`Grade Amendments - ${amendment.student_id || amendment.student_no || 'Form'}.pdf`)
  }
}

/**
 * Generate Grade Amendment PDF using the template PDF as base
 * Fills in data at exact coordinates provided
 */
export async function generateGradeAmendmentPDFWithTemplate(data = {}) {
  const { rgb } = await import('pdf-lib')
  
  // Load the template PDF
  const templateBytes = await fetch('/form.pdf').then(res => res.arrayBuffer())
  const pdfDoc = await PDFDocument.load(templateBytes)

  try {
    const pages = pdfDoc.getPages()
    const page1 = pages[0]

    // Helper to draw text at exact coordinates
    const drawField = (text, x, y, size = 10) => {
      if (text === null || text === undefined || text === '') return
      try {
        page1.drawText(String(text), {
          x,
          y,
          size,
          color: rgb(0, 0, 0),
        })
      } catch (e) {
        console.warn(`Failed to draw text at ${x}, ${y}:`, e.message)
      }
    }

    // Helper to draw checkmark/tick at checkbox
    const drawTick = (x, y) => {
      try {
        page1.drawText('V', {
          x,
          y,
          size: 11,
          color: rgb(0, 0, 0),
        })
      } catch (e) {
        console.warn(`Failed to draw tick at ${x}, ${y}:`, e.message)
      }
    }

    // Helper to add signature image
    const addSignature = async (signatureDataUrl, x, y, width = 45, height = 18) => {
      if (!signatureDataUrl) return
      try {
        const signatureImage = await pdfDoc.embedPng(signatureDataUrl)
        page1.drawImage(signatureImage, {
          x,
          y,
          width,
          height,
        })
      } catch (e) {
        console.warn(`Failed to add signature at ${x}, ${y}:`, e.message)
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // STUDENT INFORMATION (appears on both sides)
    // ═══════════════════════════════════════════════════════════════
    drawField(data.studentNo, 128, 705, 10)
    drawField(data.studentName, 423, 704, 10)
    if (data.courseCode || data.courseTitle) {
      const courseText = data.courseCode && data.courseTitle 
        ? `${data.courseCode} - ${data.courseTitle}`
        : data.courseCode || ''
      const truncated = courseText.length > 50 ? courseText.substring(0, 47) + '...' : courseText
      drawField(truncated, 196, 686, 9)
    }
    drawField(data.originalGrade, 178, 667, 10)
    drawField(data.newGrade, 415, 667, 10)

    // ═══════════════════════════════════════════════════════════════
    // ACADEMIC YEAR & TERM (Page 1)
    // ═══════════════════════════════════════════════════════════════
    if (data.academicYear) {
      const p = data.academicYear.split('-')
      if (p[0]) drawField(p[0].slice(-2), 338, 722, 10)
      if (p[1]) drawField(p[1].slice(-2), 382, 722, 10)
    }
    if (data.term) drawField(String(data.term), 484, 722, 10)

    // ═══════════════════════════════════════════════════════════════
    // FINAL YEAR STUDENT CHECKBOX (Page 1) — "*If the grade..."
    // ═══════════════════════════════════════════════════════════════
    if (data.finalYearStudent) drawTick(46, 650)

    // ═══════════════════════════════════════════════════════════════
    // LEFT SIDE - NON-APPEAL REASONS
    // ═══════════════════════════════════════════════════════════════
    if (data.reasonType !== 'appeal') {
      // Reason checkboxes
      if (data.reasonType === 'conversion') {
        drawTick(29, 539)
      } else if (data.reasonType === 'makeup') {
        drawTick(29, 522)
        drawField(data.reasonDetails, 35, 510, 9)
      } else if (data.reasonType === 'supplementary') {
        drawTick(29, 468)
        drawField(data.reasonDetails, 35, 453, 9)
      } else if (data.reasonType === 'review') {
        drawTick(29, 412)
        drawField(data.reasonDetails, 35, 382, 9)
      } else if (data.reasonType === 'others') {
        drawTick(29, 344)
        drawField(data.reasonDetails, 35, 330, 9)
      }

      // Course Instructor Section (left side)
      drawField(data.instructorName, 150, 291, 10)
      drawField(data.department, 116, 275, 10)
      // Signature @ 109,256
      await addSignature(data.instructorSignature, 109, 256, 45, 18)
      drawField(data.instructorDate, 111, 239, 10)

      // Programme Director Section (left side)
      drawField(data.endorserName, 75, 184, 10)
      // Signature @ 180, 183
      await addSignature(data.endorsementSignature, 180, 183, 45, 18)
      drawField(data.endorsementDate, 110, 148, 10)
    }

    // ═══════════════════════════════════════════════════════════════
    // RIGHT SIDE - APPEAL BY STUDENT
    // ═══════════════════════════════════════════════════════════════
    if (data.reasonType === 'appeal') {
      // Appeal checkbox
      drawTick(305, 539)

      // Appeal grounds checkboxes
      if (data.appealGrounds === 'Technical errors') {
        drawTick(305, 504)
      } else if (data.appealGrounds === 'Procedural faults') {
        drawTick(380, 505)
      }

      // Appeal details
      drawField(data.appealDetails, 306, 472, 9)

      // Course Instructor Section (right side)
      drawField(data.instructorName, 441, 420, 10)
      drawField(data.department, 389, 401, 10)
      // Signature @ 376,369
      await addSignature(data.instructorSignature, 376, 369, 45, 18)
      drawField(data.instructorDate, 375, 344, 10)

      // Programme Director Section (right side)
      drawField(data.endorserName, 320, 292, 10)
      // Signature @ 477, 292
      await addSignature(data.endorsementSignature, 477, 292, 45, 18)
      drawField(data.endorsementDate, 356, 254, 10)
    }

    // ═══════════════════════════════════════════════════════════════
    // PAGE 2 — ASSISTANT ACADEMIC REGISTRAR'S APPROVAL
    // ═══════════════════════════════════════════════════════════════
    if (pages.length > 1) {
      const page2 = pages[1]

      const drawField2 = (text, x, y, size = 10) => {
        if (text === null || text === undefined || text === '') return
        try {
          page2.drawText(String(text), { x, y, size, color: rgb(0, 0, 0) })
        } catch (e) {
          console.warn(`Page2: Failed to draw text at ${x}, ${y}:`, e.message)
        }
      }

      const drawTick2 = (x, y) => {
        try {
          page2.drawText('V', { x, y, size: 11, color: rgb(0, 0, 0) })
        } catch (e) {
          console.warn(`Page2: Failed to draw tick at ${x}, ${y}:`, e.message)
        }
      }

      const addSignature2 = async (signatureDataUrl, x, y, width = 45, height = 18) => {
        if (!signatureDataUrl) return
        try {
          const signatureImage = await pdfDoc.embedPng(signatureDataUrl)
          page2.drawImage(signatureImage, { x, y, width, height })
        } catch (e) {
          console.warn(`Page2: Failed to add signature at ${x}, ${y}:`, e.message)
        }
      }

      // *Approved checkbox
      if (data.approved === true) drawTick2(35, 748)

      // *Not Approved checkbox
      if (data.notApproved === true) drawTick2(115, 748)

      // Signature
      if (data.registrarSignature) {
        await addSignature2(data.registrarSignature, 100, 710, 45, 18)
      }

      // Date
      if (data.registrarDate) drawField2(data.registrarDate, 340, 728, 10)

      // Remarks
      if (data.registrarRemarks) drawField2(data.registrarRemarks, 98, 712, 9)
    }

    return pdfDoc
  } catch (e) {
    console.error('Error filling template PDF:', e)
    throw e
  }
}
