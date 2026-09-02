# A Grade Amendment System

A full-stack web application designed to streamline university grade amendment workflows by replacing manual, paper-based processes with a centralized, auditable digital solution.

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Proposed Solution](#proposed-solution)
- [Core Workflow](#core-workflow)
- [Key Features](#key-features)
- [System Benefits](#system-benefits)
- [Tech Stack](#tech-stack)
- [Security](#security)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)

## Overview

This project introduces a fully digital, role-based workflow system that enables instructors, programme directors, and administrative staff to submit, review, approve, and track grade amendments entirely online. The system eliminates manual handoffs, reduces processing time, and creates an immutable audit trail for all actions.

## The Problem

Current grade amendment processes rely entirely on manual, paper-driven workflows, creating significant operational challenges:

- Process bottlenecks: average 3–4 week processing time, up to 6–8 weeks during peak periods.
- High workload burden: 100+ hours of manual data entry required per semester.
- Loss and error risks: paper forms are easily lost, damaged, or duplicated, with no centralized tracking.
- Compliance gaps: no systematic audit trail, making policy compliance unprovable during reviews.

## Proposed Solution

The system replaces paper-based handoffs with a structured digital workflow so the right users can submit, review, approve, and monitor amendment requests in one place.

## Core Workflow

### Approved case

1. Instructor submits a new grade amendment request.
2. Programme Director receives and reviews the case.
3. Programme Director approves the request with optional comments.
4. Administrative staff receives the approved request.
5. System generates a printable record for final processing.

### Rejected case

1. Instructor submits a new grade amendment request.
2. Programme Director receives and reviews the case.
3. Programme Director rejects the request with clear feedback.
4. Rejected case is automatically returned to the instructor.
5. Instructor reads remarks and resubmits a revised request if needed.

## Key Features

- Electronic signature support for secure digital approvals.
- PDF processing and editing tools for grade documents.
- Excel import and export for bulk grade data handling.
- Role-based UI for Instructor, Programme Director, and Admin users.
- Simplified form management with revision submission and checklists.
- Email authentication for secure login via institutional email addresses.
- Process status visualization for real-time tracking of request progress.

## System Benefits

| Benefit | Details |
| --- | --- |
| 10x Faster Processing | Reduces grade amendment turnaround time from weeks to days. |
| Reduced Input Overhead | Streamlined forms with 44% fewer required input fields. |
| Centralized Data Storage | Uses MongoDB to eliminate data redundancy and inconsistencies. |
| Full Audit Trail | Every approval, rejection, and resubmission is recorded in an append-only log for compliance and audit purposes. |
| Improved Usability | Modern minimal UI with role-specific views and clear process status. |
| Reduced Staff Burden | Eliminates 100+ hours of manual data entry work per semester. |

## Tech Stack

### Frontend

- Vue 3
- Vite
- Pinia
- Vue Router
- Oruga UI
- Bootstrap
- Material Design Icons

### Backend

- Node.js + Express.js
- MongoDB
- jsonwebtoken
- bcryptjs
- dotenv
- Azure App Services

## Security

- Session tokens issued by the backend are short-lived and rejected once expired or revoked, so a stolen or leaked token stops working on its own.
- Roles (Instructor, Programme Director, Head, admin) are assigned by the backend and cannot be chosen or changed from the sign-up form.
- Every case status change is written to an append-only audit log on the backend, independent of the editable case record, so a rejection reason can never be silently lost on resubmission.

## Deployment

The application is deployed on Azure Static Web Apps for global availability and simplified CI/CD. Every pull request and push to main runs linting and the automated test suite before the build is deployed.

Live demo: https://agreeable-pebble-0d1936800.6.azurestaticapps.net

## Future Improvements

- Integration with university student information systems (SIS) for auto-populated student and course data.

