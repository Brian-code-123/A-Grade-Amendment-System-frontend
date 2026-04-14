# Grade Amendment Form PDF - Field Coordinate Mapping

## PDF Document Properties

### Page Dimensions
- **Page 1 (Form Data Entry):** 1581.03 × 2225.22 points
  - Approx: 21.96 × 30.91 inches | 557.75 × 785.01 mm
- **Page 2 (Academic Registry Approval):** 1667.85 × 2353.83 points
  - Approx: 23.16 × 32.69 inches | 588.38 × 830.38 mm

**Note:** These are scanned image-based forms, NOT standard A4 (210 × 297 mm).

---

## PAGE 1: GRADE AMENDMENT REQUEST

### Student Information Section (appears on both left and right sides)
| Field | X Coordinate | Y Coordinate | Font Size | Notes |
|-------|--------------|--------------|-----------|-------|
| Student No. | 340 | 1855 | 26 pt | Unique student identifier |
| Student Name | 900 | 1855 | 26 pt | Full name as registered |
| Course Code - Course Title | 400 | 1805 | 24 pt | Combined field: "CODE - Title" (truncated if >50 chars) |
| Original Grade | 300 | 1755 | 26 pt | Current/previous grade |
| New Grade | 900 | 1755 | 26 pt | Proposed new grade |

### Academic Year & Term Section
| Field | X Coordinate | Y Coordinate | Font Size | Notes |
|-------|--------------|--------------|-----------|-------|
| Academic Year - First Year | 880 | 1935 | 26 pt | Last 2 digits of first year (from "YY-YY" format) |
| Academic Year - Second Year | 1010 | 1935 | 26 pt | Last 2 digits of second year (from "YY-YY" format) |
| Term | 1200 | 1935 | 26 pt | Term number (1, 2, or 3) |

### Reason Type Checkboxes & Details (LEFT COLUMN - Non-Appeal Reasons)
| Field | X Coordinate | Y Coordinate | Action | Notes |
|-------|--------------|--------------|--------|-------|
| Conversion (Checkbox) | 100 | 1505 | Draw tick if selected | Grade conversion reasons |
| Grade Conversion Details | 110 | 1420 | Text field | Extra details for conversion |
| Makeup (Checkbox) | 100 | 1465 | Draw tick if selected | Makeup exam reasons |
| Makeup Details | 110 | 1420 | Text field | 2 lines available, size 22 pt |
| Supplementary (Checkbox) | 100 | 1355 | Draw tick if selected | Supplementary exam reasons |
| Supplementary Details | 110 | 1310 | Text field | 2 lines available, size 22 pt |
| Review (Checkbox) | 100 | 1255 | Draw tick if selected | Academic staff review |
| Review Details | 110 | 1200 | Text field | 2 lines available, size 22 pt |
| Others (Checkbox) | 100 | 1105 | Draw tick if selected | Other reasons |
| Others Details | 110 | 1060 | Text field | 2 lines available, size 22 pt |

### Course Instructor Section (LEFT COLUMN - Non-Appeal)
| Field | X Coordinate | Y Coordinate | Font Size | Notes |
|-------|--------------|--------------|-----------|-------|
| Instructor Name | 420 | 960 | 26 pt | Course instructor's full name |
| Department | 300 | 910 | 26 pt | Academic department |
| Signature | 280 | 840 | 120×48 | Image field (PNG, 120 pt wide × 48 pt high) |
| Date | 280 | 770 | 26 pt | Instructor's signature date |

### Programme Director Endorsement (LEFT COLUMN - Non-Appeal)
| Field | X Coordinate | Y Coordinate | Font Size | Notes |
|-------|--------------|--------------|-----------|-------|
| Director Name | 200 | 545 | 26 pt | Programme Director or Department Head name |
| Director Signature | 400 | 530 | 120×48 | Image field (PNG, 120 pt wide × 48 pt high) |
| Endorsement Date | 300 | 460 | 26 pt | Director's endorsement date |

---

### Reason Type Checkboxes & Details (RIGHT COLUMN - Appeal Reasons)
| Field | X Coordinate | Y Coordinate | Action | Notes |
|-------|--------------|--------------|--------|-------|
| Appeal by Student (Checkbox) | 800 | 1505 | Draw tick if selected | Student initiated appeal |
| Technical Errors (Checkbox) | 800 | 1400 | Draw tick if selected | Ground for appeal |
| Procedural Faults (Checkbox) | 1000 | 1400 | Draw tick if selected | Ground for appeal (mutually exclusive with Technical Errors) |
| Appeal Details | 810 | 1300 | Text field | 2 lines available, size 22 pt |

### Course Instructor Section (RIGHT COLUMN - Appeal)
| Field | X Coordinate | Y Coordinate | Font Size | Notes |
|-------|--------------|--------------|-----------|-------|
| Instructor Name | 1100 | 1205 | 26 pt | Course instructor's full name |
| Department | 960 | 1155 | 26 pt | Academic department |
| Signature | 950 | 1090 | 120×48 | Image field (PNG, 120 pt wide × 48 pt high) |
| Date | 950 | 1050 | 26 pt | Instructor's signature date |

### Programme Director Endorsement (RIGHT COLUMN - Appeal)
| Field | X Coordinate | Y Coordinate | Font Size | Notes |
|-------|--------------|--------------|-----------|-------|
| Director Name | 900 | 860 | 26 pt | Programme Director or Department Head name |
| Director Signature | 1100 | 800 | 120×48 | Image field (PNG, 120 pt wide × 48 pt high) |
| Endorsement Date | 900 | 760 | 26 pt | Director's endorsement date |

