# API Module Map

This folder defines domain module boundaries for the Node.js + Express API.

## Core Modules (Phase 1)

- `auth` - login, refresh, role guard policies
- `students` - student profile + enrollment operations
- `attendance` - daily/subject attendance workflows
- `gradebook` - marks entry and report publication
- `finance` - invoices, payments, defaulter tracking
- `notifications` - push, WhatsApp, and SMS adapters

## Cross-Cutting Concerns

- `common/http` - request validation + error handling
- `common/security` - JWT, password hashing, rate limiting
- `common/events` - domain events and queue producers
- `common/persistence` - Prisma repositories and transactions

## Route Prefix Proposal

- `/api/v1/auth`
- `/api/v1/students`
- `/api/v1/attendance`
- `/api/v1/gradebook`
- `/api/v1/finance`
- `/api/v1/notifications`
