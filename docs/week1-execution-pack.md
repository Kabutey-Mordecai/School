# Week 1 Execution Pack

## Goal

Deliver the foundation needed to start feature development in Sprint 1:

- Authentication and role model
- Student records domain model
- Attendance and grading data model
- Finance invoicing baseline
- End-to-end repo and CI setup

## Workstreams

### 1) Platform and Repo Foundation

Owner: Full-stack Lead

- Create monorepo boundaries: `api`, `web`, `mobile`, `shared`
- Establish branch strategy and PR template
- Add environment strategy (`.env.example` per app)
- Define deployment targets (staging + production)

Definition of done:

- All apps build in CI
- Pre-commit checks pass
- Shared lint and formatting rules are documented

### 2) Data and Backend Foundation

Owner: Full-stack Lead

- Finalize Prisma schema for Phase 1 entities
- Add migration naming convention and seed strategy
- Implement auth module:
  - register/login
  - refresh tokens
  - role-based guards
- Establish module boundaries:
  - `auth`
  - `students`
  - `attendance`
  - `gradebook`
  - `finance`
  - `notifications`

Definition of done:

- DB migration runs from clean setup
- Auth endpoints tested
- Role guards verified for all five roles

### 3) Web Shell

Owner: Frontend Dev

- Build admin layout shell
- Implement auth screens (login, forgot-password placeholder)
- Add role-aware navigation
- Build first pages:
  - Student list
  - Attendance entry

Definition of done:

- Authenticated users can reach dashboard
- Role restrictions hide unauthorized nav links
- Student + attendance pages render with mocked API data

### 4) Mobile Shell

Owner: Mobile Dev

- Scaffold Expo app structure
- Add tab + stack navigation
- Add login flow with JWT storage
- Prepare local SQLite persistence interface for offline mode

Definition of done:

- User can login/logout in simulator
- Dashboard and notifications tabs reachable
- Offline storage abstraction created and unit tested

### 5) Design and QA Baseline

Owner: UI/UX + QA

- Create Figma token set (colors, spacing, typography, radii)
- Define component inventory for Sprint 1
- Write initial API and E2E smoke test plan

Definition of done:

- Design tokens approved
- QA checklist published for Sprint 1 demo

## Sprint 1 Demo Target

- Student records CRUD (web)
- Attendance recording (web)
- API auth + RBAC live
- Mobile app shell with authenticated parent dashboard

## Risks and Mitigation

1. Payment integration complexity appears early.
   - Mitigation: implement payment provider adapters with stubs first.
2. Offline sync can overrun Sprint 1.
   - Mitigation: only ship persistence layer and deferred sync queue interface.
3. Role matrix ambiguity can block backend guards.
   - Mitigation: freeze RBAC matrix in first 48 hours.

## First 10 Engineering Tickets

See `docs/sprint-backlog.md`.
