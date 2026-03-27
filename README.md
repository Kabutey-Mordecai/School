<<<<<<< HEAD

# EduCore SMS

Week 1 foundation for EduCore SMS based on the internal development brief.

## Monorepo Layout

- `api` - Node.js + Express + Prisma backend (TypeScript)
- `web` - React admin web app with Vite (TypeScript)
- `mobile` - React Native app placeholder (scaffold pending)
- `shared` - shared role/type contracts
- `docs` - execution planning and sprint backlog

## What's Implemented (Sprint 1 P1 Features)

### Backend API

1. **Authentication** - register, login, refresh tokens with JWT roles
2. **Students Module** - CRUD for student profiles and enrollment
3. **Attendance Module** - mark, track, and report daily/subject attendance
4. **Gradebook Module** - marks entry and student report cards
5. **Role-Based Access Control** - Admin, Teacher, Parent, Student, Accountant

### Web Admin Dashboard

1. **Protected Routes** - authenticated access with role guards
2. **Auth Store** - Zustand state for tokens and user context
3. **Login Page** - credential form with demo account support
4. **Dashboard** - welcome page with navigation
5. **Students Pages** - view student list from API
6. **Navigation Placeholders** - Attendance and Grades pages ready for implementation

## Quick Start

### 1) Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 12+ (for database)

### 2) Install Dependencies

```bash
npm install
```

### 3) Set Up Database

Copy the example environment file:

```bash
cp api/.env.example api/.env
```

Edit `api/.env` and set your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/educore"
JWT_ACCESS_SECRET="your-secret-here-min-16-chars"
JWT_REFRESH_SECRET="your-other-secret-min-16-chars"
```

### 4) Run Migrations and Seed Data

npm --workspace api run prisma:migrate
npm --workspace api run prisma:seed

````

This creates the demo school and 5 test users (admin, teacher, parent, student, accountant) with password `ChangeMe123!`.

### 5) Start Development Servers

In separate terminals:

```bash
# Terminal 1: Backend API (http://localhost:4000)
npm run dev:api

# Terminal 2: Web Admin Dashboard (http://localhost:5173)
npm run dev:web
````

### 6) Access the Admin Dashboard

1. Open http://localhost:5173 in your browser
2. You'll be redirected to `/login`
3. Use demo account:
   - **Email**: `admin@educore.local`
   - **Password**: `ChangeMe123!`
   - **School ID**: (check output from seed script or get from DB)

## Useful Scripts

### Development

```bash
npm run dev:api      # Run API with tsx watch
npm run dev:web      # Run web app with Vite
npm run setup        # Generate Prisma client (run after schema changes)
```

### Build & Validation

```bash
npm run build:api    # Compile API TypeScript
npm run build:web    # Bundle web app for production
npm run lint:api     # Typecheck API
npm run lint:web     # Typecheck web app
```

### Database

```bash
npm --workspace api run prisma:migrate    # Apply pending migrations
npm --workspace api run prisma:seed       # Reseed demo data
npm --workspace api run prisma:generate   # Regenerate Prisma client
```

## API Documentation

See [api/API.md](api/API.md) for comprehensive endpoint reference.

### Quick API Examples

**Login:**

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "school-uuid",
    "email": "admin@educore.local",
    "password": "ChangeMe123!"
  }'
```

**List Students:**

```bash
curl http://localhost:4000/api/v1/students \
  -H "Authorization: Bearer <accessToken>"
```

**Mark Attendance:**

```bash
curl -X POST http://localhost:4000/api/v1/attendance \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student-uuid",
    "classId": "class-uuid",
    "date": "2024-03-24",
    "status": "PRESENT"
  }'
```

## Planning & Tracking

- [Sprint 1 Backlog](docs/sprint-backlog.md) - Feature tickets with acceptance criteria
- [Week 1 Execution Plan](docs/week1-execution-pack.md) - Delivery roadmap and risks

## Architecture

### Tech Stack

**Frontend:**

- React 18, TypeScript, Vite, React Router v6, Zustand

**Backend:**

- Express, Prisma ORM, Zod validation, JWT auth, bcrypt passwords

**Database:**

- PostgreSQL with Prisma migrations

**Infrastructure:**

- Docker-ready (add Dockerfile)
- CI/CD with GitHub Actions (add workflows)

### Key Conventions

1. **Error Handling** - All errors use `HttpError` class and standard status codes
2. **Validation** - Input validated with Zod schemas before service layer
3. **Auth** - Required role middleware on all protected routes
4. **Naming** - Services handle business logic, routes handle HTTP only
5. **Types** - All Prisma types imported from `@prisma/client`

## Next Steps

### Sprint 2 Features (Weeks 7-12)

- Finance module (invoicing, payments, mobile money integration)
- Messaging (teacher-parent chat, bulk SMS)
- React Native mobile app scaffold

### Phase 2+ Features

- Timetable & class scheduling
- Hostel/boarding management
- Multi-branch support

## Debugging

### Common Issues

**Port 4000 already in use:**

```bash
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process
```

**Database connection failed:**

- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env` is correct
- Run `npm --workspace api run prisma:migrate` to sync schema

**Prisma type errors in editor:**

```bash
npm --workspace api run prisma:generate
```

**Web app not connecting to API:**

- Check Vite proxy config in `web/vite.config.ts`
- Ensure API is running on port 4000
- Clear browser cache and refresh

## Contributing

- Create feature branches from `main`
- Submit PRs with tests and documentation
- Use conventional commit messages
- # Ensure `npm run lint:api` and `npm run lint:web` pass before merge

# School

Repository for the School project

> > > > > > > 79c06ce9ba611a9eff69832fc06f809f03602e01
