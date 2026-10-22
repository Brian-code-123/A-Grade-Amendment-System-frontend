import { describe, it, expect } from 'vitest'
import { buildPdfData } from '../amendmentPdfData'

const PNG = 'data:image/png;base64,AAAA'

describe('buildPdfData', () => {
  it('takes submitter and endorser from the stored amendment, not the exporting user', () => {
    const data = buildPdfData({
      student_no: '22240801',
      instructor_name: 'Dr Teacher Chan',
      instructor_signature: PNG,
      approver_name: 'Prof Head Lee',
      approver_signature: PNG + 'B',
      approved_at: '2026-10-22T14:11:28.336Z'
    })
    expect(data.instructorName).toBe('Dr Teacher Chan')
    expect(data.endorserName).toBe('Prof Head Lee')
    expect(data.endorsementSignature).toBe(PNG + 'B')
    expect(data.endorsementDate).not.toBe('')
  })

  it('leaves the endorsement blank while nobody has endorsed yet', () => {
    const data = buildPdfData({ student_no: '1', instructor_name: 'Dr T' })
    expect(data.endorserName).toBe('')
    expect(data.endorsementSignature).toBeNull()
    expect(data.endorsementDate).toBe('')
  })
})

describe('buildPdfData instructor date', () => {
  it('uses the submission date, then the filing date, so the Date line is never blank', () => {
    const filed = '2026-10-20T10:00:00Z'
    expect(buildPdfData({ created_at: filed }).instructorDate).not.toBe('')
    const sub = { submitted_at: '2026-10-21T09:00:00Z' }
    expect(buildPdfData({ created_at: filed }, sub).instructorDate)
      .toBe(new Date(sub.submitted_at).toLocaleDateString())
  })
})
