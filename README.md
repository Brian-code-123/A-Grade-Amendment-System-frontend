A Grade Amendment System
A full-stack web application designed to streamline university grade amendment workflows by replacing manual, paper-based processes with a centralized, auditable digital solution.
🚨 The Problem
Current grade amendment processes rely entirely on manual, paper-driven workflows, creating significant operational challenges:
Process Bottlenecks: Average 3–4 week processing time (up to 6–8 weeks during peak periods)
High Workload Burden: 100+ hours of manual data entry required per semester
Loss & Error Risks: Paper forms are easily lost, damaged, or duplicated, with no centralized tracking
Compliance Gaps: No systematic audit trail, making policy compliance unprovable during reviews
💡 Proposed Solution
This project introduces a fully digital, role-based workflow system that enables instructors, programme directors, and administrative staff to submit, review, approve, and track grade amendments entirely online. The system eliminates manual handoffs, reduces processing time, and creates an immutable audit trail for all actions.
🔄 Core Workflow
Approved Case
Instructor submits a new grade amendment request
Programme Director receives and reviews the case
Programme Director approves the request (with optional comments)
Administrative staff receives the approved request
System generates a printable record for final processing
Rejected Case
Instructor submits a new grade amendment request
Programme Director receives and reviews the case
Programme Director rejects the request with clear feedback
Rejected case is automatically returned to the instructor
Instructor reads remarks and resubmits a revised request if needed
✨ Key Features
Electronic Signature: Secure digital approvals to replace physical signatures
PDF Processing & Editing: Built-in tools to handle and annotate grade documents
File Import/Export: Support for Excel uploads to bulk import grade data
Role-Based UI: Context-aware interface showing only functions relevant to the user’s role (Instructor, Programme Director, Admin)
Simplified Form Management: Streamlined grade amendment forms with revision submission and checklists
Email Authentication: Secure login via institutional email addresses
Process Status Visualization: Real-time tracking of request progress
📊 System Benefits
Excel
Benefit	Details
10x Faster Processing	Reduces grade amendment turnaround time from weeks to days
Reduced Input Overhead	Streamlined forms with 44% fewer required input fields
Centralized Data Storage	Uses MongoDB to eliminate data redundancy and inconsistencies
Full Audit Trail	Automatically logs all actions for compliance and audit purposes
Improved Usability	Modern minimal UI with role-specific views and clear process status
Reduced Staff Burden	Eliminates 100+ hours of manual data entry work per semester
🛠️ Tech Stack
Frontend
Framework: Vue 3
Build Tool: Vite
State Management & Routing: Pinia
UI & Styling: Oruga UI + Bootstrap + Material Design Icons
Deployment: Azure Static Web Apps
Backend
Runtime & Framework: Node.js + Express.js
Database: MongoDB
Authentication & Security: jsonwebtoken, bcryptjs, dotenv
Cloud Services: Azure App Services
🚀 Deployment
The application is deployed on Azure Static Web Apps for global availability and simplified CI/CD.
Live Demo: https://agreeable-pebble-0d1936800.6.azurestaticapps.net
📈 Future Improvements
Integration with university student information systems (SIS) for auto-populated student/course data

