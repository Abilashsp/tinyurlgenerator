# TinyLink Backend

A production-ready URL shortener API built with Node.js, Express, TypeScript, and MongoDB.

## Features

✅ Create shortened links with optional custom codes  
✅ Redirect to original URLs with click tracking  
✅ Get statistics for any shortened link  
✅ Delete links  
✅ Health check endpoint  
✅ CORS enabled for frontend integration  
✅ Full TypeScript support  
✅ MongoDB with Mongoose  

## API Endpoints

### Health Check
- **GET** `/healthz` - Returns `{ ok: true, version: "1.0" }`

### Links
- **POST** `/api/links` - Create a new shortened link
  - Body: `{ longUrl: string, code?: string }`
  - Returns: Link object with code, longUrl, clicks, lastClicked, createdAt
  - Status: 201 (created), 409 (code exists), 400 (invalid)

- **GET** `/api/links` - Get all links
  - Returns: Array of link objects

- **GET** `/api/links/:code` - Get stats for a specific link
  - Returns: Link object with stats
  - Status: 200 (ok), 404 (not found)

- **DELETE** `/api/links/:code` - Delete a link
  - Status: 200 (deleted), 404 (not found)

### Redirect
- **GET** `/:code` - Redirect to original URL
  - Increments click count and updates lastClicked
  - Status: 302 (redirect), 404 (not found)

## Shortcode Requirements

- Format: `[A-Za-z0-9]{6,8}` (6-8 alphanumeric characters)
- Case-insensitive (stored as lowercase)
- Must be globally unique
- Custom codes return 409 Conflict if already in use

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud like MongoDB Atlas)

### Install Dependencies
```bash
npm install
```

### Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tinylink
FRONTEND_URL=http://localhost:5173
```

### Development
```bash
npm run dev
```
Runs with `tsx watch` for hot reload.

### Build
```bash
npm run build
```
Compiles TypeScript to `dist/` folder.

### Production
```bash
npm run build
npm run start
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── index.ts          # Configuration from env vars
│   ├── controllers/
│   │   └── linkController.ts # Request handlers
│   ├── middleware/
│   │   └── errorHandler.ts   # Error handling & async wrapper
│   ├── models/
│   │   └── Link.ts           # Mongoose schema
│   ├── routes/
│   │   ├── apiRoutes.ts      # API endpoints
│   │   └── redirectRoutes.ts # Redirect endpoint
│   ├── utils/
│   │   ├── codeGenerator.ts  # Code generation & validation
│   │   └── database.ts       # MongoDB connection
│   ├── app.ts                # Express app setup
│   └── server.ts             # Entry point
├── dist/                      # Compiled output
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

## MongoDB Schema

```typescript
{
  code: string,           // Unique, 6-8 alphanumeric chars
  longUrl: string,        // Original URL
  clicks: number,         // Click count (default 0)
  lastClicked: Date|null, // Last click timestamp
  createdAt: Date,        // Creation timestamp
}
```

## Testing

### Health Check
```bash
curl http://localhost:5000/healthz
```
Expected: `{ "ok": true, "version": "1.0" }`

### Create Link
```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{ "longUrl": "https://example.com/very/long/url" }'
```

### Create Link with Custom Code
```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{ "longUrl": "https://example.com/very/long/url", "code": "mycode" }'
```

### Get All Links
```bash
curl http://localhost:5000/api/links
```

### Get Link Stats
```bash
curl http://localhost:5000/api/links/abc123
```

### Redirect
```bash
curl -L http://localhost:5000/abc123
```

### Test Duplicate Code (should return 409)
```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{ "longUrl": "https://example.com", "code": "mycode" }'
# Returns 409 Conflict if "mycode" already exists
```

### Delete Link
```bash
curl -X DELETE http://localhost:5000/api/links/abc123
```

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

Common status codes:
- `400` - Bad request (invalid URL, invalid code format)
- `404` - Link not found
- `409` - Conflict (code already exists)
- `500` - Server error

## CORS Configuration

By default, CORS is enabled for the frontend URL specified in `.env`:
```typescript
cors({
  origin: config.frontendUrl,
  credentials: true,
})
```

To allow multiple origins, update the `app.ts` CORS config.

## Deployment

### Railway
1. Create a Railway project
2. Connect your GitHub repo
3. Add environment variables (MONGODB_URI, FRONTEND_URL, NODE_ENV=production)
4. Deploy!

### Render
1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set start command: `npm run build && npm run start`
4. Add environment variables
5. Deploy!

## Author

Built for the TinyLink Take-Home Assignment
