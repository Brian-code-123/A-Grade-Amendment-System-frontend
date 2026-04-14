# PDF Field Mapping Analysis - Complete Summary

## 📋 Overview

This document provides the complete PDF field coordinate mapping for the HKBU Grade Amendment Form used in the A-Grade-Amendment-System. The analysis includes actual page dimensions, field positions, and implementation guidance.

---

## 📊 Deliverables Created

### 1. **PDF_FIELD_COORDINATES.md**
   - Comprehensive reference documentation
   - Organized by page and section
   - Field names, coordinates, font sizes
   - Data format references
   - Implementation checklist

### 2. **pdf-coordinates.json**
   - Machine-readable JSON format
   - Complete document structure
   - All field definitions with metadata
   - Ideal for programmatic access

### 3. **PDF_FIELD_COORDINATES_VISUAL.md**
   - ASCII art visual layout diagrams
   - Debugging guide with troubleshooting steps
   - Practical usage instructions
   - Summary coordinate table

### 4. **pdf-coordinates-lookup.js**
   - JavaScript/Node.js module
   - Direct coordinate lookups via functions
   - Form validation utilities
   - Helper functions for coordinate scaling
   - Exportable reference tables

---

## 🎯 Form Specifications

### Document Properties
- **Format**: Scanned image-based PDF (NOT native digital form fields)
- **Total Pages**: 2
- **Page 1** (Form Entry): 1581.03 × 2225.22 points (557.75 × 785.01 mm)
- **Page 2** (Registry Approval): 1667.85 × 2353.83 points (588.38 × 830.38 mm)
- **Coordinate Unit**: Points (1 pt = 1/72 inch)
- **Coordinate Origin**: Top-left corner (0,0)

---

## 🗺️ Key Field Coordinates - Page 1

### Student Information (All Coordinates on Page 1)
```
Student No.           → (340, 1855) | 26pt
Student Name          → (900, 1855) | 26pt
Course Code - Title   → (400, 1805) | 24pt (max 50 chars)
Original Grade        → (300, 1755) | 26pt
New Grade             → (900, 1755) | 26pt
```

### Academic Year & Term (Page 1)
```
Academic Year Year 1  → (880, 1935) | 26pt (extracted from "YY-YY")
Academic Year Year 2  → (1010, 1935) | 26pt
Term                  → (1200, 1935) | 26pt (1, 2, or 3)
```

### Reason Type Selection (Checkboxes - Left Column, X=100)
```
Conversion           → (100, 1505) | checkbox
Makeup               → (100, 1465) | checkbox + (110, 1420) details
Supplementary        → (100, 1355) | checkbox + (110, 1310) details
Review               → (100, 1255) | checkbox + (110, 1200) details
Others               → (100, 1105) | checkbox + (110, 1060) details
Final Year Student   → (105, 1705) | checkbox
```

### Appeal Section (Right Column)
```
Appeal by Student         → (800, 1505) | checkbox
Technical Errors          → (800, 1400) | checkbox
Procedural Faults         → (1000, 1400) | checkbox
Appeal Details            → (810, 1300) | text (22pt, 2 lines)
```

### Instructor Information
#### Left Side (Non-Appeal Reasons)
```
Name                  → (420, 960) | 26pt
Department            → (300, 910) | 26pt
Signature             → (280, 840) | 120×48 PNG image
Date                  → (280, 770) | 26pt
```

#### Right Side (Appeal Reasons)
```
Name                  → (1100, 1205) | 26pt
Department            → (960, 1155) | 26pt
Signature             → (950, 1090) | 120×48 PNG image
Date                  → (950, 1050) | 26pt
```

### Director/Department Head Endorsement
#### Left Side (Non-Appeal)
```
Name                  → (200, 545) | 26pt
Signature             → (400, 530) | 120×48 PNG image
Date                  → (300, 460) | 26pt
```

#### Right Side (Appeal)
```
Name                  → (900, 860) | 26pt
Signature             → (1100, 800) | 120×48 PNG image
Date                  → (900, 760) | 26pt
```

---

## 📝 Implementation Guide

### Using the PDF Library (pdf-lib)

