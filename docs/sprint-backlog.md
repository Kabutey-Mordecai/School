# Sprint 1 Backlog (Starter)

## Ticket 1 - Define RBAC Matrix

Type: Architecture
Priority: P0

Acceptance criteria:

1. Roles covered: admin, teacher, parent, student, accountant.
2. Access table mapped for auth, students, attendance, gradebook, fees.
3. Matrix approved by product and engineering.

## Ticket 2 - Prisma Core Schema and Migration

Type: Backend
Priority: P0

Acceptance criteria:

1. Models created for school, users, students, classes, attendance, grades, invoices, payments.
2. First migration runs successfully on clean PostgreSQL instance.
3. Seed script creates one demo school and role users.

## Ticket 3 - Auth API (Register/Login/Refresh)

Type: Backend
Priority: P0

Acceptance criteria:

1. Endpoints implemented and documented.
2. JWT access + refresh flow works.
3. Failed auth attempts are logged and rate-limited.

## Ticket 4 - Role Guard Middleware

Type: Backend
Priority: P0

Acceptance criteria:

1. Middleware enforces route-level role restrictions.
2. Unit tests cover allowed and denied role permutations.
3. Unauthorized access returns standard error payload.

## Ticket 5 - Student Records API

Type: Backend
Priority: P1

Acceptance criteria:

1. CRUD endpoints for student profile and enrollment data.
2. Upload metadata fields available for document references.
3. Pagination and filtering by class/active status supported.

## Ticket 6 - Attendance API

Type: Backend
Priority: P1

Acceptance criteria:

1. Daily and per-subject attendance endpoints available.
2. Duplicate attendance records prevented by unique constraints.
3. Parent alert event emitted when absent threshold reached.

## Ticket 7 - Web Admin Layout and Routing

Type: Frontend
Priority: P1

Acceptance criteria:

1. Protected layout with sidebar and header scaffolded.
2. Route guards redirect unauthenticated users to login.
3. Role-aware nav hides unauthorized modules.

## Ticket 8 - Web Student and Attendance Screens

Type: Frontend
Priority: P1

Acceptance criteria:

1. Student list page fetches and renders API data.
2. Attendance entry screen supports class/date selection.
3. Loading and error states handled consistently.

## Ticket 9 - Mobile App Auth and Parent Dashboard Shell

Type: Mobile
Priority: P1

Acceptance criteria:

1. Parent login flow stores JWT securely.
2. Dashboard tab renders attendance summary placeholder.
3. Notifications tab is wired for future push integration.

## Ticket 10 - CI Pipeline for API and Web

Type: DevOps
Priority: P1

Acceptance criteria:

1. Build + lint + test jobs run on pull requests.
2. Docker build job validates API image build.
3. Status checks are required before merge.
