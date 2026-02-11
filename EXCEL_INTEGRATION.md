# Excel Integration Guide

## Overview

This frontend application provides comprehensive Excel import/export functionality for the Grade Amendment System. The implementation supports both **client-side** and **server-side** Excel processing.

## Features

### 1. Excel Template Download
- **Client-side generation** using ExcelJS
- Pre-formatted with proper headers and styling
- Includes sample data for reference
- Data validation for status column
- Color-coded header row

### 2. Excel Import with Preview
- **File validation** (format, size limits)
- **Client-side parsing** before sending to backend
- **Preview table** showing first 5 records
- **Error reporting** for invalid rows
- **Confirm import** workflow
- Supports `.xlsx` and `.xls` formats
- Maximum file size: 5MB

### 3. Excel Export
- **Client-side export** (default, works offline)
- **Server-side export** (optional)
- Conditional formatting for status cells:
  - 🟢 Green: Approved
  - 🟡 Yellow: Pending
  - 🔴 Red: Rejected
- Includes all amendment data and metadata
- Auto-generated filename with timestamp

## Installation

The following packages are required and already installed:

```json
{
  "exceljs": "^4.4.0",
  "file-saver": "^2.0.5"
}
```

## Usage

### Download Template

1. Navigate to the **Amendments** page
2. Click **"Download Template"** button
3. Template file `grade_amendment_template.xlsx` will be downloaded
4. Fill in the template with your data

### Template Format

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| Student ID | ✅ | Student identification number | 20123456 |
| Student Name | ✅ | Full name of student | John Doe |
| Course Code | ✅ | Course identifier | COMP3047 |
| Course Name | ✅ | Full course name | Mobile App Development |
| Original Grade | ✅ | Grade before amendment | B |
| Amended Grade | ✅ | Grade after amendment | A- |
| Reason | ✅ | Reason for grade change | Grading error corrected |
| Status | ✅ | Amendment status | Pending/Approved/Rejected |

### Import from Excel

1. Click **"Choose File"** button
2. Select your filled Excel file
3. **Preview** will automatically appear showing:
   - Number of records found
   - First 5 records in table format
   - Any validation errors
4. Review the preview
5. Click **"Confirm Import"** to add records
6. Success message will appear

### Export to Excel

1. Add some amendment records (via form or import)
2. Click **"Export to Excel"** button
3. File will be downloaded as `grade_amendments_YYYY-MM-DD.xlsx`
4. Open in Excel/LibreOffice to view

### Client-side vs Server-side Export

**Client-side Export (Default):**
- ✅ Works offline
- ✅ Faster performance
- ✅ No server load
- ✅ Styled output with colors
- ✅ Recommended for most users

**Server-side Export:**
- ✅ Consistent with backend data
- ✅ May include additional server-side processing
- ⚠️ Requires backend server running
- Uncheck "Use client-side Excel generation" to enable

## Technical Implementation

### Excel Service (`excelService.js`)

The Excel service provides the following methods:

#### `generateTemplate()`
Generates and downloads an Excel template with:
- Formatted headers
- Sample data rows
- Data validation rules
- Cell styling

#### `exportToExcel(amendments)`
Exports amendment data to Excel with:
- All amendment fields
- Conditional formatting
- Timestamp in filename
- Professional styling

#### `parseExcelFile(file)`
Parses an Excel file and returns:
- Array of amendment objects
- Validation errors (if any)
- Supports flexible column ordering

#### `validateFile(file)`
Validates file before processing:
- File size check (max 5MB)
- File extension check (.xlsx, .xls)
- MIME type validation

### ImportExport Component

Enhanced features:
- Real-time file validation
- Preview table with first 5 records
- Error display for invalid data
- Loading indicators
- Success/error messages
- Bootstrap Icons integration

### Data Flow

```
User Action
    ↓
Client-side Validation (excelService)
    ↓
Preview Display (ImportExport component)
    ↓
User Confirmation
    ↓
Store Actions (amendmentStore)
    ↓
Backend API (amendmentService) [Optional]
```

## Error Handling

### File Validation Errors
- **File too large**: Maximum 5MB allowed
- **Invalid format**: Only .xlsx and .xls supported
- **Empty file**: No data found in Excel file

### Data Validation Errors
- **Missing required fields**: Student ID, Name, or Course Code missing
- **Invalid row**: Row number and specific error shown
- **Format errors**: Displayed in preview with details

### Backend Errors
- **Network Error**: Backend not available (works offline)
- **API Errors**: Specific error messages from backend

## Best Practices

### For Template Users
1. **Don't modify headers** - Keep column names exactly as in template
2. **Fill all required fields** - Empty required fields will cause errors
3. **Use valid status values** - Only: Pending, Approved, Rejected
4. **Check preview** - Always review preview before importing
5. **Keep file small** - Large files may take time to process

### For Developers
1. **Use client-side export** for better performance
2. **Validate data** before sending to backend
3. **Handle errors gracefully** with user-friendly messages
4. **Test with various file sizes** to ensure performance
5. **Consider chunking** for very large imports (future enhancement)

## API Endpoints

The following backend endpoints are used (when available):

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/amendments/import` | POST | Import Excel file |
| `/amendments/export` | GET | Export to Excel |
| `/amendments/template` | GET | Download template |

**Note**: Client-side generation can work without these endpoints.

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ IE11 (not supported)

## File Size Limits

- **Maximum file size**: 5MB
- **Recommended**: Under 2MB for best performance
- **Large datasets**: Consider splitting into multiple files

## Security Considerations

1. **File validation** on client-side prevents malicious files
2. **Size limits** prevent memory issues
3. **Format validation** ensures only Excel files accepted
4. **No server storage** of uploaded files (processed in memory)
5. **Client-side parsing** adds additional security layer

## Troubleshooting

### Template doesn't download
- Check browser download settings
- Ensure JavaScript is enabled
- Try different browser

### Import shows errors
- Verify all required fields are filled
- Check data format matches template
- Ensure status values are valid
- Review error messages in preview

### Export is empty
- Ensure amendments exist in the system
- Check browser console for errors
- Try refreshing the page

### Preview shows wrong data
- Verify Excel file structure matches template
- Check for merged cells or complex formatting
- Use simple Excel format without macros

## Future Enhancements

- [ ] Bulk import with progress bar
- [ ] Import history and rollback
- [ ] Excel file validation rules
- [ ] Support for additional file formats (CSV)
- [ ] Advanced filtering before export
- [ ] Custom export templates
- [ ] Chunked upload for large files
- [ ] Background processing for imports

## Support

For issues or questions:
1. Check this documentation
2. Review console logs in browser
3. Check PROJECT_STRUCTURE.md for code organization
4. See USAGE_GUIDE.md for general application usage

## Version History

### v1.0.0 (Current)
- Initial implementation with ExcelJS
- Client-side template generation
- Import with preview
- Export with conditional formatting
- File validation
- Error handling

---

**Last Updated**: 2026-02-11  
**Author**: A-Grade Amendment System Team