### Final Year Student Warning Checkbox
| Field | X Coordinate | Y Coordinate | Action | Notes |
|-------|--------------|--------------|--------|-------|
| Final Year Student | 105 | 1705 | Draw tick if selected | Printed label: "*If the grade..." |

---

## PAGE 2: ACADEMIC REGISTRY APPROVAL

### Assistant Academic Registrar's Approval Section
| Field | X Coordinate | Y Coordinate | Font Size | Notes |
|-------|--------------|--------------|-----------|-------|
| Approved (Checkbox) | To be determined | To be determined | — | Not yet mapped |
| Not Approved (Checkbox) | To be determined | To be determined | — | Not yet mapped |
| Registrar Signature | To be determined | To be determined | — | Not yet mapped |
| Registrar Date | To be determined | To be determined | — | Not yet mapped |
| Remarks | To be determined | To be determined | — | Not yet mapped |

### For Use of the Academic Registry Section
| Field | X Coordinate | Y Coordinate | Font Size | Notes |
|-------|--------------|--------------|-----------|-------|
| Grade Entry By | To be determined | To be determined | — | Not yet mapped |
| Checked By | To be determined | To be determined | — | Not yet mapped |
| Date (Entry) | To be determined | To be determined | — | Not yet mapped |
| Date (Check) | To be determined | To be determined | — | Not yet mapped |

---

## Coordinate System Notes

### Origin Point
- **X=0, Y=0** is at the **top-left corner** of each page
- X increases to the right
- Y increases downward

### Unit System
- **Points (pts):** 1 point = 1/72 inch
- **Pixels vs Points:** When using canvas rendering, conversion may be needed based on DPI

### Text Placement Rules
1. **X coordinate** typically represents the **left edge** of text
2. **Y coordinate** typically represents the **baseline or top** depending on text rendering
3. **Font sizes** are in points (pt)
4. **Checkboxes tick marks** are drawn at the checkbox center position
5. **Signature images** are positioned with top-left corner at (x, y)

### Multi-line Text Fields
- Text details that span multiple lines use the initial y-coordinate for the first line
- Subsequent lines typically follow at spacing indicated in the code (e.g., 4.5 pt apart)

### Checkbox Behavior
- Left column non-appeal: Only ONE reason type checkbox should have a tick
- Right column appeal: Only ONE appeal grounds checkbox should have a tick
- Final Year Student: Independent checkbox

---

## Data Format Reference

### Academic Year Format
- Input: "YY-YY" (e.g., "24-25")
- Year 1 coordinate: Extract and use last 2 digits
- Year 2 coordinate: Extract and use last 2 digits

### Reason Type Values
- `'conversion'` → Conversion checkbox ticked
- `'makeup'` → Makeup checkbox ticked
- `'supplementary'` → Supplementary checkbox ticked
- `'review'` → Review checkbox ticked
- `'others'` → Others checkbox ticked
- `'appeal'` → Appeal by Student checkbox ticked

### Appeal Grounds Values
- `'Technical errors'` → Technical Errors checkbox ticked
- `'Procedural faults'` → Procedural Faults checkbox ticked

---

## Implementation Checklist

### For PDF Filling (PDF-Lib or Similar)

- [x] Student No. → (340, 1855)
- [x] Student Name → (900, 1855)
- [x] Course Code + Title → (400, 1805)
- [x] Original Grade → (300, 1755)
- [x] New Grade → (900, 1755)
- [x] Academic Year (both parts) → (880/1010, 1935)
- [x] Term → (1200, 1935)
- [x] Final Year Student checkbox → (105, 1705)
- [x] Reason Type checkboxes (5 types) → various x, 1505/1465/1355/1255/1105
- [x] Reason/Appeal Details text → various coordinates
- [x] Instructor Name (left) → (420, 960)
- [x] Instructor Name (right) → (1100, 1205)
- [x] Department (left) → (300, 910)
- [x] Department (right) → (960, 1155)
- [x] Signature fields (left/right/director) → multiple coordinates
- [x] Date fields → multiple coordinates
- [ ] Page 2 fields → TO BE COMPLETED

---

## PDF Analysis Tool Output

```
=== PDF Analysis ===

Total Pages: 2

Page 1:
  Dimensions: 1581.03 x 2225.22 points (pts)
  Dimensions: 21.96 x 30.91 inches
  Dimensions: 557.75 x 785.01 mm

Page 2:
  Dimensions: 1667.85 x 2353.83 points (pts)
  Dimensions: 23.16 x 32.69 inches
  Dimensions: 588.38 x 830.38 mm
```

---

## Additional Notes for Development

1. **Scanned Form:** The PDF is a scanned image, not a native digital form, so coordinate-based positioning is essential
2. **Page Size Variation:** Page 2 is slightly different in size from Page 1; use `pages[0]` and `pages[1]` separately
3. **Text Overflow:** Course Code + Title field has 50-character limit before truncation
4. **Signature Handling:** RGBA PNG images with transparent background recommended
5. **Font Size Consistency:** 26 pt for most fields, 22 pt for detail text, 28 pt for tick marks
6. **Multi-line Details:** Details fields support wrapped text (2-line examples in code)

