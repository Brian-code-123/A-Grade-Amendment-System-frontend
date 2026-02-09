# A-Grade Amendment System Frontend

Vue 3 frontend for the A-Grade Amendment System.

## Backend Repository
https://github.com/Brian-code-123/A-Grade-Amendment-System.git

## Features

- ✨ Vue 3 Composition API
- 🚀 Vite for fast development
- 🗂️ Pinia for state management
- 🛣️ Vue Router for navigation
- 📡 Axios for API calls
- 📊 Excel import/export functionality
- 🎨 Responsive design with Bootstrap 5

## Project Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on http://localhost:3000

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at http://localhost:5173

### Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/amendments` | Get all amendments (HTML page) |
| POST | `/amendments/add` | Add a new amendment |
| POST | `/amendments/import` | Import amendments from Excel |
| GET | `/amendments/export` | Export amendments to Excel |
| GET | `/amendments/template` | Download Excel template |
| POST | `/amendments/update/:id` | Update an amendment |
| POST | `/amendments/delete/:id` | Delete an amendment |
| POST | `/amendments/delete-all` | Delete all amendments |

## Data Structure

```javascript
{
  id: Number,              // Auto-incremented unique identifier
  studentId: String,       // Student identification number
  studentName: String,     // Full name of the student
  courseCode: String,      // Course code (e.g., COMP3047)
  courseName: String,      // Full course title
  originalGrade: String,   // Grade before amendment
  amendedGrade: String,    // Grade after amendment
  reason: String,          // Reason for the grade change
  status: String           // "Pending", "Approved", or "Rejected"
}
```

## Project Structure

```
src/
├── assets/           # Static assets
├── components/       # Reusable components
├── views/           # Page components
├── router/          # Vue Router configuration
├── stores/          # Pinia stores
├── services/        # API services
├── utils/           # Utility functions
├── App.vue          # Root component
└── main.js          # Application entry point
```

## License

MIT
