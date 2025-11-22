# TinyLink - Complete Installation & Setup Guide

## ✅ Prerequisites

Before starting, ensure you have:

- **Node.js 18+** ([Download](https://nodejs.org))
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (local or cloud - see options below)
- **Git** (optional, for cloning)
- **Code Editor** (VS Code recommended)

## 🗄️ MongoDB Setup

Choose one of these options:

### Option A: Local MongoDB (Recommended for Development)

**Windows:**
1. Download MongoDB Community: https://www.mongodb.com/try/download/community
2. Run installer, select "Install MongoDB as a Windows Service"
3. MongoDB will start automatically
4. Connection string: `mongodb://localhost:27017/tinylink`

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
# Connection string: mongodb://localhost:27017/tinylink
```

**Linux (Ubuntu/Debian):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
# Connection string: mongodb://localhost:27017/tinylink
```

**Verify MongoDB is running:**
```bash
# Should connect without errors
mongosh
# Type 'exit' to quit
```

### Option B: MongoDB Atlas (Cloud Database)

1. Sign up at [mongodb.com/cloud](https://mongodb.com/cloud)
2. Create free cluster
3. Add IP address to whitelist (0.0.0.0/0 for development)
4. Create database user with username/password
5. Get connection string from "Connect" button
6. Connection string format:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tinylink?retryWrites=true&w=majority
   ```

## 📦 Backend Installation

### Step 1: Navigate to Backend

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

Expected packages:
```
express         - Web framework
mongoose        - MongoDB driver
dotenv          - Environment variables
cors            - Cross-origin requests
typescript      - Type safety
tsx             - TS runner for development
```

### Step 3: Configure Environment

Create `.env` file from template:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tinylink
FRONTEND_URL=http://localhost:5173
```

**For MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tinylink?retryWrites=true&w=majority
```

### Step 4: Start Backend

**Development Mode (Recommended):**
```bash
npm run dev
```

Expected output:
```
✓ MongoDB connected successfully
✓ Server running on http://localhost:5000
✓ Environment: development
✓ Frontend URL: http://localhost:5173
```

**Production Build:**
```bash
npm run build    # Compiles TypeScript to dist/
npm run start    # Runs compiled code
```

### Verify Backend is Working

```bash
# Test health endpoint
curl http://localhost:5000/healthz
# Expected: {"ok":true,"version":"1.0"}
```

## 🎨 Frontend Installation

### Step 1: Navigate to Frontend

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

Expected packages:
```
react           - UI library
react-dom       - DOM rendering
react-router-dom - Routing
axios           - HTTP client
tailwindcss     - CSS framework
vite            - Build tool
typescript      - Type safety
```

### Step 3: Configure Environment

Create `.env.local` file from template:

```bash
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```
VITE_API_URL=http://localhost:5000
```

**Important:** The variable must start with `VITE_` for Vite to expose it to the client.

### Step 4: Start Frontend

**Development Mode:**
```bash
npm run dev
```

Expected output:
```
  VITE v7.1.7  ready in 256 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

The application will open automatically or you can navigate to: `http://localhost:5173`

## ✨ Verify Complete Setup

### 1. Test Health Endpoint
```bash
curl http://localhost:5000/healthz
# Response: {"ok":true,"version":"1.0"}
```

### 2. Create a Link
```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{"longUrl":"https://github.com"}'
# Response: {"success":true,"data":{...}}
```

### 3. Visit Frontend
Open browser to `http://localhost:5173`

You should see:
- TinyLink header
- Dashboard page
- Empty state "No links yet"
- Link creation form
- No console errors

### 4. Create Link in UI
1. Enter URL: `https://www.google.com`
2. Leave custom code blank (auto-generate)
3. Click "Create Link"
4. Success message appears
5. Link appears in table

### 5. Click on Link
1. In table, click "Stats" button
2. Should navigate to `/stats/XXXX`
3. See detailed statistics

### 6. Copy URL
1. In table, click "Copy" button
2. Should see "Copied to clipboard!" alert
3. Short URL is in clipboard

### 7. Test Redirect
1. Copy short URL from stats page
2. Paste in new tab: `http://localhost:5000/SHORTCODE`
3. Should redirect to Google
4. Go back to stats page
5. Click count should have increased

## 🐛 Troubleshooting

### MongoDB Connection Error
**Error:** `MongooseError: connect ECONNREFUSED`

**Solution:**
```bash
# Check if MongoDB is running
mongosh  # If this works, MongoDB is running

# If using local MongoDB:
# Windows: Check Services → MongoDB Server
# macOS: brew services list | grep mongodb
# Linux: sudo systemctl status mongod

# If using Atlas: Check connection string in .env
# Make sure IP whitelist includes your computer
```

### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
# Windows:
netstat -ano | findstr :5000

# macOS/Linux:
lsof -i :5000

# Kill the process (Windows):
taskkill /PID <PID> /F

# Kill the process (macOS/Linux):
kill -9 <PID>

# Or use different port:
PORT=3000 npm run dev
```

### CORS Error
**Error:** `Cross-Origin Request Blocked`

**Solution:**
1. Ensure backend is running
2. Check `FRONTEND_URL` in backend `.env`
3. Should match frontend URL exactly:
   ```
   Frontend: http://localhost:5173
   Backend .env: FRONTEND_URL=http://localhost:5173
   ```
4. Restart backend after changing .env

### Vite API Connection Error
**Error:** `Cannot fetch from http://localhost:5000`

**Solution:**
1. Check `VITE_API_URL` in frontend `.env.local`
2. Should be `http://localhost:5000`
3. Restart frontend dev server after changing .env
4. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### TypeScript Compilation Error
**Error:** `Cannot find module 'express'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear TypeScript cache
rm -rf dist
npm run build
```

### Frontend Build Error
**Error:** `error during build: 'import' and 'export' may only appear at the top level`

**Solution:**
```bash
cd frontend
rm -rf node_modules dist package-lock.json .env
npm install
npm run build
```

## 🚀 Development Workflow

### Terminal Setup

Keep 3 terminals open:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Keep running (shows logs)
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Keep running (shows logs)
```

**Terminal 3 - Testing:**
```bash
# Use for curl commands, git commands, etc.
curl http://localhost:5000/healthz
```

### Hot Reload

- **Backend:** Changes reload automatically (tsx watch)
- **Frontend:** Changes reload automatically (Vite HMR)
- **MongoDB Schema:** Changes require server restart

### Making Changes

1. Edit code in your editor
2. Save file
3. Changes reflect immediately in browser/terminal
4. Check browser console for errors

## 📁 Project Structure After Setup

```
Tiny-url/
├── README.md                 # Start here!
├── ARCHITECTURE.md          # Design explanation
├── INSTALLATION.md          # This file
│
├── backend/
│   ├── node_modules/        # Dependencies
│   ├── dist/                # Compiled output (after build)
│   ├── src/
│   │   ├── config/
│   │   │   └── index.ts
│   │   ├── controllers/
│   │   │   └── linkController.ts
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   ├── models/
│   │   │   └── Link.ts
│   │   ├── routes/
│   │   │   ├── apiRoutes.ts
│   │   │   └── redirectRoutes.ts
│   │   ├── utils/
│   │   │   ├── codeGenerator.ts
│   │   │   └── database.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                 # Don't commit!
│   ├── .env.example         # Template
│   └── README.md
│
└── frontend/
    ├── node_modules/        # Dependencies
    ├── dist/                # Built files (after build)
    ├── public/              # Static assets
    ├── src/
    │   ├── components/
    │   │   ├── Header.tsx
    │   │   ├── LinkForm.tsx
    │   │   └── LinkTable.tsx
    │   ├── pages/
    │   │   ├── Dashboard.tsx
    │   │   └── Stats.tsx
    │   ├── hooks/
    │   │   └── useApi.ts
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.tsx
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.local           # Don't commit!
    ├── .env.example         # Template
    └── README.md
```

## 📚 What To Do Next

1. **Explore the code:**
   - Start with `backend/src/app.ts`
   - Then `frontend/src/App.tsx`
   - Read ARCHITECTURE.md for understanding

2. **Make changes:**
   - Add a new feature
   - Modify styling
   - Update validation

3. **Test thoroughly:**
   - Use curl for API testing
   - Use browser DevTools for frontend
   - Check MongoDB documents in mongosh

4. **Deploy:**
   - See backend README for Railway/Render
   - See frontend README for Vercel
   - Use DEPLOYMENT.md for step-by-step guide

## 🤝 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| MongoDB won't connect | Check if running, verify connection string |
| CORS errors | Check FRONTEND_URL in backend .env |
| Frontend can't reach API | Check VITE_API_URL in frontend .env.local |
| Port 5000 in use | Kill process or use PORT=3000 npm run dev |
| Blank frontend page | Check browser console, verify backend is running |
| TypeScript errors | Delete node_modules, run npm install again |
| Changes not appearing | Hard refresh browser (Ctrl+Shift+R) |

## ✅ Setup Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB running locally or Atlas connected
- [ ] Backend installed (`npm install`)
- [ ] Backend .env configured
- [ ] Backend running (`npm run dev`)
- [ ] Health check working (`curl localhost:5000/healthz`)
- [ ] Frontend installed (`npm install`)
- [ ] Frontend .env.local configured
- [ ] Frontend running (`npm run dev`)
- [ ] Frontend opens without errors
- [ ] Can create link in UI
- [ ] Redirect works
- [ ] Stats page updates click count

## 📞 Getting Help

If something goes wrong:

1. **Check error message** - Often tells you the exact problem
2. **Check browser console** - Frontend errors shown there
3. **Check terminal output** - Backend errors shown there
4. **Review README files** - In backend/ and frontend/
5. **Check ARCHITECTURE.md** - Understand how it works

---

**Next Step:** Read [README.md](./README.md) for full overview and [ARCHITECTURE.md](./ARCHITECTURE.md) for design details.
