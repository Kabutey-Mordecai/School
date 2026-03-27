{"name": "@educore/api"}

# EduCore API Reference

## Base URL

```
http://localhost:4000/api/v1
```

## Authentication

All endpoints (except auth) require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

## Endpoints

### Auth Module (`/auth`)

#### Register

**POST** `/auth/register`

Create a new user account.

Request:

```json
{
  "schoolId": "school-id",
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ADMIN"
}
```

Response: `201 Created`

```json
{
  "user": {
    "id": "user-id",
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN",
    "schoolId": "school-id"
  },
  "tokens": {
    "accessToken": "jwt-token",
    "refreshToken": "jwt-token"
  }
}
```

#### Login

**POST** `/auth/login`

Authenticate and receive tokens.

Request:

```json
{
  "schoolId": "school-id",
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}
```

Response: `200 OK` (same as register response)

#### Refresh Token

**POST** `/auth/refresh`

Obtain a new access token using a refresh token.

Request:

```json
{
  "refreshToken": "jwt-token"
}
```

Response: `200 OK`

```json
{
  "accessToken": "new-jwt-token",
  "refreshToken": "new-jwt-token"
}
```

---

### Students Module (`/students`)

#### List Students

**GET** `/students`

Retrieve all students in the school.

Query Parameters:

- `isActive` (boolean): Filter by active status
- `classId` (string): Filter by class enrollment

Roles: ADMIN, TEACHER

Response: `200 OK`

```json
{
  "items": [
    {
      "id": "student-id",
      "schoolId": "school-id",
      "studentCode": "STU001",
      "firstName": "Jane",
      "lastName": "Smith",
      "dateOfBirth": "2010-05-15T00:00:00Z",
      "enrollmentDate": "2024-01-15T00:00:00Z",
      "isActive": true,
      "createdAt": "2024-01-15T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

#### Get Student

**GET** `/students/:id`

Retrieve a specific student by ID.

Roles: ADMIN, TEACHER, PARENT

Response: `200 OK` (single student object)

#### Create Student

**POST** `/students`

Add a new student.

Roles: ADMIN

Request:

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "studentCode": "STU001",
  "dateOfBirth": "2010-05-15"
}
```

Response: `201 Created` (student object)

#### Update Student

**PATCH** `/students/:id`

Update student information.

Roles: ADMIN

Request: (any of the create fields)

```json
{
  "firstName": "Janet"
}
```

Response: `200 OK` (updated student object)

#### Deactivate Student

**DELETE** `/students/:id`

Mark a student as inactive.

Roles: ADMIN

Response: `200 OK` (deactivated student object)

---

### Attendance Module (`/attendance`)

#### List Attendance

**GET** `/attendance`

Retrieve attendance records.

Query Parameters:

- `studentId` (string): Filter by student
- `classId` (string): Filter by class
- `date` (ISO date string): Filter by date

Roles: ADMIN, TEACHER

Response: `200 OK`

```json
{
  "items": [
    {
      "id": "record-id",
      "schoolId": "school-id",
      "studentId": "student-id",
      "classId": "class-id",
      "date": "2024-03-24T00:00:00Z",
      "subject": "Mathematics",
      "status": "PRESENT",
      "markedByUserId": "user-id",
      "createdAt": "2024-03-24T10:30:00Z"
    }
  ]
}
```

#### Get Attendance Record

**GET** `/attendance/:id`

Retrieve specific attendance record.

Roles: ADMIN, TEACHER

Response: `200 OK` (single record)

#### Mark Attendance

**POST** `/attendance`

Record attendance for a student.

Roles: ADMIN, TEACHER

Request:

```json
{
  "studentId": "student-id",
  "classId": "class-id",
  "date": "2024-03-24",
  "subject": "Mathematics",
  "status": "PRESENT"
}
```

Status values: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`

Response: `201 Created` (attendance record)

#### Update Attendance

**PATCH** `/attendance/:id`

Change attendance status.

Roles: ADMIN, TEACHER

Request:

```json
{
  "status": "LATE"
}
```

Response: `200 OK` (updated record)

#### Delete Attendance

**DELETE** `/attendance/:id`

Remove an attendance record.

Roles: ADMIN, TEACHER

Response: `200 OK` (deleted record)

---

### Gradebook Module (`/gradebook`)

#### Create Grade Entry

**POST** `/gradebook/grades`

Enter marks for a student.

Roles: ADMIN, TEACHER

Request:

```json
{
  "studentId": "student-id",
  "classId": "class-id",
  "term": "Term 1",
  "subject": "Mathematics",
  "score": 85,
  "maxScore": 100
}
```

Response: `201 Created`

#### Get Grades by Class

**GET** `/gradebook/grades/class/:classId/:term`

Retrieve all grades for a class in a term.

Roles: ADMIN, TEACHER

Response: `200 OK` (array of grade records with student details)

#### Get Student Report

**GET** `/gradebook/report/:studentId/:term`

Retrieve a report card for a student.

Roles: ADMIN, TEACHER, PARENT

Response: `200 OK`

```json
{
  "student": {
    /* student object */
  },
  "term": "Term 1",
  "grades": [
    /* array of grades */
  ],
  "summary": {
    "totalScore": 500,
    "totalPossible": 600,
    "percentage": 83
  }
}
```

#### Update Grade

**PATCH** `/gradebook/grades/:id`

Modify a grade entry.

Roles: ADMIN, TEACHER

Request:

```json
{
  "score": 88
}
```

Response: `200 OK` (updated grade)

#### Delete Grade

**DELETE** `/gradebook/grades/:id`

Remove a grade entry.

Roles: ADMIN, TEACHER

Response: `200 OK` (deleted grade)

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message"
}
```

Common status codes:

- `400` - Validation error
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (e.g., duplicate record)
- `500` - Server error

---

## Demo Account

After running `npm --workspace api run prisma:seed`, use:

- **Email**: `admin@educore.local`
- **Password**: `ChangeMe123!`
- **School ID**: (auto-generated in seed output)
- **Role**: ADMIN (or any of the 5 roles)