```javascript
import { PDFDocument } from 'pdf-lib'
import { getFieldCoord } from './src/utils/pdf-coordinates-lookup.js'

const pdfBytes = await fetch('/form.pdf').then(r => r.arrayBuffer())
const pdfDoc = await PDFDocument.load(pdfBytes)
const page1 = pdfDoc.getPages()[0]

// Add student number
const studentNoCoord = getFieldCoord('studentNo')
page1.drawText(data.studentNo, {
  x: studentNoCoord.x,
  y: studentNoCoord.y,
  size: studentNoCoord.size,
  color: rgb(0, 0, 0)
})

// Add signature image
const sigCoord = getFieldCoord('signatureLeft')
const signatureImage = await pdfDoc.embedPng(signatureDataUrl)
page1.drawImage(signatureImage, {
  x: sigCoord.x,
  y: sigCoord.y,
  width: sigCoord.width,
  height: sigCoord.height
})
```

### Using the Lookup Module

```javascript
import { 
  getFieldCoord, 
  getReasonTypeCoords, 
  validateFormData,
  STUDENT_INFO 
} from './src/utils/pdf-coordinates-lookup.js'

// Get single field
const coord = getFieldCoord('newGrade') // { x: 900, y: 1755, size: 26, ... }

// Get all reason type coordinates
const reasonCoords = getReasonTypeCoords('makeup') // includes checkbox and details

// Validate form data before rendering
const validation = validateFormData(formData)
if (!validation.isValid) {
  console.error('Form validation errors:', validation.errors)
}

// Get all student info coordinates
console.log(STUDENT_INFO)
```

---

## 🔧 Troubleshooting Coordinates

### Text Appears in Wrong Position

1. **Verify Page Dimensions**: Check using `page.getSize()`
2. **Confirm Origin Point**: (0,0) should be top-left
3. **Font Size Mismatch**: Most fields are 26pt, details are 22pt, ticks are 28pt
4. **Y-Coordinate Direction**: Y increases downward (top = lower Y value)
5. **Text Baseline**: Some libraries use top, others use baseline

### Checkboxes Not Appearing

- Use font size 28pt for tick marks
- Character: 'V' or '✓'
- X/Y coordinates point to checkbox center
- Only ONE reason type should be ticked

### Signatures Positioned Incorrectly

- Image dimensions: 120 points wide × 48 points high
- X/Y coordinates are top-left corner of image
- Format: PNG with transparent background recommended
- Remove white background before embedding

### Multi-line Text Overflowing

- Detail fields span 2 lines
- Line spacing: approximately 4.5 points
- Use text wrapping/splitting if text is too long
- Test with actual data before production

---

## 📥 Form Data Flow

```
User Input (InsertFormView.vue)
    ↓
Form Validation (ValidateFormData)
    ↓
Generate PDF (generateGradeAmendmentPDFWithTemplate)
    ↓
Fetch Template PDF
    ↓
Load with pdf-lib (PDFDocument.load)
    ↓
Get Page 1
    ↓
For Each Field:
  ├─ Lookup Coordinates (getFieldCoord)
  ├─ Render Text or Image (drawText/drawImage)
  └─ Position at (x, y)
    ↓
For Page 2 Fields:
  └─ Render similar way
    ↓
Save & Download PDF
```

---

## 🎨 Visual Layout Summary

```
PAGE 1 (1581 × 2225 pts)
┌─────────────────────────────────────────┐
│ Form Header                             │
├─────────────────────────────────────────┤
│ Final Year? : Original Grade : New Grade│
│ Student Info : Academic Year/Term      │
├──────────────┬──────────────────────────┤
│ LEFT COLUMN  │ RIGHT COLUMN             │
│ Reasons      │ Appeal Section           │
│ Instructor   │ Instructor (Appeal)      │
│ Director     │ Director Endorse (Appeal)│
├──────────────┼──────────────────────────┤
│ PD Endorsement Boxes (Both Columns)    │
│ Signature/Name/Date/Remarks Fields     │
└──────────────┴──────────────────────────┘

PAGE 2 (1668 × 2354 pts)
┌──────────────────────────────────────────┐
│ AAR Approval Section                    │
│ - Approved/Not Approved Checkboxes     │
│ - Signature & Date Fields              │
│ - Remarks                              │
├──────────────────────────────────────────┤
│ For Registry Use                        │
│ - Grade Entry By, Checked By           │
│ - Entry Date, Check Date               │
├──────────────────────────────────────────┤
│ Privacy Policy Statement                │
└──────────────────────────────────────────┘
```

