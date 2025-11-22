# TinyLink - Architecture & Design Document

## 🏗️ Architecture Overview

TinyLink follows a classic **3-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (React)                    │
│  - UI Components (Header, LinkForm, LinkTable)             │
│  - Pages (Dashboard, Stats)                                │
│  - Custom Hooks (useLinks, useLinkStats)                   │
│  - Routing (React Router)                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│               Backend Layer (Express)                        │
│  - Routes (API endpoints + Redirect)                        │
│  - Controllers (Request handlers)                           │
│  - Middleware (Error handling, validation)                  │
│  - Services (Business logic)                                │
│  - Models (TypeScript interfaces)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ MongoDB Wire Protocol
┌──────────────────────▼──────────────────────────────────────┐
│            Data Layer (MongoDB)                              │
│  - Link Documents                                           │
│  - Indexes (code)                                           │
└─────────────────────────────────────────────────────────────┘
```

## 📡 API Flow Diagram

### 1. Create Link Flow

```
User Input (Dashboard)
        ↓
LinkForm Component
        ↓
useLinks.createLink()
        ↓
POST /api/links (Axios)
        ↓
linkController.createLink()
        ↓
Validation:
  - URL format ✓
  - Shortcode format ✓
  - Uniqueness check ✓
        ↓
Link.create() → MongoDB
        ↓
Response: Link object with code, clicks, createdAt
        ↓
Frontend updates state
        ↓
UI refreshes with new link
```

### 2. Redirect Flow

```
User clicks short URL
        ↓
GET /:code
        ↓
linkController.redirectLink()
        ↓
Link.findOneAndUpdate() → increment clicks, set lastClicked
        ↓
MongoDB update
        ↓
res.redirect(302, longUrl)
        ↓
Browser follows redirect to original URL
```

### 3. Stats Page Flow

```
User navigates to /stats/:code
        ↓
Stats.tsx mounts
        ↓
useLinkStats(code) hook initializes
        ↓
fetchStats() called
        ↓
GET /api/links/:code (Axios)
        ↓
linkController.getLinkStats()
        ↓
Link.findOne({code})
        ↓
MongoDB finds document
        ↓
Response: Link with current click count
        ↓
Frontend renders Stats page
        ↓
Auto-refresh every 5 seconds (setInterval)
```

## 🗂️ Backend Structure in Detail

### Configuration Layer

```typescript
// src/config/index.ts
- Loads .env variables
- Validates required settings
- Exports typed config object
- Used throughout the app
```

### Models Layer

```typescript
// src/models/Link.ts
ILink Interface:
  - code: string (unique, 6-8 alphanumeric)
  - longUrl: string (valid URL)
  - clicks: number (default 0)
  - lastClicked: Date | null
  - createdAt: Date (auto)

Mongoose Schema:
  - Validation rules
  - Index on 'code' for fast lookups
  - Timestamps middleware
```

### Middleware Layer

```typescript
// src/middleware/errorHandler.ts
- AppError class: Custom error with statusCode
- errorHandler: Global error handler middleware
- asyncHandler: Wraps async route handlers

Error Flow:
  Throw AppError → caught by asyncHandler
  → passed to errorHandler → JSON response
```

### Controllers Layer

```typescript
// src/controllers/linkController.ts

createLink(req, res):
  1. Validate longUrl format
  2. If custom code provided:
     - Validate format
     - Check uniqueness (409 if exists)
  3. Else: Generate unique random code (retry up to 10 times)
  4. Create Link document
  5. Return 201 with link data

getAllLinks(req, res):
  1. Query all links sorted by date desc
  2. Return all links

getLinkStats(req, res):
  1. Query link by code
  2. Return 404 if not found
  3. Return link with stats

deleteLink(req, res):
  1. Delete link by code
  2. Return 404 if not found
  3. Return success message

redirectLink(req, res):
  1. Find link by code
  2. Return 404 if not found
  3. Increment clicks and set lastClicked
  4. Redirect 302 to original URL

healthCheck(req, res):
  1. Return { ok: true, version: "1.0" }
