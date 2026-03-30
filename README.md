# 1. Project Name & Tagline
## A-Grade Amendment System (Frontend)
Modern, responsive Vue 3 interface for grade amendment tracking and management.

# 2. Table of Contents
- [1. Project Name & Tagline](#1-project-name--tagline)
- [2. Table of Contents](#2-table-of-contents)
- [3. Project Overview](#3-project-overview)
- [4. Quick Start](#4-quick-start)
- [5. Usage](#5-usage)
- [6. Configuration](#6-configuration)
- [7. Project Structure](#7-project-structure)
- [8. Development](#8-development)
- [9. Deployment](#9-deployment)
- [10. FAQ](#10-faq)
- [11. Contributing](#11-contributing)
- [12. License](#12-license)

# 3. Project Overview
- **Project Background**: Part of the A-Grade Amendment System suite, handling all user interactions and PDF generation.
- **Main Features**: Vue 3 SPA, Pinia state management, PDF rendering/editing, signature capture, and Excel upload management.
- **Applicable Scenarios**: Faculty members submitting grade changes and administrators reviewing submissions.
- **Tech Stack**: Vue 3, Vite, Pinia, Tailwind CSS, Vue Router, PDF.js.

# 4. Quick Start
### 4.1 Environmental Requirements
- **System**: macOS / Windows / Linux
- **Language**: Node.js v18+
- **Tools**: npm / pnpm

### 4.2 Installation Steps
1. **Clone the project**: `git clone https://github.com/Brian-code-123/A-Grade-Amendment-System-frontend.git`
2. **Install dependencies**: `npm install`
3. **Environment Setup**: Copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.
4. **Run development server**: `npm run dev`
5. **Access address**: http://localhost:5173

# 5. Usage
- **Basic Usage**: Navigate through the dashboard to upload Excel files, fill out amendment forms, or capture digital signatures.
- **Common Commands**:
  - `npm run dev`: Start development server
  - `npm run build`: Build for production
  - `npm run preview`: Preview production build locally
- **Key Views**:
  - `HomeView`: Main entry point.
  - `PDFEditorView`: Interface for editing and signing amendment PDFs.
  - `ExcelUploadView`: Batch processing of grade data.

# 6. Configuration
- **Environment Variables**:
  - `VITE_API_BASE_URL`: URL of the backend API service (e.g., `https://api.example.com`).
  - `VITE_APP_TITLE`: Custom application title.
- **Configuration Files**: `vite.config.js` for build settings and `staticwebapp.config.json` for Azure routing.

# 7. Project Structure
- `/src/components`: Reusable Vue components (Forms, Signature Board).
- `/src/views`: Page-level components (Home, Admin, PDF Editor).
- `/src/stores`: Pinia state management (Auth, Amendment, Notification).
- `/src/services`: Email and PDF generation logic.
- `/src/router`: Frontend route definitions with auth guards.

# 8. Development
- **Coding Standard**: ESLint + Prettier for code consistency.
- **State Management**: Use Pinia for all cross-component states.
- **Best Practices**: Prefer Composition API in all new components.

# 9. Deployment
- **Platform**: Hosted as Azure Static Web App or bundled into the backend `public/` folder.
- **Process**: Automated via GitHub Actions.
- **Build Output**: `dist/` directory contains minimized assets.

# 10. FAQ
- **Q: Login redirecting to wrong URL?**
  - A: Check `VITE_API_BASE_URL` in your environment variables.
- **Q: PDF not loading?**
  - A: Ensure `pdf.worker.min.mjs` is correctly placed in the `public/` folder.

# 11. Contributing
- Open a PR against `main`.
- Ensure component tests pass if applicable.

# 12. License
MIT License.

