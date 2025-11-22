# TinyLink Authentication System - Complete Setup & Testing Guide

## 🎯 Quick Start

### 1. Start Backend
```powershell
cd D:\Abi\Tiny-url\backend
npm run dev
```
✅ Expect: "Server running on http://localhost:5000"

### 2. Start Frontend
```powershell
cd D:\Abi\Tiny-url\frontend
npm run dev
```
✅ Expect: "Local: http://localhost:5174"

### 3. Test in Browser
- Go to **http://localhost:5174**
- Click **Sign Up**
- Enter email & strong password (must have: uppercase, lowercase, number, special char)
- ✅ Should redirect to Dashboard

---

## 🔐 Authentication Flow

### Registration
```
POST /api/auth/register
Body: { email: "user@example.com", password: "SecurePass123!" }
Response: { ok: true, user: { id, email, createdAt } }
Cookies: accessToken (15m), refreshToken (7d) - both HttpOnly
```

### Login
```
POST /api/auth/login
Body: { email: "user@example.com", password: "SecurePass123!" }
Response: { ok: true, user: { id, email, createdAt } }
Cookies: accessToken (15m), refreshToken (7d) - both HttpOnly
```

### Get Current User
```
GET /api/auth/me
Requires: Valid accessToken in cookie
Response: { ok: true, user: { id, email, createdAt, updatedAt } }
```

### Logout
```
POST /api/auth/logout
Response: { ok: true }
Effect: Clears both cookies
```

### Refresh Token
```
POST /api/auth/refresh
Requires: Valid refreshToken in cookie
Response: { ok: true }
Effect: Issues new accessToken
```

---

## 📝 Testing with Postman

### Setup
1. Download Postman
2. Create new collection: "TinyLink Auth"
3. Set base URL: `http://localhost:5000`
4. Enable "Automatically follow redirects"

### 1. Register User
- **Method**: POST
- **URL**: `{{base_url}}/api/auth/register`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON):
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Expected**: 201 Created
- **Response**:
  ```json
  {
    "ok": true,
    "message": "User registered successfully",
    "user": {
      "id": "...",
      "email": "john@example.com",
      "createdAt": "2025-11-21T..."
    }
  }
  ```
- **Cookies Set**: `accessToken`, `refreshToken` (HttpOnly)

### 2. Get Current User
- **Method**: GET
- **URL**: `{{base_url}}/api/auth/me`
- **Headers**: None needed (cookies auto-sent)
- **Expected**: 200 OK
- **Response**:
  ```json
  {
    "ok": true,
    "user": {
      "id": "...",
      "email": "john@example.com",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
  ```

### 3. Create Link (Protected)
- **Method**: POST
- **URL**: `{{base_url}}/api/links`
- **Headers**: None needed (auth via cookie)
- **Body** (JSON):
  ```json
  {
    "longUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "code": "rickroll"
  }
  ```
- **Expected**: 201 Created
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "code": "rickroll",
      "longUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "clicks": 0,
      "lastClicked": null,
      "createdAt": "..."
    }
  }
  ```

### 4. Get All Links (Protected)
- **Method**: GET
- **URL**: `{{base_url}}/api/links`
- **Expected**: 200 OK
- **Response**: Array of user's links only

### 5. Logout
- **Method**: POST
- **URL**: `{{base_url}}/api/auth/logout`
- **Expected**: 200 OK
- **Response**:
  ```json
  {
    "ok": true,
    "message": "Logout successful"
  }
  ```
- **Effect**: Cookies cleared

### 6. Try Protected Endpoint After Logout
- **Method**: GET
- **URL**: `{{base_url}}/api/auth/me`
- **Expected**: 401 Unauthorized
- **Response**:
  ```json
  {
    "ok": false,
    "error": "No access token provided",
    "code": "NO_TOKEN"
  }
  ```

---

## 🛡️ Security Features

✅ **Password Security**
- Bcrypt hashing with 12 salt rounds
- Minimum 8 characters
- Requires: uppercase, lowercase, number, special character

✅ **Token Security**
- JWT signed with HS256
- Access token: 15 minutes (short-lived)
- Refresh token: 7 days (long-lived)
- Both stored in HttpOnly cookies (XSS-proof)
- Separate signing keys

✅ **Rate Limiting**
- Login: 5 attempts per 15 minutes
- Register: 3 attempts per hour
- Global API: 100 requests per 15 minutes

✅ **CORS Protection**
- Restricts to specific origins (5173, 5174, 3000)
- Credentials: true (allows cookies)

✅ **Attack Prevention**
- CSRF: SameSite=Strict cookies
- XSS: HttpOnly cookies, CSP headers
- Injection: Joi schema validation
- Brute Force: Rate limiting + generic error messages
- Header Security: Helmet middleware

---

## 🚀 Browser Testing Checklist

- [ ] Register with valid email & strong password
- [ ] Dashboard loads after registration
- [ ] Create a short link
- [ ] View created links (only yours)
- [ ] View stats for a link
- [ ] Copy short link to clipboard
- [ ] Delete a link
- [ ] Click Logout
- [ ] Redirected to Login
- [ ] Try accessing /dashboard → redirects to /login
- [ ] Login with correct credentials
- [ ] Login with wrong password → error message
- [ ] Register with duplicate email → error message
- [ ] Register with weak password → error message

---

## 🔧 Environment Variables

**Backend** (`.env`):
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tinylink
FRONTEND_URL=http://localhost:5174

JWT_ACCESS_SECRET=test-access-secret-key-12345
JWT_REFRESH_SECRET=test-refresh-secret-key-12345
COOKIE_SECRET=test-cookie-secret-key-12345
```

⚠️ **Production**: Use strong random strings!

---

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase, indexed),
  passwordHash: String (bcrypt),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Link Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  code: String (unique),
  longUrl: String,
  clicks: Number,
  lastClicked: Date | null,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 🐛 Troubleshooting

### "Registration failed with 500"
- Check backend logs: `npm run dev` output
- Verify MongoDB is running
- Check `.env` file exists with secrets

### "CORS Error"
- Frontend running on 5173? Backend CORS accepts it
- Clear browser cookies: DevTools → Application → Cookies → Delete all
- Restart both servers

### "Token expired"
- Access token expires after 15 minutes
- Frontend auto-refreshes every 10 minutes (should be automatic)
- Manual refresh: `POST /api/auth/refresh`

### "Links not showing"
- Must be logged in (auth token required)
- Each user only sees their own links
- Check MongoDB has data: `db.links.find({userId: "..."})`

---

## 📦 Tech Stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- bcrypt (password hashing)
- jsonwebtoken (JWT)
- joi (validation)
- helmet (security headers)
- express-rate-limit (rate limiting)
- cookie-parser (cookie handling)

**Frontend**
- React 19 + TypeScript
- React Router v6
- Tailwind CSS
- Axios (with credentials)
- AuthContext (state management)

---

## ✨ Next Steps

1. ✅ Authentication system complete
2. ⏳ Optional: Add email verification
3. ⏳ Optional: Add password reset flow
4. ⏳ Optional: Add OAuth (Google, GitHub)
5. ⏳ Deploy to production (Railway + Vercel + MongoDB Atlas)

