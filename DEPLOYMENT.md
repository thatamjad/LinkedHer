# LinkedHer Deployment Guide

## Phase 1: GitHub Repository Setup

### 1. GitHub Authentication
Before pushing to GitHub, you need to authenticate:

#### Option A: Personal Access Token (Recommended)
1. Go to GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Generate a new token with `repo` scope
3. Use this command to push:
   ```bash
   git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/thatamjad/LinkedHer.git
   git push -u origin main
   ```

#### Option B: GitHub CLI
```bash
gh auth login
git push -u origin main
```

### 2. Environment Variables Setup for Production
Create these files in your repository:

**`.env.production.example`** (Backend):
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_production_jwt_secret_32_chars_min
JWT_REFRESH_SECRET=your_production_refresh_secret_32_chars_min
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=https://your-frontend-domain.com
VERIFICATION_WINDOW_DAYS=7
```

## Phase 2: Deployment Strategy using GitHub Student Developer Pack

### Recommended Deployment Architecture:

1. **Frontend (React)**: Deploy on **Vercel** or **Netlify** (both free in GitHub Student Pack)
2. **Backend (Node.js)**: Deploy on **Railway**, **Render**, or **DigitalOcean App Platform**
3. **Database**: **MongoDB Atlas** (free tier available)
4. **File Storage**: **AWS S3** or **Cloudinary** (both have student credits)
5. **Domain**: **Namecheap** (.me domain free with student pack)

### Option 1: Vercel + Railway (Recommended)

#### Frontend on Vercel:
1. Connect your GitHub repo to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/build`
4. Add environment variables in Vercel dashboard

#### Backend on Railway:
1. Connect GitHub repo to Railway
2. Set root directory to `backend`
3. Railway will auto-detect Node.js
4. Add environment variables in Railway dashboard

### Option 2: Full Stack on DigitalOcean App Platform

#### Benefits:
- Single platform for both frontend and backend
- $200 credit with GitHub Student Pack
- Easy scaling and monitoring

#### Setup:
1. Connect GitHub repo to DigitalOcean App Platform
2. Configure as multi-component app:
   - Frontend: Static site from `frontend/` folder
   - Backend: Node.js service from `backend/` folder
3. Add managed MongoDB database

### Option 3: Netlify + Render

#### Frontend on Netlify:
- Build command: `cd frontend && npm run build`
- Publish directory: `frontend/build`

#### Backend on Render:
- Build command: `cd backend && npm install`
- Start command: `cd backend && npm start`

## Phase 3: Database Setup

### MongoDB Atlas (Recommended):
1. Create free cluster on MongoDB Atlas
2. Whitelist your deployment platform IPs
3. Create database user with read/write permissions
4. Get connection string and add to environment variables

## Phase 4: CI/CD Pipeline with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install backend dependencies
        run: cd backend && npm install
      
      - name: Install frontend dependencies  
        run: cd frontend && npm install
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Run frontend tests
        run: cd frontend && npm test -- --watchAll=false

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: frontend

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: bltavares/actions-railway@v1
        with:
          service: ${{ secrets.RAILWAY_SERVICE }}
          token: ${{ secrets.RAILWAY_TOKEN }}
```

## Phase 5: Domain Setup

### Using GitHub Student Pack Benefits:
1. Get free .me domain from Namecheap
2. Configure DNS to point to your deployments:
   - A record: `@` → Your backend IP
   - CNAME: `www` → Your frontend domain
   - CNAME: `api` → Your backend domain

## Phase 6: Security Enhancements

### SSL/HTTPS:
- Vercel/Netlify provide automatic HTTPS
- Railway provides automatic HTTPS
- For custom domains, use Cloudflare (free tier)

### Environment Security:
- Never commit .env files
- Use platform environment variable managers
- Rotate secrets regularly

## Phase 7: Monitoring and Analytics

### Free Tools from Student Pack:
1. **Datadog** - Application monitoring
2. **LogDNA** - Log management  
3. **Sentry** - Error tracking
4. **MongoDB Atlas** - Database monitoring

## Cost Estimation:

### Free Tier (Sufficient for MVP):
- Vercel: Free hosting
- Railway: $5/month after free usage
- MongoDB Atlas: Free 512MB
- Cloudflare: Free CDN and SSL

### With Student Credits:
- DigitalOcean: $200 credit (4+ months free)
- AWS: $100+ credits
- Azure: $100 credit

## Next Steps:

1. Authenticate and push to GitHub
2. Choose deployment platform
3. Set up MongoDB Atlas
4. Configure environment variables
5. Deploy and test
6. Set up monitoring
7. Configure custom domain

Would you like me to help you with any specific step?
