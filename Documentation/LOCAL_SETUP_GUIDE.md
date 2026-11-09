# UConnect Local Setup Guide (Beginner Friendly)

This guide explains how to run the UConnect system on a new laptop or desktop.

It covers:

- What to install first
- How to configure the project
- How to run database, backend, and frontend
- How to verify everything is working
- Common fixes when something fails

---

## 1. What You Need (Requirements)

### Hardware (recommended)

- CPU: Intel i5 / Ryzen 5 or better
- RAM: 8 GB minimum (16 GB recommended)
- Free disk space: at least 5 GB

### Software (required)

1. Git
2. Node.js LTS (v20 or newer)
3. npm (comes with Node.js)
4. Laragon (Windows local server stack with auto MySQL)
5. A code editor (VS Code recommended)

### Why Laragon is required in this guide

- Laragon starts MySQL quickly with one click.
- It is simpler for non-coders than manual MySQL service setup.
- It avoids many common local database issues.

---

## 2. Install the Required Software (Laragon-first)

Install in this order:

1. Install Git

- Download from: https://git-scm.com/downloads
- Finish install using default options

2. Install Node.js LTS

- Download from: https://nodejs.org/
- Choose LTS version
- After install, restart terminal

3. Install Laragon (Windows)

- Download from: https://laragon.org/download/
- Install with default options
- Open Laragon and click Start All
- This starts MySQL automatically

4. Create or confirm DB credentials in Laragon

- Open Laragon as administrator > start all the service there is switch button there
- Default is usually host localhost and port 3306
- Use the credentials you configure in Laragon for backend .env

5. Install VS Code (optional but recommended)

- Download from: https://code.visualstudio.com/

---

## 3. Get the Project Source Code

If you already have the project folder, skip this section.

1. Open Terminal (PowerShell on Windows)
2. Go to your preferred folder
3. Clone the repository
4. Open project root folder named UConnect

---

## 4. Project Structure (Important)

Inside the UConnect folder, you should see:

- UConnect-Frontend
- UConnect-Backend
- Documentation

---

## 5. Configure Environment Files

Environment files store local settings (ports, URLs, DB credentials).

### Backend

Location: UConnect-Backend/.env

Expected keys:

- PORT
- FRONTEND_ORIGIN
- PUBLIC_BASE_URL
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- ADMIN_KEY

If .env does not exist, copy from:

- UConnect-Backend/.env.example then rename it to .env only

### Frontend

Location: UConnect-Frontend/.env

Expected key:

- API_BASE_URL

If .env does not exist, copy from:

- UConnect-Frontend/.env.example then rename it to .env only

---

## 6. Configure MySQL (Database)

The backend auto-creates the database and tables on startup, but MySQL service must be running and credentials must be correct.

1. Start MySQL service

- Open Laragon
- Click Start All
- Confirm MySQL is running in Laragon

2. Make sure backend .env matches your DB credentials

- DB_HOST=localhost
- DB_PORT=3306
- DB_USER=your_mysql_user
- DB_PASSWORD=your_mysql_password
- DB_NAME=uconnect

Notes:

- If your MySQL password is empty, set DB_PASSWORD to empty value.
- If DB_USER or DB_PASSWORD is wrong, backend will fail to connect.

---

## 7. Install Dependencies

Open two terminals (one for backend, one for frontend).

### Terminal A (Backend)

1. Go to UConnect-Backend
2. Run npm install

### Terminal B (Frontend)

1. Go to UConnect-Frontend
2. Run npm install

---

## 8. Run the System Locally

You need both servers running at the same time.

### Start Backend

In UConnect-Backend:

1. Run npm run dev
2. Wait for message similar to:
   UConnect API running at http://localhost:3000

### Start Frontend

In UConnect-Frontend:

1. Run npm start
2. Wait for message similar to:
   Local: http://localhost:4200/

---

## 9. Verify the System Is Working

1. Open browser:

- Main app: http://localhost:4200/
- Admin page: http://localhost:4200/admin

2. Health check (backend):

- http://localhost:3000/api/health
- Expected response: {"status":"healthy"}

3. Basic feature check:

- Home page loads announcements
- Map page loads locations
- Admin page can load list (with correct admin key for write actions)

---

## 10. Admin Access Notes

Admin actions (create/edit/delete announcements) require the admin key.

- The value is defined in backend .env under ADMIN_KEY
- Enter the same value in the Admin page key field

---

## 11. Common Problems and Fixes

### Problem: npm is not recognized

Fix:

- Reinstall Node.js LTS
- Restart terminal

### Problem: Port 3000 or 4200 already in use

Fix:

- Stop the process using that port, or
- Change PORT in backend .env
- Update frontend API_BASE_URL accordingly

### Problem: Backend fails with missing env variable

Fix:

- Open UConnect-Backend/.env
- Add missing key/value from UConnect-Backend/.env.example

### Problem: Database connection error

Fix:

- Ensure MySQL service is running
- Recheck DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in backend .env

### Problem: Frontend opens but no data loads

Fix:

- Ensure backend is running on expected URL
- Ensure frontend API_BASE_URL points to backend API
- Restart frontend after changing .env

---

## 12. Daily Start Checklist (Quick)

1. Open Laragon and click Start All (this starts MySQL)
2. Start backend: npm run dev (inside UConnect-Backend)
3. Start frontend: npm start (inside UConnect-Frontend)
4. Open http://localhost:4200/

---

## 13. First-Time Setup Checklist

1. Install Git, Node.js LTS, and Laragon
2. Clone project
3. Create backend .env from .env.example
4. Create frontend .env from .env.example
5. Run npm install in backend and frontend
6. Start backend and frontend
7. Open app in browser and verify

---
