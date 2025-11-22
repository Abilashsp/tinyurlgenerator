# TinyLink - Deployment Guide

Complete step-by-step instructions for deploying TinyLink to production.

## 🎯 Deployment Overview

**Architecture:**
```
GitHub Repo
  ├── Backend → Railway/Render → Production API
  └── Frontend → Vercel → CDN (Global Distribution)

MongoDB Atlas (Cloud Database) ← Both connect to this
```

**Timeline:** ~20-30 minutes total

## 🔑 Prerequisites

1. **GitHub Account** - For source control
2. **Railway Account** (free tier available) - For backend
3. **Vercel Account** (free tier available) - For frontend
4. **MongoDB Atlas Account** (free tier available) - For database
5. **Git** installed locally
6. **Code pushed to GitHub**

## 📦 Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account

1. Go to [mongodb.com/cloud](https://mongodb.com/cloud/atlas)
2. Sign up with email or GitHub
3. Create free tier account

### 1.2 Create Cluster

1. Click "Create a Deployment"
2. Choose "M0 Free" tier
3. Select your region (closest to you)
4. Create cluster (takes 2-3 minutes)

### 1.3 Create Database User

1. Go to "Database Access"
2. Click "Add New Database User"
3. Enter username: `tinylink`
4. Set password: `<choose a strong password>`
5. Select "Built-in Role: Atlas Admin"
6. Add User

**Save this username and password!**

### 1.4 Whitelist IP Addresses

1. Go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow access from anywhere" (0.0.0.0/0)
4. Add IP Address

⚠️ For production, restrict to specific IPs if possible.

### 1.5 Get Connection String

1. Go to "Clusters"
2. Click "Connect" button
3. Choose "Drivers"
4. Select Node.js driver
5. Copy connection string
6. Format: `mongodb+srv://tinylink:PASSWORD@cluster0.xxxxx.mongodb.net/tinylink?retryWrites=true&w=majority`
7. Replace `PASSWORD` with your database password

**Save this connection string!**

---

## 🚀 Step 2: Backend Deployment (Railway)

### 2.1 Push Code to GitHub

```bash
cd Tiny-url
git add .
git commit -m "Initial TinyLink deployment"
git push origin main
```

### 2.2 Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up (or sign in with GitHub)
3. Connect GitHub account when prompted

### 2.3 Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub Repo"
3. Choose your repository: `Tiny-url`
4. Select branch: `main`

### 2.4 Configure Build & Start Commands

1. In Railway dashboard, go to your project
2. Click on the "backend" service (if not created, create it first)
3. Go to "Deployment" settings
4. Set **Build Command:**
   ```
   npm install && npm run build
   ```
5. Set **Start Command:**
   ```
   npm start
   ```
6. Set **Root Directory:** `backend`

### 2.5 Add Environment Variables

1. In Railway, go to "Variables"
2. Click "Add Variable"
3. Add these variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://tinylink:PASSWORD@cluster0.xxxxx.mongodb.net/tinylink?retryWrites=true&w=majority
FRONTEND_URL=https://your-vercel-frontend.vercel.app
```

Replace:
- `PASSWORD` with your MongoDB password
- `your-vercel-frontend.vercel.app` with your actual Vercel URL (get this after frontend deployment)

⚠️ Can update FRONTEND_URL after Vercel deployment

### 2.6 Deploy

1. Railway auto-deploys on push
2. Wait for build to complete (3-5 minutes)
3. Check "Deployments" tab for status
4. Look for green checkmark ✅

### 2.7 Get Backend URL

1. In Railway, click "Backend" service
2. Copy the "Domain" URL (looks like `name-prod.up.railway.app`)
3. Save this URL - needed for frontend

**Verify Backend:** Visit `https://your-backend-url.up.railway.app/healthz`
Expected: `{"ok":true,"version":"1.0"}`

---

## 🎨 Step 3: Frontend Deployment (Vercel)

### 3.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up (or sign in with GitHub)
3. Connect GitHub account when prompted

### 3.2 Import Project

1. Click "Add New..."
2. Select "Project"
3. Choose your GitHub repository
4. Vercel will auto-detect Vite project

### 3.3 Configure Project Settings

1. **Framework Preset:** Vite
2. **Build Command:** `npm run build` (auto-detected)
3. **Output Directory:** `dist` (auto-detected)
4. **Root Directory:** `frontend`

### 3.4 Add Environment Variables

1. Go to "Environment Variables"
2. Add variable:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   ```
   Replace with actual Railway backend URL

3. Apply to all environments (Production, Preview, Development)

### 3.5 Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Check for green checkmark ✅
4. Deployment URL will appear

**Your frontend URL:** `https://your-project-name.vercel.app`

### 3.6 Update Backend FRONTEND_URL

1. Go back to Railway backend settings
2. Update `FRONTEND_URL` variable to your Vercel URL
3. Redeploy backend

```bash
# Or manually trigger redeploy in Railway
# Click "Redeploy" button in Deployments tab
```

---

## ✅ Verify Deployment

### 1. Test Health Endpoint

```bash
curl https://your-backend-url.up.railway.app/healthz
# Expected: {"ok":true,"version":"1.0"}
```

### 2. Test API

```bash
curl -X POST https://your-backend-url.up.railway.app/api/links \
  -H "Content-Type: application/json" \
  -d '{"longUrl":"https://github.com"}'
# Expected: Link created with code
```

### 3. Open Frontend

1. Visit: `https://your-project-name.vercel.app`
2. Create a link
3. Redirect works
4. Stats page updates

### 4. End-to-End Test

1. Frontend: Create link with long URL
2. Copy short URL
3. Visit short URL - should redirect
4. Check stats - click count should increase

---

## 🔧 Troubleshooting Deployment

### Build Failed on Railway

**Error:** `npm ERR! code ENOENT`

**Solution:**
```bash
# Locally, verify build works:
cd backend
npm install
npm run build
git add .
git commit -m "Verify build"
git push
```

### MongoDB Connection Error

**Error:** `MongooseError: connect ECONNREFUSED`

**Solution:**
1. Check MONGODB_URI in Railway variables
2. Verify username:password is correct
3. Verify IP whitelist includes 0.0.0.0/0
4. Test locally first:
   ```bash
   mongosh "mongodb+srv://user:pass@cluster.mongodb.net/tinylink"
   ```

### CORS Error

**Error:** `Cross-Origin Request Blocked`

**Solution:**
1. Check FRONTEND_URL in backend variables
2. Must exactly match Vercel URL:
   ```
   FRONTEND_URL=https://your-project-name.vercel.app
   ```
3. Redeploy backend after updating

### API 404 Error

**Error:** Frontend can't reach API

**Solution:**
1. Check VITE_API_URL in Vercel variables
2. Must match Railway backend URL:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   ```
3. Redeploy frontend after updating
4. Hard refresh browser (Ctrl+Shift+R)

### Vercel Build Failed

**Error:** `error during build: Cannot find module`

**Solution:**
```bash
# Locally verify build:
cd frontend
npm install
npm run build

# If it works locally but fails on Vercel:
# 1. Check Node version in Vercel settings
# 2. Clear cache in Vercel: Settings → Build & Deployment → "Clear Cache"
# 3. Redeploy
```

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Backend won't start** | Check NODE_ENV=production, PORT is set |
| **Database quota exceeded** | Use MongoDB free tier only, or upgrade |
| **Slow deployments** | Normal first time. Subsequent deploys faster |
| **502 Bad Gateway** | Backend crashed. Check Railway logs |
| **Frontend blank page** | Check browser console, verify VITE_API_URL |
| **Can't create links** | Check CORS, backend URL, network tab |

---

## 📊 Monitoring Deployments

### Railway Monitoring

1. Click "Backend" service
2. Click "Logs" tab
3. Watch real-time logs
4. Check for errors

### Vercel Monitoring

1. Go to project dashboard
2. Click "Deployments" tab
3. View build logs
4. Check deployment status

---

## 🔄 Redeploy After Changes

### If you change backend code:

```bash
git add .
git commit -m "Update backend"
git push origin main
# Railway auto-redeploys (2-3 minutes)
```

### If you change frontend code:

```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-redeploys (1-2 minutes)
```

### If you change environment variables:

**Railway:**
1. Update variables
2. Click "Redeploy" in Deployments tab
3. Wait 3-5 minutes

**Vercel:**
1. Update variables in Settings
2. Click "Deployments"
3. Click "Redeploy" on latest deployment
4. Wait 1-2 minutes

---

## 🎯 Production Checklist

Before going live:

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] IP whitelist includes 0.0.0.0/0 (or specific IPs)
- [ ] Backend deployed to Railway
- [ ] Backend health check works
- [ ] Frontend deployed to Vercel
- [ ] Frontend loads without errors
- [ ] FRONTEND_URL in backend matches Vercel URL
- [ ] VITE_API_URL in frontend matches Railway URL
- [ ] Created link redirects properly
- [ ] Click count increases on redirect
- [ ] Delete link works
- [ ] Stats page shows live updates
- [ ] API returns correct error codes
- [ ] Mobile responsive works
- [ ] All links work in production

---

## 📈 Scaling Considerations

### Current Setup (MVP)
- Free tier Vercel (5 deploys/month limit, 100MB bandwidth)
- Free tier Railway (up to $10 credit)
- Free tier MongoDB Atlas

### After Product Launch

**Upgrade MongoDB:**
```
Free M0 → M2 (3GB storage)
Cost: ~$10/month
```

**Upgrade Railway:**
```
Pay as you go ($0.50/CPU hour)
Monthly cost depends on usage
```

**Upgrade Vercel:**
```
Pro Plan ($25/month)
Unlimited builds and bandwidth
```

---

## 🔐 Security Considerations

✅ **HTTPS** - Both Railway and Vercel provide SSL/TLS  
✅ **CORS** - Restricted to frontend domain  
✅ **MongoDB** - Password protected, IP whitelisted  
✅ **Environment Variables** - Secrets not in code  
⚠️ **To add:** Rate limiting, input sanitization, logging

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Express Deployment Guide](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## ✨ You're Live!

Your TinyLink URL Shortener is now live on the internet! 🎉

**Share your URLs:**
```
https://your-domain.vercel.app/ → Dashboard
https://your-backend-url.railway.app/SHORTCODE → Redirects
```

---

**Last Updated:** January 2024