```

### Routes Layer

```typescript
// src/routes/apiRoutes.ts
POST   /api/links           → createLink
GET    /api/links           → getAllLinks
GET    /api/links/:code     → getLinkStats
DELETE /api/links/:code     → deleteLink

// src/routes/redirectRoutes.ts
GET    /:code               → redirectLink
```

### Utilities Layer

```typescript
// src/utils/codeGenerator.ts
- generateShortCode(length): Random alphanumeric string
- validateShortCode(code): Regex validation
- validateUrl(url): URL parsing validation

// src/utils/database.ts
- connectDB(): Connect to MongoDB
- disconnectDB(): Close connection
```

### Express App Setup

```typescript
// src/app.ts
1. CORS middleware (allows frontend origin)
2. JSON and URL-encoded parsers
3. Health check route
4. API routes prefix /api
5. Redirect routes (must be after API to avoid conflicts)
6. 404 handler
7. Global error handler
```

## 🎨 Frontend Structure in Detail

### Type Definitions

```typescript
// src/types/index.ts
Link interface:
  - code, longUrl, clicks, lastClicked, createdAt

CreateLinkPayload:
  - longUrl, code?

ApiResponse<T>:
  - success, data?, error?, message?, statusCode?
```

### Custom Hooks

```typescript
// src/hooks/useApi.ts

useLinks():
  - State: links[], loading, error
  - fetchLinks(): GET /api/links
  - createLink(payload): POST /api/links
  - deleteLink(code): DELETE /api/links/:code
  - setError(): Manual error control

useLinkStats(code):
  - State: link, loading, error
  - fetchStats(): GET /api/links/:code
```

### Components Layer

**Header Component**
- Displays TinyLink logo
- Navigation link to dashboard
- Responsive layout

**LinkForm Component**
- Input fields:
  - Long URL (required)
  - Custom code (optional, 6-8 alphanumeric)
- Validation:
  - Required field check
  - Custom code format validation
  - Client-side error messages
- States:
  - Loading (disable inputs during submission)
  - Success (temporary success message)
  - Error (persistent error until cleared)

**LinkTable Component**
- Responsive table of all links
- Columns: Code, Original URL, Clicks, Created Date, Actions
- Actions:
  - Stats: Navigate to /stats/:code
  - Copy: Copy short URL to clipboard
  - Delete: Delete link with confirmation
- Truncate long URLs with link preview
- Click count shown in badge

### Pages Layer

**Dashboard Page**
- Compose: Header (parent) → LinkForm + LinkTable
- Lifecycle:
  1. useEffect: fetchLinks() on mount
  2. Listen for createLink success → refresh list
  3. Handle delete with confirmation
- State management:
  - links from useLinks hook
  - deleting state for delete button feedback

**Stats Page**
- Param: :code from URL
- Lifecycle:
  1. useEffect: fetchStats() on mount
  2. setInterval: refresh stats every 5 seconds
3. Show "Link not found" if deleted
- Display:
  - Short URL with copy button
  - Click count (live updates)
  - Original URL (clickable)
  - Timestamps
  - Action buttons

### App Component

```typescript
// src/App.tsx
- Router setup
- Route definitions:
  - "/" → Dashboard
  - "/stats/:code" → Stats
- Layout wrapper:
  - Header (persistent)
  - Routes outlet
  - Gray background
```

## 🔄 State Management Strategy

### Backend State

**Database = Single Source of Truth**
- MongoDB stores all data
- Controllers fetch fresh data for each request
- No caching (for simplicity, but could be added)

### Frontend State

**Local Component State**
- useLinks hook state: links array, loading, error
- LinkForm: form inputs, local validation errors
- LinkTable: deleting state for each link

**URL State**
- React Router params: /stats/:code

**Server State**
- Fetched via Axios calls
- Refetched manually or on specific actions

**Not using Redux/Context** because:
- Simple CRUD operations
- Few shared states
- Custom hooks suffice

## 🛡️ Error Handling Strategy

### Backend Error Handling

```
AppError → thrown in controller
  ↓
asyncHandler → catches promise rejection
  ↓
Express middleware → calls errorHandler
  ↓
errorHandler → sends JSON response with statusCode
```

### Frontend Error Handling

```
API call in useApi hook
  ↓
Try/catch block
  ↓
