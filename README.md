# Team Task Manager

**Full-stack team productivity platform for project tracking, task assignment, role-based collaboration, and workflow visibility.**

Team Task Manager is a MERN-style full-stack application for organizing team projects, assigning tasks, tracking progress, and viewing dashboard-level productivity metrics. It includes a React/Vite frontend, Node.js/Express REST API, MongoDB/Mongoose data models, JWT authentication, project membership, admin/member permissions, and Railway deployment configuration.

> **Project status**  
> This is a portfolio full-stack project with working frontend and backend code. It is designed to demonstrate full-stack engineering, API design, authentication, role-based project workflows, and deployment readiness. It is not presented as a production SaaS product.

## Why This Project Matters

Team productivity apps are common in real companies because teams need visibility into ownership, deadlines, project progress, and overdue work. This project demonstrates the engineering patterns behind that type of SaaS workflow:

- User registration and login
- Authenticated API access with JWT
- Project creation and membership
- Admin/member authorization rules
- Task assignment, priority, status, and due dates
- Dashboard analytics for task progress and overdue work
- Frontend routing and API integration
- MongoDB data modeling with relationships between users, projects, and tasks

For full-stack, React, backend, and junior software roles, this project is stronger than a basic todo app because it includes teams, projects, members, permissions, dashboard stats, and deployment configuration.

## Key Features

| Feature | Description |
| --- | --- |
| Authentication | Signup and login using JWT and hashed passwords |
| Project management | Create projects, view project details, delete projects as admin |
| Team collaboration | Add and remove project members by email |
| Role-based access | Project admins can manage members/tasks; members can update assigned task status |
| Task management | Create, assign, update, and delete tasks with status, priority, and due date |
| My Tasks view | Shows tasks assigned to the logged-in user |
| Dashboard metrics | Tracks total tasks, status counts, overdue tasks, and tasks per user |
| Responsive frontend | React/Vite UI with dashboard, projects, project detail, auth, and task views |
| Deployment config | Railway/Nixpacks configuration for full-stack deployment |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Axios, CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt/bcryptjs |
| API | REST API, JSON responses, auth middleware |
| Deployment | Railway, Nixpacks |
| Runtime | Node.js 20+ |

## System Architecture

```text
User
  |
  v
React + Vite Frontend
  |
  | Axios requests with JWT bearer token
  v
Express REST API
  |
  | Auth middleware verifies JWT
  v
Route Modules
  |-- /api/auth
  |-- /api/projects
  |-- /api/tasks
  |-- /api/dashboard
  |
  v
Mongoose Models
  |-- User
  |-- Project
  |-- Task
  |
  v
MongoDB Database
```

## User Workflow

```text
Sign up / log in
  |
  v
Create a project
  |
  v
Project creator becomes admin
  |
  v
Admin adds team members by email
  |
  v
Admin creates and assigns tasks
  |
  v
Members view assigned tasks
  |
  v
Members update task status
  |
  v
Dashboard summarizes progress and overdue work
```

## Core Modules

| Module | Responsibility |
| --- | --- |
| Auth | User registration, login, password hashing, JWT creation |
| Auth middleware | Validates bearer tokens and attaches the authenticated user to requests |
| Projects | Project CRUD, membership, admin/member permission checks |
| Tasks | Task assignment, status updates, admin/member update rules |
| Dashboard | Aggregates task counts, status totals, overdue tasks, and user workload |
| Frontend pages | Login, signup, dashboard, projects, project detail, and personal task views |

## API Endpoints

Base path:

```text
http://localhost:5000/api
```

### Auth

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | No | Register a new user |
| `POST` | `/auth/login` | No | Log in and receive JWT |

### Projects

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/projects` | Yes | List projects for the logged-in user |
| `POST` | `/projects` | Yes | Create a project and become admin |
| `GET` | `/projects/:id` | Yes | Get project details if user is a member |
| `DELETE` | `/projects/:id` | Admin | Delete a project and its tasks |
| `GET` | `/projects/:id/members` | Yes | List project members |
| `POST` | `/projects/:id/members` | Admin | Add a member by email |
| `DELETE` | `/projects/:id/members/:userId` | Admin | Remove a project member |
| `GET` | `/projects/:id/tasks` | Yes | List project tasks |
| `POST` | `/projects/:id/tasks` | Admin | Create a project task |

### Tasks

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/tasks/mine` | Yes | Get tasks assigned to the logged-in user |
| `PATCH` | `/tasks/:id` | Yes | Admin can update task fields; assigned member can update status |
| `DELETE` | `/tasks/:id` | Admin | Delete a task |

