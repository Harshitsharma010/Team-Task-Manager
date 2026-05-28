# Nexus Command Center

<p align="center">
  <strong>Full-Stack Team Task Management Platform</strong>
</p>

<p align="center">
  A collaboration-focused task management application built with React, Node.js, Express, MongoDB, and JWT authentication.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green" />
  <img src="https://img.shields.io/badge/Database-MongoDB-brightgreen" />
  <img src="https://img.shields.io/badge/Auth-JWT-orange" />
  <img src="https://img.shields.io/badge/Deployment-Railway-purple" />
</p>

---

## Project Overview

**Nexus Command Center** is a full-stack team execution and task management platform designed for project-based collaboration.

It allows users to create projects, manage team members, assign tasks, track task progress, add comments, and view dashboard analytics for team workload and project status.

This project is built as a portfolio-ready full-stack application to demonstrate:

| Area | What This Project Demonstrates |
|---|---|
| Full-Stack Development | React frontend connected with Express REST APIs |
| Authentication | JWT-based signup, login, and protected routes |
| Backend Engineering | Modular Express routes, middleware, and API structure |
| Database Design | MongoDB/Mongoose models with user-project-task relationships |
| Authorization | Admin/member role-based permissions |
| Collaboration Features | Project members, task assignment, comments, and status updates |
| Dashboard Logic | Aggregated metrics for tasks, workload, overdue items, and progress |
| Deployment Readiness | Railway/Nixpacks configuration for production deployment |

---

## Live Demo

| Resource | Link |
|---|---|
| Live App | Coming Soon |
| Demo Workspace | Available through one-click demo login |
| Backend Health Check | `/api/health` |

> Add your Railway deployment link here after deployment.

---

## Key Features

| Feature | Description |
|---|---|
| User Authentication | Secure signup and login using JWT and hashed passwords |
| Demo Workspace | One-click demo workspace with seeded sample data |
| Project Management | Create projects, view project details, and organize team work |
| Team Members | Add and remove project members using email |
| Role-Based Access | Project admins manage tasks and members; members update assigned task status |
| Task Assignment | Assign tasks to project members with status, priority, and due date |
| Task Workflow | Track tasks through `todo`, `inprogress`, `review`, and `done` stages |
| Task Comments | Add comments to tasks for discussion and collaboration history |
| My Tasks View | View all tasks assigned to the logged-in user |
| Dashboard Analytics | Track completed, pending, review, overdue, and due-soon tasks |
| Workload Summary | View member-wise workload distribution |
| Production Config | Railway/Nixpacks setup for full-stack deployment |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router |
| Styling | CSS |
| API Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT, bcrypt/bcryptjs |
| API Style | REST API |
| Deployment | Railway |
| Build System | Nixpacks |
| Runtime | Node.js 20+ |

---

## System Architecture

```text
User
  |
  v
React + Vite Frontend
  |
  | Axios API requests with JWT bearer token
  v
Express REST API
  |
  | Auth middleware validates token
  v
Route Modules
  |
  |-- /api/auth
  |-- /api/projects
  |-- /api/tasks
  |-- /api/dashboard
  |
  v
Mongoose Models
  |
  |-- User
  |-- Project
  |-- Task
  |
  v
MongoDB Database
```

---

## User Workflow

| Step | Action |
|---|---|
| 1 | User signs up or logs in |
| 2 | User creates a project |
| 3 | Project creator becomes project admin |
| 4 | Admin adds members by email |
| 5 | Admin creates and assigns tasks |
| 6 | Members view assigned tasks |
| 7 | Members update task status |
| 8 | Team discusses tasks through comments |
| 9 | Dashboard displays project and workload summary |

---

## Core Modules

| Module | Responsibility |
|---|---|
| Authentication | Handles signup, login, password hashing, and JWT generation |
| Auth Middleware | Protects private routes and attaches authenticated user data |
| Projects | Handles project creation, member management, and project permissions |
| Tasks | Handles task creation, assignment, status updates, comments, and deletion |
| Dashboard | Aggregates task status, overdue work, due-soon work, and workload data |
| Frontend Pages | Provides landing, auth, dashboard, projects, project board, and task views |

---

## API Endpoints

Base API URL:

```bash
http://localhost:5000/api
```

---

