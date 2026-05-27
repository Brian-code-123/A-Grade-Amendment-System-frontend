# A Grade Amendment System

A full-stack web application designed to streamline university grade amendment workflows by replacing manual, paper-based processes with a centralized, auditable digital solution.

## Overview

Current grade amendment processes rely heavily on manual, paper-driven workflows, which create bottlenecks, increase the risk of lost or duplicated forms, and make auditing difficult.

This frontend provides a role-based interface for instructors, programme directors, and administrative staff to submit, review, approve, and track grade amendment requests online.

## Core Workflow

### Approved case

1. Instructor submits a new grade amendment request.
2. Programme Director reviews the case.
3. Programme Director approves the request with optional comments.
4. Administrative staff receives the approved request.
5. The system generates a printable record for final processing.

### Rejected case

1. Instructor submits a new grade amendment request.
2. Programme Director reviews the case.
3. Programme Director rejects the request with feedback.
4. The rejected case is returned to the instructor.
5. The instructor resubmits a revised request if needed.

## Key Features

- Electronic signature support for digital approvals.
- PDF processing and editing tools for grade documents.
- Excel import and export for bulk grade data handling.
- Role-based UI for Instructor, Programme Director, and Admin users.
- Streamlined form management with revision submission and checklists.
- Email-based authentication for secure login.
- Real-time status tracking for amendment requests.

## Tech Stack

### Frontend

- Vue 3
- Vite
- Pinia
- Vue Router
- Oruga UI, Bootstrap, and Material Design Icons

### Backend integration

- Node.js and Express.js API
- MongoDB
- Azure App Services
- Azure Static Web Apps deployment

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm
- A running backend API for authentication and email features

## Setup

1. Install dependencies:

	```bash
	npm install
	```

2. Create a `.env` file in the project root if you need to point the frontend at a separate backend:

	```bash
	VITE_API_BASE_URL=https://your-backend-app-service.azurewebsites.net
	```

3. Start the development server:

	```bash
	npm run dev
	```

4. Open the app at the local Vite URL shown in the terminal.

## Available Scripts

- `npm run dev` - start the development server.
- `npm run build` - build the production bundle.
- `npm run preview` - preview the production build locally.
- `npm run test:unit` - run unit tests with Vitest.
- `npm run lint` - lint and auto-fix the codebase.

## Configuration Notes

- `VITE_API_BASE_URL` is optional for same-origin development, but it is required when the frontend is deployed separately from the backend.
- If the app is hosted on Azure Static Web Apps, make sure the backend App Service URL is configured correctly before deploying.

## Deployment

The frontend is deployed on Azure Static Web Apps.

Live demo: https://agreeable-pebble-0d1936800.6.azurestaticapps.net

## Future Improvements

- Integration with university student information systems (SIS) for auto-populated student and course data.

