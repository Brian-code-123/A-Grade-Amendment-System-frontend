# Grade Amendment Form PDF - Field Mapping Index

## ✅ Analysis Complete

A comprehensive field coordinate mapping has been created for the HKBU Grade Amendment Form PDF. This index provides an overview of all delivered files and how to use them.

---

## 📁 Delivered Files

All files are located in: `/Users/rogerlee/A-Grade-Amendment-System-frontend/`

### 1. **PDF_FIELD_COORDINATES.md** - Main Reference
   - **Purpose**: Comprehensive coordinate documentation
   - **Content**: 
     - Page dimensions (1581×2225 pts for page 1, 1668×2354 pts for page 2)
     - All field coordinates organized by section
     - Student information, academic year, term, and reason types
     - Instructor and director fields (left and right columns)
     - Data format reference and implementation checklist
   - **Use When**: You need detailed reference material with tables and explanations

### 2. **PDF_FIELD_COORDINATES_VISUAL.md** - Visual & Troubleshooting Guide
   - **Purpose**: ASCII art diagrams and debugging guide
   - **Content**:
     - Visual layout of form sections
     - Coordinate reference grid
     - Text field sizing information
     - Practical usage examples
     - Troubleshooting steps
     - Summary table with status indicators
   - **Use When**: You need visual understanding or debugging failing coordinates

### 3. **pdf-coordinates.json** - Machine-Readable Reference
   - **Purpose**: JSON structure for programmatic access
   - **Content**:
     - Complete document structure
     - All field definitions with metadata
     - Coordinate system documentation
     - Implementation notes
     - Text rendering guidelines
   - **Use When**: You need to parse coordinates programmatically or generate documentation

### 4. **pdf-coordinates-lookup.js** - JavaScript Module (RECOMMENDED)
   - **Purpose**: Ready-to-use Node.js/JavaScript module
   - **Content**:
     - Exported objects for each section (STUDENT_INFO, REASON_TYPES, etc.)
     - Helper functions: `getFieldCoord()`, `getReasonTypeCoords()`, `validateFormData()`
     - Utility functions: `scaleCoordinate()`, `generateReferenceTable()`
     - Form validation logic
   - **Use When**: Building Node.js or JavaScript code
   - **Example**:
     ```javascript
     import { getFieldCoord, validateFormData } from './src/utils/pdf-coordinates-lookup.js'
     const coord = getFieldCoord('studentNo')  // { x: 340, y: 1855, size: 26 }
     ```

### 5. **PDF_FIELD_COORDINATES_REFERENCE.md** - Master Summary
   - **Purpose**: Complete overview with quick-start guide
   - **Content**:
     - Form specifications
     - Key field coordinates
     - Implementation guide with code examples
     - Troubleshooting guide
     - Coordinate system reference
     - Visual layout summary
   - **Use When**: Starting a new PDF implementation or needing a complete overview

---

## 🎯 Quick Reference: Essential Coordinates

### Page Dimensions
- **Page 1**: 1581.03 × 2225.22 points (557.75 × 785.01 mm)
- **Page 2**: 1667.85 × 2353.83 points (588.38 × 830.38 mm)

### Most Common Fields (Page 1)
| Field | X | Y | Size |
|-------|---|---|------|
| Student No. | 340 | 1855 | 26pt |
| Student Name | 900 | 1855 | 26pt |
| Course Code-Title | 400 | 1805 | 24pt |
| Original Grade | 300 | 1755 | 26pt |
| New Grade | 900 | 1755 | 26pt |
| Academic Year (Y1) | 880 | 1935 | 26pt |
| Academic Year (Y2) | 1010 | 1935 | 26pt |
| Term | 1200 | 1935 | 26pt |

### Checkbox Positions (Y-coordinates, X varies)
- Conversion: Y=1505
- Makeup: Y=1465 (details at Y=1420)
- Supplementary: Y=1355 (details at Y=1310)
- Review: Y=1255 (details at Y=1200)
- Others: Y=1105 (details at Y=1060)
- Appeal: Y=1505
- Technical Errors: Y=1400
- Procedural Faults: Y=1400

### Instructor & Director Fields
- Instructor Name (L): (420, 960)
- Instructor Name (R): (1100, 1205)
- Department (L): (300, 910)
- Department (R): (960, 1155)
- Signatures: 120×48 PNG images
- Dates: 26pt text

---

## 🚀 How to Use These Files

### Scenario 1: I need to fill a PDF with data
**→ Use `pdf-coordinates-lookup.js`**

```javascript
import { getFieldCoord } from './src/utils/pdf-coordinates-lookup.js'
import { PDFDocument, rgb } from 'pdf-lib'

const coord = getFieldCoord('studentNo')
page.drawText(data.studentNo, {
  x: coord.x,
  y: coord.y,
  size: coord.size,
  color: rgb(0, 0, 0)
})
```

### Scenario 2: I need to understand the form layout
**→ Use `PDF_FIELD_COORDINATES_VISUAL.md`**
- Shows ASCII diagrams of the form
- Explains coordinate system
- Provides debugging help

### Scenario 3: I need to validate form data
**→ Use `pdf-coordinates-lookup.js`'s `validateFormData()` function**

