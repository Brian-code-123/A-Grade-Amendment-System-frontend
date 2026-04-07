import { describe, expect, it, vi, beforeEach } from 'vitest'
import { downloadTemplate, removeSignatureBackground, generateGradeAmendmentPDF } from '@/services/pdfTemplate'

describe('pdfTemplate service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('downloadTemplate downloads blob when fetch succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer }))

    const clickMock = vi.fn()
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: clickMock,
        }
      }
      return document.createElement(tag)
    })

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
    })

    await downloadTemplate()
    expect(clickMock).toHaveBeenCalled()
    createElementSpy.mockRestore()
  })

  it('downloadTemplate shows alert when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))
    const alertMock = vi.fn()
    vi.stubGlobal('alert', alertMock)

    await downloadTemplate()
    expect(alertMock).toHaveBeenCalled()
  })

  it('removeSignatureBackground returns null for empty input', async () => {
    const result = await removeSignatureBackground('')
    expect(result).toBeNull()
  })

  it('generateGradeAmendmentPDF creates a PDF document', () => {
    const doc = generateGradeAmendmentPDF({
      academicYear: '2025-2026',
      term: '1',
      studentNo: 'S12345',
      studentName: 'Unit Test',
      courseCode: 'COMP1000',
      courseTitle: 'Testing 101',
      originalGrade: 'B',
      newGrade: 'A',
      reasonType: 'conversion',
      instructorName: 'Teacher Demo',
      department: 'COMP',
    })

    const bytes = doc.output('arraybuffer')
    expect(bytes.byteLength).toBeGreaterThan(100)
  })
})
