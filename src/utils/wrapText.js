// Greedy word wrap. `measure(text)` returns the rendered width, so the same code
// works with any font. Words wider than `maxWidth` are split; text beyond
// `maxLines` is cut and the last line ends with "...".
export function wrapText(text, maxWidth, measure, maxLines) {
  const words = String(text == null ? '' : text).split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''

  const fitsWithEllipsis = (s) => measure(s + '...') <= maxWidth
  const push = (line) => lines.push(line)

  for (const word of words) {
    let rest = word
    while (measure(rest) > maxWidth) {
      if (current) { push(current); current = '' }
      let cut = rest.length
      while (cut > 1 && measure(rest.slice(0, cut)) > maxWidth) cut -= 1
      push(rest.slice(0, cut))
      rest = rest.slice(cut)
    }
    const candidate = current ? `${current} ${rest}` : rest
    if (measure(candidate) <= maxWidth) {
      current = candidate
    } else {
      push(current)
      current = rest
    }
  }
  if (current) push(current)

  if (lines.length <= maxLines) return lines
  const kept = lines.slice(0, maxLines)
  let last = kept[maxLines - 1]
  while (last.length > 0 && !fitsWithEllipsis(last)) last = last.slice(0, -1).trimEnd()
  kept[maxLines - 1] = last + '...'
  return kept
}