### Authentication Routes

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/auth/signup` | No | Register a new user |
| POST | `/auth/login` | No | Log in user and return JWT |
| POST | `/auth/demo` | No | Create or enter demo workspace |

---

### Project Routes

| Method | Endpoint | Auth Required | Permission | Description |
|---|---|---|---|---|
| GET | `/projects` | Yes | User | Get projects where user is a member |
| POST | `/projects` | Yes | User | Create a new project |
| GET | `/projects/:id` | Yes | Project Member | Get project details |
| DELETE | `/projects/:id` | Yes | Admin | Delete project and its tasks |
| GET | `/projects/:id/members` | Yes | Project Member | Get project members |
| POST | `/projects/:id/members` | Yes | Admin | Add member by email |
| DELETE | `/projects/:id/members/:userId` | Yes | Admin | Remove project member |
| GET | `/projects/:id/tasks` | Yes | Project Member | Get project tasks |
| POST | `/projects/:id/tasks` | Yes | Admin | Create task inside project |

---

### Task Routes

| Method | Endpoint | Auth Required | Permission | Description |
|---|---|---|---|---|
| GET | `/tasks/mine` | Yes | User | Get tasks assigned to logged-in user |
| GET | `/tasks/:id/comments` | Yes | Project Member | Get comments for a task |
| POST | `/tasks/:id/comments` | Yes | Project Member | Add comment to task |
| PATCH | `/tasks/:id` | Yes | Admin / Assigned Member | Update task details or status |
| DELETE | `/tasks/:id` | Yes | Admin | Delete task |

---

### Dashboard Routes

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/dashboard` | Yes | Get task totals, overdue tasks, due-soon tasks, status counts, and workload |
| GET | `/health` | No | Check backend health |

---

## Database Design

### User Model

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | String | Yes | User's full name |
| `email` | String | Yes | Unique lowercase email |
| `password` | String | Yes | Hashed user password |
| `avatar_color` | String | No | UI avatar color |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Update timestamp |

---

### Project Model

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | String | Yes | Project name |
| `description` | String | No | Project description |
| `color` | String | No | UI project color |
| `created_by` | ObjectId → User | Yes | User who created the project |
| `members` | Array | Yes | Project members with role information |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Update timestamp |

---

### Project Member Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `user` | ObjectId → User | Yes | Project member reference |
| `role` | `admin` / `member` | Yes | Member permission level |
| `joinedAt` | Date | Auto | Date member joined project |

---

### Task Model

| Field | Type | Required | Description |
|---|---|---|---|
| `project` | ObjectId → Project | Yes | Project linked to the task |
| `title` | String | Yes | Task title |
| `description` | String | No | Task details |
| `status` | `todo` / `inprogress` / `review` / `done` | Yes | Current task status |
| `priority` | `low` / `medium` / `high` | Yes | Task priority |
| `due_date` | Date | No | Task due date |
| `assigned_to` | ObjectId → User | No | Assigned project member |
| `created_by` | ObjectId → User | Yes | User who created the task |
| `comments` | Array | No | Task discussion comments |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Update timestamp |

---

### Task Comment Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `user` | ObjectId → User | Yes | Comment author |
| `message` | String | Yes | Comment text |
| `createdAt` | Date | Auto | Comment timestamp |

---

## Local Development Setup

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20+ |
| npm | Latest stable |
| MongoDB | MongoDB Atlas or local MongoDB |

---

### 1. Clone the Repository

```bash
git clone https://github.com/Harshitsharma010/Team-Task-Manager.git
cd Team-Task-Manager
```

---

### 2. Install Dependencies

Install backend dependencies:

```bash
npm install --prefix server
```

Install frontend dependencies:

```bash
npm install --prefix frontend
```

---

### 3. Configure Environment Variables

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Optional frontend `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 4. Run Backend Server

```bash
npm run dev --prefix server
```

Backend runs at:

```bash
http://localhost:5000
```

Health check:

```bash
http://localhost:5000/api/health
```

---

### 5. Run Frontend App

Open another terminal and run:

```bash
npm run dev --prefix frontend
```

Frontend runs at:

```bash
http://localhost:5173
```

---

## Environment Variables

### Backend Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Backend server port |
| `MONGO_URI` | Yes | None | MongoDB connection string |
| `JWT_SECRET` | Yes | None | Secret key used to sign JWT tokens |
| `CLIENT_URL` | No | `http://localhost:5173` | Frontend URL for CORS |
| `NODE_ENV` | No | `development` | App environment |

---

### Frontend Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `/api` | API base URL used by frontend |

---

## Project Structure

```text
Team-Task-Manager/
|
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   `-- main.jsx
|   |
|   |-- package.json
|   `-- vite.config.js
|
|-- server/
|   |-- middleware/
|   |   `-- auth.js
|   |
|   |-- routes/
|   |   |-- auth.js
|   |   |-- dashboard.js
|   |   |-- projects.js
|   |   `-- tasks.js
|   |
|   |-- index.js
|   |-- initDB.js
|   `-- package.json
|
|-- nixpacks.toml
|-- package.json
`-- README.md
```