Catch → setError() in hook state
  ↓
Component displays error message
  ↓
User can retry or dismiss
```

## 🔐 Validation Strategy

### Backend Validation

```
1. URL Format:
   - Use new URL(urlString) for validation
   - Regex pattern check as fallback

2. Shortcode Format:
   - Regex: /^[A-Za-z0-9]{6,8}$/
   - Case conversion to lowercase
   - Max 8 attempts to generate unique code

3. Uniqueness Check:
   - MongoDB unique index on 'code' field
   - findOne query before insert for custom codes
   - Returns 409 if duplicate
```

### Frontend Validation

```
1. Form Submission:
   - Required field checks
   - Format validation before API call
   - Prevents unnecessary requests

2. Error Messages:
   - API response errors (409, 400, 404)
   - Network errors
   - Validation errors

3. Loading States:
   - Disable form during submission
   - Show "Creating..." button text
```

## 📊 Database Indexing Strategy

```typescript
// Automatic indexes by Mongoose:
1. _id (always)
2. code (unique: true)
   - Why: Fast lookups for redirects
   - Lookup time: O(1) vs O(n)
   - Essential for redirect performance
```

## 🚀 Performance Considerations

### Backend
- **Index on code**: Constant time lookup for redirects
- **No N+1 queries**: Controllers fetch specific data needed
- **Connection pooling**: Mongoose manages pool
- **Async/await**: Non-blocking I/O

### Frontend
- **React 19**: Concurrent rendering, suspense support
- **Code splitting**: Vite handles dynamic imports
- **Tailwind CSS**: Purges unused styles in build
- **Stats auto-refresh**: 5-second interval (configurable)

## 🔄 API Request/Response Contract

### Success Response
```json
{
  "success": true,
  "data": { "code": "abc123", ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Short code already in use",
  "statusCode": 409
}
```

## 📋 Deployment Architecture

### Backend (Railway/Render)
```
GitHub Repo
  ↓
  Deploy Webhook
  ↓
  Install deps (npm install)
  ↓
  Build (npm run build)
  ↓
  Start (npm run start)
  ↓
  Server on fixed URL
```

### Frontend (Vercel)
```
GitHub Repo
  ↓
  Deploy Webhook
  ↓
  Install deps (npm install)
  ↓
  Build (npm run build)
  ↓
  Deploy dist/ to CDN
  ↓
  Environment variables injected
```

## 🔑 Key Design Decisions

### 1. Why No Authentication?
- Assignment requirement (none specified)
- Focus on core URL shortener logic
- Can be added: JWT tokens, user tables

### 2. Why Separate API and Redirect Routes?
- Prevents conflicts (/:code could match /api)
- Order matters: API routes first
- Clear separation of concerns

### 3. Why 6-8 Character Codes?
- Assignment specification
- Balance: readability vs uniqueness
- ~62^6 = 56 billion unique codes

### 4. Why MongoDB?
- Assignment requirement
- Document-oriented suits URL objects
- Easy to scale horizontally
- Mongoose provides type safety

### 5. Why React Hooks Over Class Components?
- Modern React standard
- Simpler code
- Better for small team projects
- Reusable logic (useLinks, useLinkStats)

## 🧪 Testing Strategy (Manual)

```
1. Health Check: curl /healthz
2. Create: curl POST /api/links
3. List: curl GET /api/links
4. Stats: curl GET /api/links/:code
5. Redirect: curl -L GET /:code
6. Delete: curl DELETE /api/links/:code
7. Duplicate: curl POST with existing code (409)
8. Invalid: curl POST with bad URL (400)
```

## 🎯 Scalability Considerations

### Current Implementation (Suitable for MVP)
- Single server
- Single MongoDB instance
- No caching
- No queuing

### Future Improvements
- **Redis Cache**: Cache popular links
- **Message Queue**: Use Bull for batch operations
- **CDN**: Serve frontend from CDN
- **Load Balancer**: Horizontal scaling
- **Read Replicas**: MongoDB replication
- **Analytics**: Separate analytics DB
- **Rate Limiting**: Prevent abuse
- **Authentication**: User accounts + API keys

---

**Last Updated:** January 2024
