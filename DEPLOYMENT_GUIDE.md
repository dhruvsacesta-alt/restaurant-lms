# Restaurant LMS - Deployment Checklist

## ✅ Pre-Deployment Tasks Completed
- [x] Environment variables configured
- [x] Frontend built for production
- [x] Backend optimized for production
- [x] API endpoints configured for environment variables
- [x] Production server tested locally

## 🚀 Deployment Options

### Option 1: Vercel + Railway (Recommended for Beginners)
**Frontend:** Vercel (Free tier available)
**Backend:** Railway (Free tier available)
**Database:** MongoDB Atlas (Free tier available)

### Option 2: Netlify + Heroku
**Frontend:** Netlify (Free tier available)
**Backend:** Heroku (Free tier available)
**Database:** MongoDB Atlas

### Option 3: AWS (For Production-Ready Setup)
**Frontend:** AWS S3 + CloudFront
**Backend:** AWS EC2 or Elastic Beanstalk
**Database:** MongoDB Atlas or AWS DocumentDB

## 📋 Next Steps

### 1. Set up MongoDB Atlas
1. Go to https://cloud.mongodb.com/
2. Create account and cluster
3. Get connection string
4. Update `MONGODB_URI` in production environment

### 2. Choose Your Deployment Platform

#### For Vercel + Railway:
1. **Backend on Railway:**
   - Go to https://railway.app/
   - Connect GitHub repo
   - Set environment variables
   - Deploy

2. **Frontend on Vercel:**
   - Go to https://vercel.com/
   - Connect GitHub repo
   - Set `VITE_API_BASE_URL` to Railway backend URL
   - Deploy

#### For Netlify + Heroku:
1. **Backend on Heroku:**
   - Install Heroku CLI
   - `heroku create your-app-name`
   - Set environment variables
   - `git push heroku main`

2. **Frontend on Netlify:**
   - Go to https://netlify.com/
   - Drag & drop `dist` folder or connect GitHub
   - Set environment variables

### 3. Update Environment Variables
- Replace placeholder URLs with actual deployed URLs
- Generate new JWT secret for production
- Configure CORS origins

### 4. Domain Setup (Optional)
- Purchase domain from Namecheap, GoDaddy, etc.
- Configure DNS settings in deployment platform
- Set up SSL certificates (usually automatic)

### 5. Testing
- Test all routes work correctly
- Verify file uploads function
- Check authentication flow
- Test database connections

## 🔧 Useful Commands

```bash
# Build frontend
npm run build

# Test production backend locally
npm start

# Deploy to specific platforms
# (platform-specific commands will be provided)
```

## 📞 Need Help?
If you encounter issues during deployment, check:
1. Environment variables are set correctly
2. MongoDB Atlas IP whitelist includes deployment platform
3. CORS settings allow your frontend domain
4. File upload paths are configured for cloud storage if needed

Would you like me to help you set up a specific deployment platform?