import { describe, expect, it } from 'vitest'
import {
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
} from '@/utils/pdf-coordinates-lookup'

describe('pdf-coordinates-lookup', () => {
  it('exports PDF_PAGES constant with page dimensions', () => {
    expect(PDF_PAGES.PAGE_1).toBeDefined()
    expect(PDF_PAGES.PAGE_1.width).toBe(1581.03)
    expect(PDF_PAGES.PAGE_1.height).toBe(2225.22)
    expect(PDF_PAGES.PAGE_2).toBeDefined()
    expect(PDF_PAGES.PAGE_2.width).toBe(1667.85)
    expect(PDF_PAGES.PAGE_2.height).toBe(2353.83)
  })

  it('provides STUDENT_INFO coordinates', () => {
    expect(STUDENT_INFO.studentNo).toBeDefined()
    expect(STUDENT_INFO.studentNo.x).toBe(340)
    expect(STUDENT_INFO.studentNo.y).toBe(1876)
    expect(STUDENT_INFO.studentName).toBeDefined()
    expect(STUDENT_INFO.studentName.x).toBe(980)
    expect(STUDENT_INFO.originalGrade).toBeDefined()
    expect(STUDENT_INFO.newGrade).toBeDefined()
  })

  it('provides ACADEMIC_YEAR_TERM coordinates', () => {
    expect(ACADEMIC_YEAR_TERM.academicYearYear1).toBeDefined()
    expect(ACADEMIC_YEAR_TERM.academicYearYear1.x).toBe(912)
    expect(ACADEMIC_YEAR_TERM.academicYearYear1.y).toBe(1930)
    expect(ACADEMIC_YEAR_TERM.academicYearYear2).toBeDefined()
    expect(ACADEMIC_YEAR_TERM.term).toBeDefined()
  })

  it('provides CHECKBOXES_GENERAL coordinates', () => {
    expect(CHECKBOXES_GENERAL.finalYearStudent).toBeDefined()
    expect(CHECKBOXES_GENERAL.finalYearStudent.x).toBe(105)
    expect(CHECKBOXES_GENERAL.finalYearStudent.y).toBe(1650)
  })

  it('provides REASON_TYPES checkboxes', () => {
    expect(REASON_TYPES.conversion).toBeDefined()
    expect(REASON_TYPES.conversion.checkbox.x).toBe(155)
    expect(REASON_TYPES.conversion.checkbox.y).toBe(1496)
    expect(REASON_TYPES.makeup).toBeDefined()
    expect(REASON_TYPES.makeup.checkbox.x).toBe(159)
    expect(REASON_TYPES.supplementary).toBeDefined()
    expect(REASON_TYPES.supplementary.checkbox.x).toBe(157)
    expect(REASON_TYPES.review).toBeDefined()
    expect(REASON_TYPES.review.checkbox.x).toBe(148)
    expect(REASON_TYPES.others).toBeDefined()
    expect(REASON_TYPES.others.checkbox.x).toBe(142)
  })

  it('provides APPEAL_FIELDS coordinates', () => {
    expect(APPEAL_FIELDS.appealCheckbox).toBeDefined()
    expect(APPEAL_FIELDS.appealCheckbox.x).toBe(820)
    expect(APPEAL_FIELDS.appealCheckbox.y).toBe(1499)
    expect(APPEAL_FIELDS.technicalErrors).toBeDefined()
    expect(APPEAL_FIELDS.technicalErrors.x).toBe(874)
    expect(APPEAL_FIELDS.proceduralFaults).toBeDefined()
    expect(APPEAL_FIELDS.proceduralFaults.x).toBe(1182)
  })

  it('provides INSTRUCTOR_LEFT coordinates', () => {
    expect(INSTRUCTOR_LEFT.name).toBeDefined()
    expect(INSTRUCTOR_LEFT.name.x).toBe(435)
    expect(INSTRUCTOR_LEFT.name.y).toBe(932)
    expect(INSTRUCTOR_LEFT.department).toBeDefined()
    expect(INSTRUCTOR_LEFT.department.x).toBe(310)
    expect(INSTRUCTOR_LEFT.signature).toBeDefined()
    expect(INSTRUCTOR_LEFT.date).toBeDefined()
  })

  it('provides DIRECTOR_ENDORSEMENT_LEFT coordinates', () => {
    expect(DIRECTOR_ENDORSEMENT_LEFT.name).toBeDefined()
    expect(DIRECTOR_ENDORSEMENT_LEFT.name.x).toBe(225)
    expect(DIRECTOR_ENDORSEMENT_LEFT.name.y).toBe(553)
    expect(DIRECTOR_ENDORSEMENT_LEFT.signature).toBeDefined()
    expect(DIRECTOR_ENDORSEMENT_LEFT.date).toBeDefined()
  })

  it('provides INSTRUCTOR_RIGHT coordinates', () => {
    expect(INSTRUCTOR_RIGHT.name).toBeDefined()
    expect(INSTRUCTOR_RIGHT.name.x).toBe(1100)
    expect(INSTRUCTOR_RIGHT.name.y).toBe(1196)
    expect(INSTRUCTOR_RIGHT.department).toBeDefined()
    expect(INSTRUCTOR_RIGHT.department.x).toBe(975)
  })

  it('provides DIRECTOR_ENDORSEMENT_RIGHT coordinates', () => {
    expect(DIRECTOR_ENDORSEMENT_RIGHT.name).toBeDefined()
    expect(DIRECTOR_ENDORSEMENT_RIGHT.name.x).toBe(900)
    expect(DIRECTOR_ENDORSEMENT_RIGHT.name.y).toBe(836)
  })

  it('getFieldCoord returns correct coordinates for known fields', () => {
    expect(getFieldCoord('studentNo')).toEqual(STUDENT_INFO.studentNo)
    expect(getFieldCoord('studentName')).toEqual(STUDENT_INFO.studentName)
    expect(getFieldCoord('originalGrade')).toEqual(STUDENT_INFO.originalGrade)
    expect(getFieldCoord('newGrade')).toEqual(STUDENT_INFO.newGrade)
  })

  it('getFieldCoord returns correct coordinates for academic year fields', () => {
    expect(getFieldCoord('academicYearYear1')).toEqual(ACADEMIC_YEAR_TERM.academicYearYear1)
    expect(getFieldCoord('academicYearYear2')).toEqual(ACADEMIC_YEAR_TERM.academicYearYear2)
    expect(getFieldCoord('term')).toEqual(ACADEMIC_YEAR_TERM.term)
  })

  it('getFieldCoord returns correct coordinates for checkbox fields', () => {
    expect(getFieldCoord('finalYearStudent')).toEqual(CHECKBOXES_GENERAL.finalYearStudent)
    expect(getFieldCoord('conversionCheckbox')).toEqual(REASON_TYPES.conversion.checkbox)
    expect(getFieldCoord('appealCheckbox')).toEqual(APPEAL_FIELDS.appealCheckbox)
  })

  it('getFieldCoord returns correct coordinates for reason type fields', () => {
    expect(getFieldCoord('makeupCheckbox')).toEqual(REASON_TYPES.makeup.checkbox)
    expect(getFieldCoord('makeupDetails')).toEqual(REASON_TYPES.makeup.details)
    expect(getFieldCoord('supplementaryCheckbox')).toEqual(REASON_TYPES.supplementary.checkbox)
  })

  it('getFieldCoord returns correct coordinates for instructor fields', () => {
    expect(getFieldCoord('instructorNameLeft')).toEqual(INSTRUCTOR_LEFT.name)
    expect(getFieldCoord('departmentLeft')).toEqual(INSTRUCTOR_LEFT.department)
    expect(getFieldCoord('instructorNameRight')).toEqual(INSTRUCTOR_RIGHT.name)
  })

  it('getFieldCoord returns correct coordinates for director fields', () => {
    expect(getFieldCoord('directorNameLeft')).toEqual(DIRECTOR_ENDORSEMENT_LEFT.name)
    expect(getFieldCoord('directorSignatureLeft')).toEqual(DIRECTOR_ENDORSEMENT_LEFT.signature)
    expect(getFieldCoord('directorNameRight')).toEqual(DIRECTOR_ENDORSEMENT_RIGHT.name)
  })

  it('getFieldCoord returns null for unknown fields', () => {
    expect(getFieldCoord('unknownField')).toBeNull()
    expect(getFieldCoord('invalidCoordinate')).toBeNull()
  })

  it('all coordinates have required properties', () => {
    const allCoordObjs = [
      STUDENT_INFO.studentNo,
      STUDENT_INFO.studentName,
      ACADEMIC_YEAR_TERM.academicYearYear1,
      CHECKBOXES_GENERAL.finalYearStudent,
      REASON_TYPES.conversion.checkbox,
      APPEAL_FIELDS.appealCheckbox,
      INSTRUCTOR_LEFT.name,
    ]

    allCoordObjs.forEach((coord) => {
      expect(coord.x).toBeDefined()
      expect(coord.y).toBeDefined()
      expect(typeof coord.x).toBe('number')
      expect(typeof coord.y).toBe('number')
    })
  })

  it('all coordinate values are within page bounds', () => {
    expect(STUDENT_INFO.studentNo.x).toBeGreaterThanOrEqual(0)
    expect(STUDENT_INFO.studentNo.x).toBeLessThanOrEqual(PDF_PAGES.PAGE_1.width)
    expect(STUDENT_INFO.studentNo.y).toBeGreaterThanOrEqual(0)
    expect(STUDENT_INFO.studentNo.y).toBeLessThanOrEqual(PDF_PAGES.PAGE_1.height)
  })
})