---

## Screenshots

Add screenshots after running or deploying the application.

| Screen | Preview |
|---|---|
| Login Page | Add screenshot |
| Dashboard | Add screenshot |
| Projects Page | Add screenshot |
| Project Board | Add screenshot |
| Task Modal | Add screenshot |

Recommended screenshot paths:

```text
docs/screenshots/login.png
docs/screenshots/dashboard.png
docs/screenshots/projects.png
docs/screenshots/project-board.png
docs/screenshots/task-modal.png
```

After adding screenshots, replace the table above with:

| Screen | Screenshot |
|---|---|
| Login Page | ![Login Page](docs/screenshots/login.png) |
| Dashboard | ![Dashboard](docs/screenshots/dashboard.png) |
| Projects Page | ![Projects Page](docs/screenshots/projects.png) |
| Project Board | ![Project Board](docs/screenshots/project-board.png) |
| Task Modal | ![Task Modal](docs/screenshots/task-modal.png) |

---

## Deployment

This project includes `nixpacks.toml` for Railway-style full-stack deployment.

### Railway Deployment Flow

| Step | Action |
|---|---|
| 1 | Push the project to GitHub |
| 2 | Create a new Railway project |
| 3 | Connect the GitHub repository |
| 4 | Add required environment variables |
| 5 | Railway installs dependencies, builds frontend, and starts Express server |
| 6 | Express serves the built React app in production |

---

### Required Railway Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secure JWT signing secret |
| `NODE_ENV` | Yes | Set to `production` |

Optional:

| Variable | Required | Description |
|---|---|---|
| `CLIENT_URL` | No | Railway or custom frontend URL |

---

### Common Deployment Issues

| Issue | Possible Cause |
|---|---|
| App crashes on startup | Missing `MONGO_URI` or invalid database connection |
| Login/signup not working | Missing or weak `JWT_SECRET` |
| CORS error | Incorrect `CLIENT_URL` |
| Frontend not loading | Frontend build path not found |
| Railway deploys wrong service | Wrong root directory or duplicate service setup |

---

## Current Limitations

| Limitation | Status |
|---|---|
| Automated tests | Not added yet |
| CI/CD workflow | Not added yet |
| Swagger/OpenAPI docs | Not added yet |
| Email invitations | Not added yet |
| Real-time notifications | Not added yet |
| Advanced roles | Currently supports `admin` and `member` |
| Production monitoring | Not added yet |
| Rate limiting | Not added yet |

---

## Future Improvements

| Area | Planned Improvement |
|---|---|
| Authentication | Add password reset, email verification, and refresh token flow |
| Authorization | Add owner, admin, member, and viewer roles |
| Notifications | Add task assignment and due-date reminders |
| Real-Time Features | Add WebSocket-based live updates |
| Analytics | Add charts for velocity, completion rate, and project health |
| Testing | Add backend API tests and frontend component tests |
| CI/CD | Add GitHub Actions build and test pipeline |
| Docker | Add Dockerfile and Docker Compose setup |
| API Docs | Add Swagger/OpenAPI documentation |
| Cloud | Add AWS or Render deployment guide |
| UX | Add saved filters, keyboard shortcuts, and better notification states |

---

## Resume Value

This project demonstrates practical full-stack engineering skills.

| Skill Area | Evidence in Project |
|---|---|
| React Development | Multi-page frontend with routing, API calls, and state handling |
| Backend Development | Express REST API with modular route structure |
| Authentication | JWT-based protected routes |
| Authorization | Admin/member project-level permissions |
| Database Design | User, Project, Task, Member, and Comment relationships |
| API Design | REST endpoints for auth, projects, tasks, and dashboard |
| Product Thinking | Real team workflow instead of a simple todo app |
| Deployment Readiness | Railway/Nixpacks production configuration |

Suggested resume line:

> Built a full-stack team task management platform with JWT authentication, project membership, role-based task workflows, comments, dashboard analytics, and Railway deployment configuration using React, Node.js, Express, and MongoDB.

---

## Repository Topics

Recommended GitHub topics:

```text
react
vite
nodejs
express
mongodb
mongoose
jwt-authentication
rest-api
task-manager
project-management
full-stack
railway
nixpacks
```

---

## License

This project is intended for educational, portfolio, and full-stack engineering learning purposes.
