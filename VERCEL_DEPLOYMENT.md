# Vercel Deployment Guide

## Quick Start

### Prerequisites
- Vercel account (https://vercel.com)
- Git repository pushed to GitHub/GitLab/Bitbucket

### Deployment Steps

1. **Connect Repository to Vercel**
   - Go to vercel.com/new
   - Select your GitHub repository (tiny-url)
   - Click "Import"

2. **Configure Environment Variables**
   In Vercel Dashboard → Settings → Environment Variables, add:
   ```
   MONGODB_URI=your_mongodb_connection_string
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   NODE_ENV=production
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRY=7d
   ```

3. **Configure Root Settings**
   - **Framework**: Other
   - **Root Directory**: ./ (root of your monorepo)
   - **Build Command**: `cd backend && npm run build && cd ../frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`

4. **Deploy**
   - Vercel will automatically build and deploy
   - Monitor the deployment in the dashboard

---

## How It Works

### Architecture Overview
```
User Request
    ↓
Vercel Router (vercel.json)
    ├→ /api/* → Serverless Function (api/[...].ts)
    └→ /* → Static Frontend (frontend/dist)
```

### Files Created for Deployment

**vercel.json** - Routes configuration
- Directs `/api/` requests to serverless backend
- Serves frontend from `frontend/dist`
- Rewrites all other routes to `index.html` (for SPA routing)

**api/[...].ts** - Serverless handler
- Catches all `/api/` routes
- Passes them to your Express app
- Deployed as serverless functions

**.vercelignore** - Optimization
- Excludes unnecessary files from deployment

---

## Troubleshooting

### 404 Errors
**Problem**: Getting 404 on API calls
**Solution**: 
- Check that `VITE_API_URL` is set correctly
- Verify environment variables in Vercel dashboard
- Check `vercel.json` file exists in root

### CORS Errors
**Problem**: Frontend can't reach backend
**Solution**:
- Backend `CORS` is configured in `backend/src/common/security/config.ts`
- Ensure `FRONTEND_URL` environment variable is set
- Frontend should use `/api/` endpoints (relative path works on same domain)

### Build Fails
**Problem**: Deployment fails during build
**Solution**:
- Run `npm run build` locally to test
- Check build logs in Vercel dashboard
- Ensure all environment variables are set

---

## Local Testing

Test your setup locally before pushing:

```bash
# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Build everything
npm run build

# Test backend separately (if needed)
cd backend
npm start
```

---

## Environment Variables Template

**Backend** (.env)
```
NODE_ENV=production
PORT=3000 (Vercel sets this automatically)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
FRONTEND_URL=https://your-domain.vercel.app
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend** (.env.production)
```
VITE_API_URL=https://your-domain.vercel.app
```

---

## Important Notes

⚠️ **Serverless Limitations**
- Cold starts may cause slight delays on first request
- Each API call is a separate invocation
- Keep functions lean and optimized

⚠️ **Database Connection**
- MongoDB Atlas recommended (cloud-hosted)
- Local MongoDB won't work on Vercel
- Set connection timeout: `serverSelectionTimeoutMS=5000`

⚠️ **Session Management**
- JWT tokens are stateless (good for serverless)
- Cookies work fine with `withCredentials: true`
- Keep token expiry reasonable

---

## Monitoring & Debugging

1. **View Logs**
   - Vercel Dashboard → Deployments → View logs

2. **Test Endpoints**
   - GET `/healthz` - Health check endpoint
   - POST `/api/auth/login` - Login
   - GET `/api/links` - Fetch user's links

3. **Check Builds**
   - Every push to main branch triggers rebuild
   - Review build logs if deployment fails

---

## Rolling Back

If deployment has issues:
1. Go to Vercel Dashboard → Deployments
2. Find the previous working deployment
3. Click "..." → "Promote to Production"
