const getCanvasMetrics = (canvas) => {
  const width = Number(canvas?.width) || 1
  const height = Number(canvas?.height) || 1
  const base = Math.max(1, Math.min(width, height))
  return { width, height, base }
}

const normalizePoint = (x, y, canvas) => {
  const { width, height } = getCanvasMetrics(canvas)
  return { x: x / width, y: y / height }
}

const denormalizePoint = (x, y, canvas) => {
  const { width, height } = getCanvasMetrics(canvas)
  return { x: x * width, y: y * height }
}

const normalizeScalar = (value, canvas) => {
  const { base } = getCanvasMetrics(canvas)
  return value / base
}

const denormalizeScalar = (value, canvas) => {
  const { base } = getCanvasMetrics(canvas)
  return value * base
}

const hasNormalizedCoordinates = (annotation) => annotation?.coordinateSpace === 'normalized'

export const normalizeAnnotation = (annotation, canvas) => {
  if (!annotation || hasNormalizedCoordinates(annotation)) return annotation

  if (annotation.type === 'path') {
    return {
      ...annotation,
      coordinateSpace: 'normalized',
      width: normalizeScalar(annotation.width, canvas),
      points: (annotation.points || []).map(pt => normalizePoint(pt.x, pt.y, canvas))
    }
  }

  if (annotation.type === 'rect') {
    const { width, height } = getCanvasMetrics(canvas)
    const origin = normalizePoint(annotation.x, annotation.y, canvas)
    return {
      ...annotation,
      coordinateSpace: 'normalized',
      x: origin.x,
      y: origin.y,
      w: annotation.w / width,
      h: annotation.h / height,
      width: normalizeScalar(annotation.width, canvas)
    }
  }

  if (annotation.type === 'text') {
    const point = normalizePoint(annotation.x, annotation.y, canvas)
    return {
      ...annotation,
      coordinateSpace: 'normalized',
      x: point.x,
      y: point.y,
      fontSize: normalizeScalar(annotation.fontSize || 16, canvas)
    }
  }

  return annotation
}

export const materializeAnnotation = (annotation, canvas) => {
  if (!annotation || !hasNormalizedCoordinates(annotation)) return annotation

  if (annotation.type === 'path') {
    return {
      ...annotation,
      width: denormalizeScalar(annotation.width, canvas),
      points: (annotation.points || []).map(pt => denormalizePoint(pt.x, pt.y, canvas))
    }
  }

  if (annotation.type === 'rect') {
    const { width, height } = getCanvasMetrics(canvas)
    const point = denormalizePoint(annotation.x, annotation.y, canvas)
    return {
      ...annotation,
      x: point.x,
      y: point.y,
      w: annotation.w * width,
      h: annotation.h * height,
      width: denormalizeScalar(annotation.width, canvas)
    }
  }

  if (annotation.type === 'text') {
    const point = denormalizePoint(annotation.x, annotation.y, canvas)
    return {
      ...annotation,
      x: point.x,
      y: point.y,
      fontSize: denormalizeScalar(annotation.fontSize || (16 / 1000), canvas)
    }
  }

  return annotation
}
