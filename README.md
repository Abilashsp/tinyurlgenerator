# 🔗 TinyLink - URL Shortener Application

A **production-grade full-stack URL shortener** with secure authentication, user management, and click analytics. Built with Node.js, Express, React, MongoDB, TypeScript, and Tailwind CSS.

## 🎯 What This App Does

TinyLink is a comprehensive URL shortening service that allows users to:

- **Create shortened URLs** - Convert long URLs into short, shareable links
- **Customize shortcodes** - Create memorable custom short URLs (e.g., `/github` instead of `/abc123`)
- **Track clicks** - Monitor how many times each link has been accessed
- **View statistics** - See detailed analytics including last click timestamp
- **User authentication** - Secure email/password registration and login
- **Per-user link management** - Each user can only manage their own links
- **Dashboard** - User-friendly interface to create, view, and manage links
- **Statistics page** - View click counts and engagement metrics for each link

### Key Features

✨ **Authentication & Security**
- Email + Password authentication with bcrypt hashing (12 salt rounds)
- JWT tokens (Access: 15 min, Refresh: 7 days) stored in HttpOnly secure cookies
- Rate limiting (brute force, spam protection)
- CSRF protection with SameSite cookies
- SQL/NoSQL injection prevention with input validation

🔐 **User Management**
- Secure user registration with password strength validation
- Login with session management
- Auto token refresh every 10 minutes
- Logout with cookie clearing
- User email display in dashboard

📊 **Link Management**
- Create unlimited short links
- Auto-generated 6-8 character codes (alphanumeric)
- Optional custom shortcodes
- Click tracking with timestamps
- Delete links when no longer needed
- Per-user link filtering (privacy)

🎨 **User Interface**
- Modern glassmorphic design with cyan/blue/purple theme
- Responsive layouts (mobile & desktop)
- Real-time form validation
- Password strength indicator
- Loading states and error messages
- Smooth transitions and animations

## 📁 Project Structure

```
Tiny-url/
├── backend/                           # Node.js + Express API (Port 5000)
│   ├── src/
│   │   ├── app.ts                    # Express app setup
│   │   ├── server.ts                 # Entry point
│   │   ├── config/
│   │   │   └── index.ts              # Database config
│   │   ├── common/
│   │   │   └── security/
│   │   │       ├── config.ts         # Helmet, CORS, rate limiting
│   │   │       └── jwt.ts            # Token generation/verification
│   │   ├── features/
│   │   │   └── auth/                 # Authentication module
│   │   │       ├── controllers/
│   │   │       │   └── authController.ts    # Register, login, logout, me, refresh
│   │   │       ├── middlewares/
│   │   │       │   ├── authMiddleware.ts    # JWT verification
│   │   │       │   └── validationMiddleware.ts # Input validation with Joi
│   │   │       ├── models/
│   │   │       │   └── User.ts              # User schema with bcrypt
│   │   │       └── routes/
│   │   │           └── authRoutes.ts        # Auth endpoints
│   │   ├── controllers/
│   │   │   └── linkController.ts     # Link CRUD operations
│   │   ├── middleware/
│   │   │   └── errorHandler.ts       # Error handling
│   │   ├── models/
│   │   │   └── Link.ts               # Link schema (with userId)
│   │   ├── routes/
│   │   │   ├── apiRoutes.ts          # /api/links endpoints
│   │   │   └── redirectRoutes.ts     # /:code redirect logic
│   │   └── utils/
│   │       ├── codeGenerator.ts      # Generate shortcodes
│   │       └── database.ts           # MongoDB connection
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── .env.example
│
└── frontend/                          # React + Vite (Port 5173)
    ├── src/
    │   ├── App.tsx                   # Main app with routes
    │   ├── main.tsx                  # Entry point
    │   ├── components/
    │   │   ├── Header.tsx            # Navigation header (hidden on auth pages)
    │   │   ├── LinkForm.tsx          # Create link form
    │   │   ├── LinkTable.tsx         # Display links table
    │   │   ├── ProtectedRoute.tsx    # Auth route guard
    │   │   └── ...
    │   ├── pages/
    │   │   ├── Login.tsx             # Login page
    │   │   ├── Register.tsx          # Registration page
    │   │   ├── Dashboard.tsx         # Main dashboard
    │   │   ├── Stats.tsx             # Link statistics
    │   │   └── Redirect.tsx          # Redirect handler
    │   ├── context/
    │   │   ├── AuthContext.tsx       # Auth state management
    │   │   └── useAuth.ts            # Auth hook
    │   ├── hooks/
    │   │   └── useApi.ts             # API client with credentials
    │   └── types/
    │       └── index.ts              # TypeScript types
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.ts
    ├── tsconfig.json
    ├── .env
    └── .env.example
```

