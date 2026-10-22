import { describe, it, expect } from 'vitest'
import { wrapText } from '../wrapText'

const measure = (s) => s.length // one unit per character

describe('wrapText', () => {
  it('keeps short text on one line', () => {
    expect(wrapText('make up exam', 20, measure, 3)).toEqual(['make up exam'])
  })

  it('wraps on spaces so no line exceeds the width', () => {
    const lines = wrapText('student sat the make up examination and passed', 16, measure, 5)
    expect(lines).toEqual(['student sat the', 'make up', 'examination and', 'passed'])
    lines.forEach((l) => expect(measure(l)).toBeLessThanOrEqual(16))
  })

  it('splits a single word that is longer than the width', () => {
    expect(wrapText('abcdefghij', 4, measure, 5)).toEqual(['abcd', 'efgh', 'ij'])
  })

  it('stops at maxLines and marks the cut with an ellipsis', () => {
    const lines = wrapText('one two three four five six seven eight', 9, measure, 2)
    expect(lines).toHaveLength(2)
    expect(lines[1].endsWith('...')).toBe(true)
    lines.forEach((l) => expect(measure(l)).toBeLessThanOrEqual(9))
  })

  it('does not cut anything when maxLines is Infinity', () => {
    const lines = wrapText('one two three four five six seven eight', 9, measure, Infinity)
    expect(lines.join(' ')).toBe('one two three four five six seven eight')
  })

  it('returns no lines for empty input', () => {
    expect(wrapText('', 10, measure, 3)).toEqual([])
    expect(wrapText(null, 10, measure, 3)).toEqual([])
  })
})