### Dashboard

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/dashboard` | Yes | Get task totals, status counts, overdue tasks, and task distribution |
| `GET` | `/health` | No | Backend health check |

## Database Schema / Data Model

### User

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String | Required |
| `email` | String | Required, unique, lowercase |
| `password` | String | Hashed password |
| `avatar_color` | String | UI avatar color |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

### Project

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String | Required |
| `description` | String | Optional |
| `color` | String | UI project color |
| `created_by` | ObjectId -> User | Project owner |
| `members` | Array | User references with `admin` or `member` role |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

### Project Member

| Field | Type | Notes |
| --- | --- | --- |
| `user` | ObjectId -> User | Required |
| `role` | `admin` or `member` | Defaults to `member` |
| `joinedAt` | Date | Defaults to current date |

### Task

| Field | Type | Notes |
| --- | --- | --- |
| `project` | ObjectId -> Project | Required |
| `title` | String | Required |
| `description` | String | Optional |
| `status` | `todo`, `inprogress`, `done` | Defaults to `todo` |
| `priority` | `low`, `medium`, `high` | Defaults to `medium` |
| `due_date` | Date | Optional |
| `assigned_to` | ObjectId -> User | Optional |
| `created_by` | ObjectId -> User | Required |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

## Local Development Setup

### Prerequisites

- Node.js 20+
- MongoDB Atlas or local MongoDB connection string
- npm

### 1. Clone the repository

```bash
git clone https://github.com/Harshitsharma010/Team-Task-Manager.git
cd Team-Task-Manager
```

### 2. Install dependencies

```bash
npm install --prefix server
npm install --prefix frontend
```

### 3. Configure backend environment

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

### 4. Run the backend

```bash
npm run dev --prefix server
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 5. Run the frontend

Open a second terminal:

```bash
npm run dev --prefix frontend
```

Frontend:

```text
http://localhost:5173
```

## Environment Variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port. Defaults to `5000` |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWT tokens |
| `CLIENT_URL` | No | Frontend URL for CORS. Defaults to `http://localhost:5173` |
| `NODE_ENV` | No | Set to `production` for serving the built frontend from Express |

### Frontend

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Optional | API base URL. Defaults to `/api` |

Example `frontend/.env` for local development:

```env
VITE_API_URL=http://localhost:5000/api
```

## Project Structure

```text
Team-Task-Manager/
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   `-- main.jsx
|   |-- package.json
|   `-- vite.config.js
|-- server/
|   |-- middleware/
|   |   `-- auth.js
|   |-- routes/
|   |   |-- auth.js
|   |   |-- dashboard.js
|   |   |-- projects.js
|   |   `-- tasks.js
|   |-- index.js
|   |-- initDB.js
|   `-- package.json
|-- nixpacks.toml
|-- package.json
`-- README.md
```

## Screenshots / Demo Proof

Add proof here after capturing the working app.

| Proof | Status |
| --- | --- |
| Login/signup screen | `[Add Screenshot]` |
| Dashboard screen | `[Add Screenshot]` |
| Projects list | `[Add Screenshot]` |
| Project detail with tasks | `[Add Screenshot]` |
| Task modal / create task flow | `[Add Screenshot]` |
| API response from Postman or browser | `[Add API Docs]` |
| Short walkthrough video | `[Add Demo Video]` |
| Live deployment | `[Add Live Demo]` |

Suggested file paths:

```text
docs/screenshots/login.png
docs/screenshots/dashboard.png
docs/screenshots/projects.png
docs/screenshots/project-detail.png
docs/screenshots/task-modal.png
```

## Deployment Plan

This repository includes `nixpacks.toml` for Railway-style deployment.

### Railway deployment flow

1. Push the repository to GitHub.
2. Create a Railway project from the GitHub repo.
3. Add backend environment variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
NODE_ENV=production
```

4. Railway uses `nixpacks.toml` to:
   - Install backend dependencies.
   - Install frontend dependencies.
   - Build the React frontend.
   - Start the Express server in production mode.

In production mode, Express serves the built frontend from `frontend/dist`.

### Railway environment checklist

If Railway shows one deployment succeeding and another deployment failing for the same commit, check whether you have multiple Railway services connected to the same GitHub repository. Each service needs its own environment variables.

Required variables for the full-stack service:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
NODE_ENV=production
```

Optional variable:

```env
CLIENT_URL=https://your-frontend-or-railway-domain
```

Common failure causes:

- `MONGO_URI` is missing or invalid.
- `JWT_SECRET` is missing.
- A duplicate Railway service is still connected to the repository but does not have the required variables.
- The service is deploying the wrong root directory or using stale settings.

If one Railway service is already working, keep that as the active deployment and disconnect or delete the duplicate failing service to avoid noisy failed deployment history.

## Limitations

This project is scoped as a portfolio full-stack application. The current implementation demonstrates the main workflow, but the following improvements would make it stronger:

- No automated test suite is included yet.
- No CI/CD workflow is configured yet.
- Role support currently uses `admin` and `member`; deeper workspace roles can be added later.
- The app does not yet include email invitations or real-time notifications.
- API documentation is README-based; generated OpenAPI docs are not included yet.
- Production hardening would require rate limiting, stronger validation, logging, monitoring, and secrets management.

## Future Improvements

| Area | Improvement |
| --- | --- |
| Authentication | Add password reset, email verification, and refresh token flow |
| Authorization | Expand role-based access control for owners, admins, members, and viewers |
| Notifications | Add due-date reminders and assignment notifications |
| Analytics | Add charts for completion rate, workload, overdue tasks, and project velocity |
| Testing | Add backend API tests and frontend component tests |
| CI/CD | Add GitHub Actions for linting, build checks, and deployment validation |
| Docker | Add Dockerfile and Docker Compose for local full-stack setup |
| API Docs | Add OpenAPI/Swagger documentation |
| Cloud | Add deployment guide for Railway, Render, or AWS |
| UX | Add drag-and-drop task boards, filters, search, and improved empty states |

## License

This project is intended for educational, portfolio, and full-stack engineering learning purposes.
