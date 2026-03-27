# Quick Start - 2 Minutes

## Prerequisites

- Node.js 18+, npm 9+, PostgreSQL 12+
- Git

## 1. Clone & Install

```bash
cd /path/to/School
npm install
```

## 2. Configure Database

```bash
cp api/.env.example api/.env
# Edit api/.env and set your PostgreSQL URL
```

Edit `api/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/educore"
JWT_ACCESS_SECRET="min-16-chars-secret-string"
JWT_REFRESH_SECRET="another-min-16-char-secret"
```

## 3. Initialize Database

```bash
npm --workspace api run prisma:migrate
npm --workspace api run prisma:seed
```

This creates the schema and loads demo data.

## 4. Run Both Servers

**Terminal 1:**

```bash
npm run dev:api
```

**Terminal 2:**

```bash
npm run dev:web
```

## 5. Open Dashboard

**http://localhost:5173**

Login:

- Email: `admin@educore.local`
- Password: `ChangeMe123!`
- School ID: Check seed output or query DB

## 6. Try An API Call

```bash
# Get access token
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "from-seed-output",
    "email": "admin@educore.local",
    "password": "ChangeMe123!"
  }'

# List students
curl http://localhost:4000/api/v1/students \
  -H "Authorization: Bearer <accessToken-from-above>"
```

See [api/API.md](../api/API.md) for full endpoint reference.

## Troubleshooting

| Issue                 | Solution                                                      |
| --------------------- | ------------------------------------------------------------- |
| Port 4000 in use      | Kill process or change `PORT` in `.env`                       |
| Can't connect to DB   | Check DATABASE_URL, ensure PostgreSQL is running              |
| Type errors in editor | Run `npm --workspace api run prisma:generate`                 |
| Web won't load        | Clear browser cache, check Vite proxy in `web/vite.config.ts` |

## Next Steps

- Create a student: `POST /api/v1/students`
- Mark attendance: `POST /api/v1/attendance`
- Enter grades: `POST /api/v1/gradebook/grades`
- Build Attendance & Grades pages in web app

See [docs/](../docs) for planning, architecture, backlog, and completion summary.
