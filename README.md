# Nexus — Team Task Manager

Full-stack task management app combining the **Nexus** frontend design with the **TeamTaskManager** backend.

## Tech Stack
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Frontend**: React 19 + Vite + React Router
- **Auth**: JWT + bcrypt
- **Deploy**: Railway

## Local Setup

### 1. Install dependencies
```bash
cd server && npm install
cd ../frontend && npm install
```

### 2. Configure backend
```bash
cp server/.env.example server/.env
```
Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://...your atlas uri.../nexus
JWT_SECRET=any_random_string
CLIENT_URL=http://localhost:5173
```

### 3. Run locally (two terminals)
```bash
# Terminal 1 — backend
cd server && npm start

# Terminal 2 — frontend  
cd frontend && npm run dev
```
Frontend → http://localhost:5173  
Backend → http://localhost:5000

## Railway Deployment

1. Push to GitHub
2. [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Set environment variables:
   ```
   MONGO_URI=your_atlas_connection_string
   JWT_SECRET=your_secret
   NODE_ENV=production
   ```
4. Railway runs `nixpacks.toml` → installs → builds frontend → starts server

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/signup | No | Register |
| POST | /api/auth/login | No | Login |
| GET | /api/projects | Yes | List projects |
| POST | /api/projects | Yes | Create project |
| GET | /api/projects/:id | Yes | Project detail |
| GET | /api/projects/:id/tasks | Yes | Project tasks |
| POST | /api/projects/:id/tasks | Admin | Create task |
| GET | /api/projects/:id/members | Yes | Members list |
| POST | /api/projects/:id/members | Admin | Add member |
| DELETE | /api/projects/:id/members/:uid | Admin | Remove member |
| DELETE | /api/projects/:id | Admin | Delete project |
| GET | /api/tasks/mine | Yes | My tasks |
| PATCH | /api/tasks/:id | Yes | Update task |
| DELETE | /api/tasks/:id | Admin | Delete task |
| GET | /api/dashboard | Yes | Dashboard stats |