---

## ✅ Mapping Status

### Fully Mapped (Page 1)
- ✓ Student Information (5 fields)
- ✓ Academic Year & Term (3 fields)
- ✓ Final Year Student checkbox
- ✓ Reason Type Checkboxes (5 types)
- ✓ Reason Details (5 text areas)
- ✓ Appeal Checkboxes & Details
- ✓ Instructor Information (Left & Right)
- ✓ Director Endorsement (Left & Right)
- ✓ All signature fields

### Pending (Page 2)
- ⚠ Assistant Academic Registrar's Approval section
- ⚠ For Use of Academic Registry fields
- ⚠ Privacy policy positioning

---

## 🔍 Coordinate System Reference

### Points Conversion
| From  | To  | Formula | Example |
|-------|-----|---------|---------|
| Points | Pixels | pts × (DPI/72) | 26 pts @ 96 DPI = 34.67 px |
| Points | Inches | pts / 72 | 720 pts = 10 inches |
| Points | MM | pts × 25.4 / 72 | 283 pts ≈ 100mm |
| Pixels | Points | px / (DPI/72) | 34.67 px @ 96 DPI = 26 pts |

### Coordinate Space
- **Origin**: (0, 0) at top-left corner
- **X-axis**: 0 on left, increases rightward to ~1581
- **Y-axis**: 0 on top, increases downward to ~2225
- **Text X**: Position of left edge of text string
- **Text Y**: Position of baseline or top (library dependent)
- **Image X,Y**: Position of top-left corner

---

## 📚 Files Reference

| File | Purpose | Format |
|------|---------|--------|
| PDF_FIELD_COORDINATES.md | Comprehensive documentation | Markdown |
| PDF_FIELD_COORDINATES_VISUAL.md | Visual diagrams & debugging | Markdown ASCII |
| pdf-coordinates.json | Machine-readable reference | JSON |
| pdf-coordinates-lookup.js | Programmatic access | JavaScript/Node.js |
| pdf-coordinates-reference.md | This file | Markdown |

---

## 🚀 Quick Start

### For Developers
1. Import `pdf-coordinates-lookup.js` in your Node.js script
2. Use `getFieldCoord(fieldName)` to lookup coordinates
3. Use `validateFormData(data)` to validate before rendering
4. Reference `PDF_FIELD_COORDINATES.md` for details

### For Documentation/Testing
1. Open `PDF_FIELD_COORDINATES_VISUAL.md` for ASCII diagrams
2. Open `pdf-coordinates.json` for structured data
3. Use as reference when testing coordinate positioning

### For Integration
1. Copy `pdf-coordinates-lookup.js` to your utils
2. Import and use the exported functions
3. Pass form data through validation
4. Use coordinates to render PDF

---

## 📞 Support Notes

### Common Questions

**Q: Why are page dimensions not standard A4?**
A: The form is a scanned image, not a digital PDF form. The dimensions are the actual scanned size.

**Q: Can I edit individual coordinate values?**
A: Yes, all coordinates are in the `pdf-coordinates-lookup.js` file and can be adjusted if the form template changes.

**Q: How do I handle multi-line text fields?**
A: Use the `lines` and `spacing` properties in the coordinate object. Manually split text and position each line.

**Q: Should I always use 26pt font size?**
A: No. Check the `size` property for each field:
- Normal fields: 26pt
- Detail fields: 22pt
- Tick marks: 28pt

---

## 🎓 Version & History

- **Analysis Date**: 2024-04-15
- **PDF File**: `/Users/rogerlee/A-Grade-Amendment-System-frontend/public/form.pdf` (7.1 MB)
- **Form Status**: Scanned HKBU Grade Amendment Form
- **Mapping Status**: Page 1 ✓ Complete | Page 2 ⚠ Pending
- **Library Used**: pdf-lib v1.17.1
- **Node Version**: ^20.19.0 || >=22.12.0

---

## 📄 License & Usage

These coordinate mappings are specific to the HKBU Grade Amendment Form. Use with the official template only.

Last Updated: 2024-04-15

