# DEMO_FEEDBACK – Setup Guide

## Prerequisites

- **Node.js** (v16+)
- **MongoDB** (v4.4+ or MongoDB Atlas)

---

## 1. Install MongoDB

### Windows
- Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- Install and ensure the **MongoDB** service is running:
  ```cmd
  net start MongoDB
  ```

### macOS (Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongod
```

### MongoDB Atlas (Cloud)
- Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
- Copy the connection string and set `MONGODB_URI` in `backend/.env`

---

## 2. Environment Configuration

1. Copy the example env file (or use the provided `.env`):
   ```bash
   cd backend
   copy .env.example .env   # Windows
   # cp .env.example .env  # Linux/Mac
   ```

2. Edit `backend/.env` if needed:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/feedback_survey_system
   JWT_SECRET=feedback-survey-secret-2025
   PORT=5000
   ```

---

## 3. MongoDB Collections (Auto-Created)

Collections are created automatically by Mongoose when the app runs:

| Collection         | Model           | Purpose                           |
|--------------------|-----------------|-----------------------------------|
| `users`            | User            | Admins, faculty, students         |
| `feedbackforms`    | FeedbackForm    | Survey forms with questions       |
| `feedbackresponses`| FeedbackResponse| Submitted answers                 |

Indexes are defined in the models and applied on first connection.

---

## 4. Install Dependencies & Seed Data

```bash
# Backend
cd backend
npm install

# Optional: verify MongoDB connection first
npm run init-db

# Seed sample users and forms
npm run seed

# Frontend (from project root)
cd ..
npm install
```

The seed script creates:
- **Admin:** `Administrator` / `admin123`
- **Student:** `John Doe` / `password123`
- **Faculty:** `Dr. Jane Smith` / `password123`

(Login uses full name; email also works.)
- A sample feedback form and one response

---

## 5. Run the Project

### Option A: Use the batch script (Windows)
```cmd
start-backend.bat
```
This starts MongoDB service, backend, and frontend in separate windows.

### Option B: Manual start

**Terminal 1 – Backend**
```bash
cd backend
npm run dev
```
Backend runs at http://localhost:5000

**Terminal 2 – Frontend**
```bash
npm run dev
```
Frontend runs at http://localhost:5173

---

## 6. Verify Setup

1. Open http://localhost:5173
2. Log in with `Administrator` / `admin123`
3. You should see the dashboard and the sample feedback form

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `MongoDB connection failed` | Start MongoDB service: `net start MongoDB` (Windows) |
| `Port 5000 already in use` | Change `PORT` in `backend/.env` |
| `EADDRINUSE` | Another process is using the port; stop it or change the port |
| Seed fails | Ensure MongoDB is running and `backend/.env` has correct `MONGODB_URI` |
