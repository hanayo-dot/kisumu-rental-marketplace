# Kisumu Rental Marketplace Architecture

## Overview
This repository implements a privacy-first rental marketplace connecting tenants and landlords with a focus on trust, verified profiles, and modern UX.

## Backend
- Language: Go
- Framework: Gin
- Database: PostgreSQL
- Authentication: JWT
- Folder structure:
  - `cmd/main.go` — application entrypoint
  - `internal/database/db.go` — database connection and schema setup
  - `internal/models/models.go` — domain models and request/response DTOs
  - `internal/handlers/` — REST API handlers
  - `internal/middleware/` — auth and CORS middleware
  - `internal/utils/` — password hashing and JWT helpers

## Frontend
- Framework: React + TypeScript
- Bundler: Vite
- Styling: Tailwind CSS
- Folder structure:
  - `src/pages/` — route views
  - `src/components/` — reusable UI components
  - `src/services/` — API client services
  - `src/hooks/` — auth hooks
  - `src/types/` — shared TypeScript definitions

## Core Domains
- Users
- Properties
- Connections / Applications
- Favorites
- Messaging / Conversations
- Leases
- Maintenance requests
- Notifications
- Reviews and ratings
- Verification records
- Audit logs
- Payments

## Privacy Principles
- No tenant income, salary, credit score, or financial documents are collected.
- Tenants are evaluated using verified identity, rental history, references, profile completion, communication, and verification status.
- User data is separated into structured fields with privacy-first defaults.

## Milestone Plan
1. Database schema expansion and normalized domain models.
2. Authentication, profile, property, favorite, and connection APIs.
3. Tenant and landlord UX flows with search, saved favorites, and dashboard actions.
4. Messaging, application workflow, lease management, and maintenance tracking.
5. Payments and admin moderation dashboards.
6. Testing, security hardening, and deployment configuration.
