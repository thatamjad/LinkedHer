# 🚀 Vercel Frontend Deployment Guide

## Prerequisites
✅ Railway backend deployed and running
✅ GitHub repository updated with latest code

## Step-by-Step Instructions

### 1. **Get Your Railway Backend URL**
1. Go to your **Railway dashboard**
2. Select your **LinkedHer backend project**
3. In the **Deployments** tab, find your latest successful deployment
4. Copy the **domain URL** (should look like: `https://linkedher-backend-production.up.railway.app`)

### 2. **Deploy to Vercel**

#### Option A: Deploy via Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel (if not already logged in)
vercel login

# Deploy to production
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click **"New Project"**
4. Import your GitHub repository: `thatamjad/LinkedHer`
5. **Root Directory**: Set to `frontend`
6. **Framework Preset**: React
7. Click **"Deploy"**

### 3. **Configure Environment Variables in Vercel**

After deployment, add these environment variables:

1. Go to your **Vercel project dashboard**
2. **Settings** → **Environment Variables**
3. Add the following variables:

```
Variable Name: REACT_APP_API_URL
Value: https://your-railway-url.railway.app/api

Variable Name: REACT_APP_SERVER_URL  
Value: https://your-railway-url.railway.app

Variable Name: GENERATE_SOURCEMAP
Value: false

Variable Name: CI
Value: false
```

### 4. **Update Backend CORS Settings**

After frontend deployment:

1. Copy your **Vercel deployment URL** (e.g., `https://linkedher.vercel.app`)
2. Go to your **Railway dashboard**
3. **Variables** tab
4. Update `CLIENT_URL` to your Vercel URL:
   ```
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```
5. **Redeploy** the Railway backend

### 5. **Test Full-Stack Integration**

1. Visit your Vercel frontend URL
2. Test user registration/login
3. Check browser console for any API errors
4. Verify Socket.IO real-time features work

## Troubleshooting

### Common Issues:

**🚨 CORS Errors:**
- Ensure `CLIENT_URL` in Railway matches your Vercel URL exactly
- Redeploy Railway backend after updating `CLIENT_URL`

**🚨 API Connection Errors:**
- Verify `REACT_APP_API_URL` points to correct Railway URL
- Check Railway backend is running at `/health` endpoint

**🚨 Build Failures:**
- Set `CI=false` to ignore warnings as errors
- Set `GENERATE_SOURCEMAP=false` to reduce build size

### Success Indicators:
✅ Frontend loads without errors
✅ User can register/login successfully  
✅ API requests work (check Network tab)
✅ Real-time features functional (if any)

## Final Verification Commands

Test these URLs:
- **Frontend**: `https://your-vercel-app.vercel.app`
- **Backend Health**: `https://your-railway-url.railway.app/health`
- **API Status**: `https://your-railway-url.railway.app/api/status`

---

🎉 **Once successful, you'll have a fully deployed MERN stack application!**