```javascript
import { validateFormData } from './src/utils/pdf-coordinates-lookup.js'

const validation = validateFormData(formData)
if (!validation.isValid) {
  console.error('Errors:', validation.errors)
}
```

### Scenario 4: I'm integrating this into a new project
**→ Start with `PDF_FIELD_COORDINATES_REFERENCE.md`**
- Contains complete overview
- Implementation guide with examples
- Troubleshooting tips

### Scenario 5: I need to audit the coordinates
**→ Use `pdf-coordinates.json`**
- Structured, easy to search
- All metadata included
- Machine-readable format

---

## 📊 Data Format Reference

### Academic Year
- **Input Format**: "YY-YY" (e.g., "24-25")
- **Field 1** (X=880, Y=1935): Last 2 digits of first year
- **Field 2** (X=1010, Y=1935): Last 2 digits of second year

### Reason Types (Mutually Exclusive)
- `'conversion'` → Conversion checkbox
- `'makeup'` → Makeup exam checkbox
- `'supplementary'` → Supplementary exam checkbox
- `'review'` → Review initiated checkbox
- `'others'` → Others checkbox
- `'appeal'` → Appeal by Student checkbox

### Appeal Grounds (Only if reason is 'appeal')
- `'Technical errors'`
- `'Procedural faults'`

### Signature Images
- **Format**: PNG with transparent background
- **Size**: 120 points wide × 48 points high
- **Location**: X,Y coordinates mark top-left corner

---

## 🔍 Coordinate System Explained

- **Unit**: Points (1 point = 1/72 inch)
- **Origin**: Top-left corner (0,0)
- **X-axis**: Increases to the right
- **Y-axis**: Increases downward
- **Page 1 Range**: X: 0-1581, Y: 0-2225
- **Page 2 Range**: X: 0-1668, Y: 0-2354

---

## ✅ Completion Status

### Page 1: ✓ COMPLETE
- ✓ Student Information
- ✓ Academic Year & Term
- ✓ All Reason Types & Details
- ✓ Checkbox Positions
- ✓ Instructor Information (L & R)
- ✓ Director Endorsement (L & R)
- ✓ Signatures & Dates

### Page 2: ⚠ PARTIAL
- ⚠ Assistant Academic Registrar section (framework present, exact positions to be verified)
- ⚠ For Use of Academic Registry section (framework present)
- ⚠ Privacy Policy section (text positioning)

---

## 📝 Implementation Notes

1. **Scanned Form**: No native form fields; all positioning is coordinate-based
2. **Font Sizes**: 26pt (normal), 22pt (details), 28pt (ticks)
3. **Multi-line**: Detail fields support ~2 lines with 4.5pt spacing
4. **Text Overflow**: Course Code+Title truncated to 50 characters
5. **Validation**: Only one reason type should be selected
6. **Page Differences**: Page 2 is slightly larger than Page 1

---

## 🔗 Integration with Existing Code

The `pdfTemplate.js` service already contains coordinate implementations. These reference files provide:
- **Confirmation** of existing coordinates
- **Backup references** for validation
- **JavaScript module** for programmatic access
- **Comprehensive documentation** for new developers

---

## 💡 Tips

- Start with the JavaScript module for new implementations
- Reference the visual guide when debugging positioning issues
- Use the JSON file for any automated coordinate extraction
- Keep these files updated if the PDF template changes
- All coordinates are relative to the page top-left corner

---

## 📞 Support Resources

- **Detailed Reference**: See `PDF_FIELD_COORDINATES.md`
- **Visual Guide**: See `PDF_FIELD_COORDINATES_VISUAL.md`
- **Troubleshooting**: See `PDF_FIELD_COORDINATES_REFERENCE.md`
- **Code Integration**: See `pdf-coordinates-lookup.js`
- **Data Structure**: See `pdf-coordinates.json`

---

## 📄 File Locations

```
/Users/rogerlee/A-Grade-Amendment-System-frontend/
├── PDF_FIELD_COORDINATES.md ........................ Main reference
├── PDF_FIELD_COORDINATES_VISUAL.md ............... Visual & debugging
├── PDF_FIELD_COORDINATES_REFERENCE.md ........... Master summary
├── pdf-coordinates.json ........................... JSON reference
├── src/utils/pdf-coordinates-lookup.js .......... JavaScript module
└── analyze-pdf.js ............................... PDF analysis tool
```

---

## 🎓 Analysis Metadata

- **Analysis Date**: 2024-04-15
- **PDF File Size**: 7.1 MB
- **PDF Type**: Scanned image-based form
- **Total Fields Mapped**: 40+ on Page 1, framework on Page 2
- **Library Used**: pdf-lib v1.17.1, pdfjs-dist v5.5.207
- **Node.js Version**: ^20.19.0 || >=22.12.0

---

## ✨ Next Steps

1. **For Development**: Import `pdf-coordinates-lookup.js` in your Node.js scripts
2. **For Testing**: Use coordinates to test PDF rendering
3. **For Page 2**: Complete coordinate mapping as needed for registrar section
4. **For Updates**: Modify coordinates in `pdf-coordinates-lookup.js` if form template changes

---

**All coordinate mapping complete for Page 1. Ready for integration into PDF filling workflows.**