## 🚀 Installation Guide

### Prerequisites

- **Node.js** 18+ (Download from [nodejs.org](https://nodejs.org))
- **MongoDB** (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud)
- **npm** or **yarn** package manager

### Step 1: Clone and Navigate

```bash
# Clone the repository
git clone <repository-url>
cd Tiny-url
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your settings
```

**Edit `backend/.env`:**
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tinylink

# JWT
JWT_ACCESS_SECRET=your-secure-access-secret-key-here
JWT_REFRESH_SECRET=your-secure-refresh-secret-key-here

# Cookies
COOKIE_SECRET=your-secure-cookie-secret-key-here

# Environment
NODE_ENV=development
FRONTEND_URL=http://localhost:5174
```

**Start backend server:**
```bash
npm run dev
# Backend running on http://localhost:5000
```

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Edit `frontend/.env`:**
```env
VITE_API_URL=http://localhost:5000
```

**Start frontend server:**
```bash
npm run dev
# Frontend running on http://localhost:5173
```

### Step 4: Access the Application

Open your browser and navigate to:
- **Application:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Docs:** See AUTHENTICATION_GUIDE.md for endpoint details

## 🔑 Authentication Flow

1. **Register** - User creates account with email and strong password
2. **Login** - User authenticates with email/password
3. **Token Generation** - Backend creates JWT access (15m) and refresh (7d) tokens
4. **Cookie Storage** - Tokens stored in HttpOnly secure cookies
5. **Protected Routes** - Frontend redirects unauthenticated users to login
6. **Auto Refresh** - Frontend automatically refreshes access token every 10 minutes
7. **Logout** - User logs out, cookies are cleared

## 💾 Database Schema

### User Collection
```json
{
  "_id": ObjectId,
  "email": "user@example.com",       // Unique, indexed
  "passwordHash": "bcrypt_hash",     // Never selected by default
  "createdAt": "2025-01-01T...",
  "updatedAt": "2025-01-01T..."
}
```

### Link Collection
```json
{
  "_id": ObjectId,
  "code": "abc123",                  // 6-8 chars, unique
  "longUrl": "https://github.com/...",
  "userId": ObjectId,                // Reference to User, indexed
  "clicks": 42,
  "lastClicked": "2025-01-15T...",
  "createdAt": "2025-01-01T...",
  "updatedAt": "2025-01-15T..."
}
```

## 📡 API Endpoints

### Authentication (Public)

**Register User**
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 201 Created
{
  "ok": true,
  "user": { "id": "...", "email": "..." }
}
```

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "ok": true,
  "user": { "id": "...", "email": "..." }
}
```

**Logout**
```
POST /api/auth/logout
Response: 200 OK
```

**Get Current User**
```
GET /api/auth/me
Response: 200 OK
{
  "ok": true,
  "user": { "id": "...", "email": "..." }
}
```

### Link Management (Authenticated)

**Create Link**
```
POST /api/links
Body: { "longUrl": "https://...", "code": "optional" }
Response: 201 Created
```

**Get All Links**
```
GET /api/links
Response: 200 OK - Array of user's links
```

**Get Link Stats**
```
GET /api/links/:code
Response: 200 OK - Link details with click count
```

**Delete Link**
```
DELETE /api/links/:code
Response: 200 OK
```

### Redirect (Public)

**Access Short Link**
```
GET /:code
Response: 302 Redirect to original URL
(Increments click counter)
```

## 🧪 Quick Test

### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt
```

### Create a Short Link
```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "longUrl": "https://github.com/torvalds/linux",
    "code": "github"
  }'
```

### View Your Links
```bash
curl http://localhost:5000/api/links \
  -b cookies.txt
```

## 🔒 Security Features

- ✅ **Bcrypt hashing** - Passwords hashed with 12 salt rounds
- ✅ **JWT authentication** - Secure token-based auth
- ✅ **HttpOnly cookies** - Prevents XSS access to tokens
- ✅ **CSRF protection** - SameSite=Strict cookies
- ✅ **Rate limiting** - Login (5/15min), Register (3/hour)
- ✅ **Input validation** - Joi schemas, email/password strength
- ✅ **CORS** - Restricted to localhost (5173, 5174, 3000)
- ✅ **Helmet** - Security headers (CSP, HSTS, X-Frame-Options)
- ✅ **Generic errors** - No user enumeration

## 📦 Technologies Used

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- bcrypt (password hashing)
- jsonwebtoken (JWT auth)
- joi (input validation)
- helmet (security headers)
- express-rate-limit
- TypeScript

**Frontend:**
- React 19.1.1
- React Router v6
- Axios (HTTP client)
- Tailwind CSS 3.4.1
- TypeScript
- Vite 7.2.4

## 📖 Additional Documentation

- See `AUTHENTICATION_GUIDE.md` for detailed authentication flow and Postman testing
- See `ARCHITECTURE.md` for technical architecture details
- See `DEPLOYMENT.md` for production deployment guide

## 📝 License

This project is open source and available under the MIT License.

### Health Check
```
GET /healthz
Response: { ok: true, version: "1.0" }
```

### Create Link
```
POST /api/links
Body: { longUrl: string, code?: string }
Response: { success: true, data: Link }
Status: 201 (success), 400 (invalid), 409 (code exists)
```

### Get All Links
```
GET /api/links
Response: { success: true, data: Link[] }
Status: 200
```

### Get Link Stats
```
GET /api/links/:code
Response: { success: true, data: Link }
Status: 200 (ok), 404 (not found)
```

### Delete Link
```
DELETE /api/links/:code
Response: { success: true, message: "Link deleted successfully" }
Status: 200 (deleted), 404 (not found)
```

### Redirect to Original URL
```
GET /:code
Response: Redirect 302 to original URL
Status: 302 (redirect), 404 (not found)
Action: Increments click count, updates lastClicked timestamp
```

## 🗄️ Database Schema

### Link Document
```json
{
  "_id": ObjectId,
  "code": "abc123",              // 6-8 alphanumeric, unique
  "longUrl": "https://...",      // Valid URL
  "clicks": 42,                  // Click count
  "lastClicked": "2024-01-15...", // Last click timestamp
  "createdAt": "2024-01-01...",  // Creation timestamp
  "updatedAt": "2024-01-15..."   // Last update timestamp
}
```

**Shortcode Validation:** `[A-Za-z0-9]{6,8}` (case-insensitive)

## 🧪 Testing the Application

### 1. Health Check
```bash
curl http://localhost:5000/healthz
# Expected: {"ok":true,"version":"1.0"}
```

### 2. Create Link (Auto-generated code)
```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{"longUrl":"https://github.com/torvalds/linux"}'
# Expected: {"success":true,"data":{"code":"abc123","longUrl":"...","clicks":0,"lastClicked":null,"createdAt":"..."}}
```

### 3. Create Link (Custom code)
```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{"longUrl":"https://example.com","code":"github"}'
# Expected: 201 Created with link data
```

### 4. Get All Links
```bash
curl http://localhost:5000/api/links
# Expected: {"success":true,"data":[...]}
```

### 5. Get Link Stats
```bash
curl http://localhost:5000/api/links/abc123
# Expected: {"success":true,"data":{...}}
```

### 6. Test Redirect (increments clicks)
```bash
curl -L http://localhost:5000/abc123
# Expected: 302 redirect to original URL
# Click count should increase
```

### 7. Test Duplicate Code (409 Conflict)
```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{"longUrl":"https://example.com","code":"github"}'
# Expected: 409 Conflict with error message
```

### 8. Delete Link
```bash
curl -X DELETE http://localhost:5000/api/links/abc123
# Expected: 200 OK
# Subsequent redirects should return 404
```

### 9. Test 404 After Deletion
```bash
curl http://localhost:5000/abc123
# Expected: 404 Not Found
```

## 🎨 Frontend Architecture

### Pages

**Dashboard (`/`)**
- Create new shortened links
- View all links in table format
- Delete links
- Copy short URLs to clipboard
- Navigate to stats page

**Stats (`/stats/:code`)**
- View detailed statistics for a link
- Display click count (auto-updates every 5 seconds)
- Show original URL
- Display creation and last-clicked timestamps
- Copy short URL button

### Components

**Header**
- Navigation bar with TinyLink logo
- Link to dashboard

**LinkForm**
- Input for long URL (required)
- Input for custom code (optional, 6-8 alphanumeric)
- Form validation
- Error and success messages
- Loading state

**LinkTable**
- Responsive table of all links
- Display: code, URL (truncated), clicks, created date
- Actions: View Stats, Copy URL, Delete
- Loading states for delete actions

### Custom Hooks

**useLinks()**
```typescript
const { links, loading, error, fetchLinks, createLink, deleteLink } = useLinks();
```

**useLinkStats(code)**
```typescript
const { link, loading, error, fetchStats } = useLinkStats(code);
```

## 🔑 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tinylink
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000
```

## 🚢 Deployment

### Backend Deployment (Railway or Render)

#### Railway
1. Sign up at [railway.app](https://railway.app)
2. Create new project
3. Add MongoDB plugin
4. Connect GitHub repo
5. Set environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=<Railway MongoDB URL>`
   - `FRONTEND_URL=<Your Vercel frontend URL>`
6. Deploy!

#### Render
1. Sign up at [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Settings:
   - Build: `npm install && npm run build`
   - Start: `npm run start`
   - Add environment variables
5. Deploy!

### Frontend Deployment (Vercel)

1. Sign up at [vercel.com](https://vercel.com)
2. Import GitHub project
3. Set environment variables:
   - `VITE_API_URL=https://your-backend-url.com`
4. Deploy!

Vercel auto-detects Vite and handles the build.

## 📋 Autograding Checklist

- [ ] **Health Check**
  - [ ] GET /healthz returns { ok: true, version: "1.0" }
  
- [ ] **Create Links**
  - [ ] POST /api/links with longUrl creates link
  - [ ] Auto-generates 6-8 character shortcode
  - [ ] Custom code accepted if 6-8 alphanumeric
  - [ ] Returns 400 for invalid URL
  - [ ] Returns 409 for duplicate shortcode
  
- [ ] **List Links**
  - [ ] GET /api/links returns all links
  - [ ] Each link has code, longUrl, clicks, lastClicked, createdAt
  
- [ ] **Link Stats**
  - [ ] GET /api/links/:code returns specific link
  - [ ] Returns 404 if not found
  
- [ ] **Delete Link**
  - [ ] DELETE /api/links/:code removes link
  - [ ] Returns 404 if not found
  
- [ ] **Redirect**
  - [ ] GET /:code redirects to original URL (302)
  - [ ] Increments click count
  - [ ] Updates lastClicked timestamp
  - [ ] Returns 404 after deletion
  
- [ ] **Frontend**
  - [ ] Dashboard displays all links
  - [ ] Can create new link
  - [ ] Can delete link
  - [ ] Can view stats
  - [ ] Copy-to-clipboard works
  - [ ] Form validation works
  
- [ ] **Database**
  - [ ] MongoDB connection works
  - [ ] Shortcodes are unique
  - [ ] Timestamps are correct

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify MongoDB is running
- Check MONGODB_URI in backend .env
- Ensure database is accessible from your network

### CORS Error
- Verify FRONTEND_URL in backend .env matches frontend URL
- Check backend is running before frontend

### API Not Responding
- Check backend is running on correct port
- Verify VITE_API_URL in frontend .env matches backend URL
- Check browser console for network errors

### Build Errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📖 Documentation

- [Backend README](./backend/README.md) - API documentation
- [Frontend README](./frontend/README.md) - Frontend setup

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- CORS
- dotenv

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Axios

## 📝 License

MIT

## 🎯 Assignment

Built for the TinyLink Take-Home Assignment - Production-ready URL Shortener

---

**Last Updated:** January 2024
