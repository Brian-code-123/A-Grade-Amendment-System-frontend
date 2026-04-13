import { describe, expect, it } from 'vitest'
import { normalizeAnnotation, materializeAnnotation } from '@/utils/pdfAnnotationCoordinates'

describe('pdf annotation coordinate transforms', () => {
  it('keeps annotation position stable after zoom in/out', () => {
    const baseCanvas = { width: 1000, height: 1400 }
    const zoomedCanvas = { width: 1500, height: 2100 }

    const source = {
      type: 'path',
      color: '#000000',
      opacity: 1,
      width: 4,
      points: [
        { x: 200, y: 420 },
        { x: 500, y: 700 }
      ]
    }

    const normalized = normalizeAnnotation(source, baseCanvas)
    const rendered = materializeAnnotation(normalized, zoomedCanvas)

    expect(normalized.coordinateSpace).toBe('normalized')
    expect(rendered.points[0].x).toBeCloseTo(300)
    expect(rendered.points[0].y).toBeCloseTo(630)
    expect(rendered.points[1].x).toBeCloseTo(750)
    expect(rendered.points[1].y).toBeCloseTo(1050)
    expect(rendered.width).toBeCloseTo(6)
  })

  it('remains accurate across repeated zoom conversions', () => {
    const sourceCanvas = { width: 1200, height: 900 }
    const text = {
      type: 'text',
      text: 'Hello',
      x: 360,
      y: 270,
      color: '#ff0000',
      fontSize: 18
    }

    const normalized = normalizeAnnotation(text, sourceCanvas)
    const zoomLevels = [
      { width: 1800, height: 1350 },
      { width: 900, height: 675 },
      { width: 2400, height: 1800 }
    ]

    zoomLevels.forEach(canvas => {
      const rendered = materializeAnnotation(normalized, canvas)
      expect(rendered.x / canvas.width).toBeCloseTo(0.3)
      expect(rendered.y / canvas.height).toBeCloseTo(0.3)
      expect(rendered.fontSize / Math.min(canvas.width, canvas.height)).toBeCloseTo(normalized.fontSize)
    })
  })

  it('keeps rectangle placement consistent after rerender and page-size change', () => {
    const pageA = { width: 1100, height: 1700 }
    const pageB = { width: 825, height: 1275 }

    const rect = {
      type: 'rect',
      color: '#0000ff',
      width: 3,
      x: 220,
      y: 340,
      w: 440,
      h: 255
    }

    const normalized = normalizeAnnotation(rect, pageA)
    const firstRender = materializeAnnotation(normalized, pageB)
    const secondRender = materializeAnnotation(normalized, pageB)

    expect(firstRender.x).toBeCloseTo(secondRender.x)
    expect(firstRender.y).toBeCloseTo(secondRender.y)
    expect(firstRender.w).toBeCloseTo(secondRender.w)
    expect(firstRender.h).toBeCloseTo(secondRender.h)
    expect(firstRender.x / pageB.width).toBeCloseTo(rect.x / pageA.width)
    expect(firstRender.y / pageB.height).toBeCloseTo(rect.y / pageA.height)
  })
})
