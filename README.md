# A Grade Amendment System - Frontend

Vue3 frontend for A Grade Amendment System with comprehensive Excel import/export functionality.

## Features

- 📝 **Grade Amendment Management** - Add, edit, delete grade amendments
- 📊 **Excel Integration** - Import/export with preview and validation
- 🎨 **Modern UI** - Bootstrap 5 responsive design
- 🔄 **Workflow Management** - 7-step approval workflow
- 👥 **Role-based Access** - Teacher, Programme Director, Admin roles
- 💾 **Client-side Processing** - Works offline with local Excel generation

## Excel Functionality

### Import from Excel
- Upload Excel files (.xlsx, .xls)
- **Preview before import** - See first 5 records
- **Validation** - Automatic field validation
- **Error reporting** - Clear error messages
- **Max file size** - 5MB

### Export to Excel
- **Client-side export** (default) - Fast, works offline
- **Server-side export** - Optional backend integration
- **Conditional formatting** - Color-coded status cells
- **Auto-generated** - Timestamped filenames

### Template Download
- Pre-formatted Excel template
- Sample data included
- Data validation rules
- Professional styling

📖 **See [EXCEL_INTEGRATION.md](EXCEL_INTEGRATION.md) for detailed Excel documentation**

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Application runs at `http://localhost:5173`

## Build

```bash
npm run build
```

## Backend Connection

The frontend connects to the backend API at `http://localhost:3000`.

**Note**: Excel functionality works independently and can operate without backend connection using client-side processing.

## Documentation

- **[EXCEL_INTEGRATION.md](EXCEL_INTEGRATION.md)** - Complete Excel functionality guide
- **[USAGE_GUIDE.md](USAGE_GUIDE.md)** - Application usage guide
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Code organization
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[TEST_GUIDE.md](TEST_GUIDE.md)** - Testing instructions

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Pinia** - State management
- **Vue Router** - Official router
- **Axios** - HTTP client
- **ExcelJS** - Excel file processing
- **Bootstrap 5** - CSS framework
