# 🚀 Deployment Guide - CodeMeet

This guide will help you deploy your CodeMeet application to **Netlify** (Frontend) and **Render** (Backend).

---

## 📋 Prerequisites

Before deploying, make sure you have:
- ✅ GitHub account
- ✅ Netlify account (free tier available)
- ✅ Render account (free tier available)
- ✅ MongoDB Atlas account (for production database)
- ✅ All your code pushed to GitHub

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Production Database)

1. **Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**
2. **Create a free cluster** (M0 Sandbox - Free forever)
3. **Create a database user**:
   - Username: `codemeet-admin`
   - Password: (generate a strong password)
   - Save this password securely!
4. **Whitelist IP addresses**:
   - Go to Network Access
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - This is needed for Render to connect
5. **Get your connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.xxxxx.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Replace `myFirstDatabase` with `codemeet` or your preferred database name

---

## 🔧 Step 2: Deploy Backend to Render

### 2.1 Push Code to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2.2 Create Render Web Service

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service**:
   - **Name**: `codemeet-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 2.3 Add Environment Variables

In Render's environment variables section, add:

```env
NODE_ENV=production
PORT=5000

# MongoDB Atlas Connection String (from Step 1)
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.xxxxx.mongodb.net/codemeet?retryWrites=true&w=majority

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secure-random-string-here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=another-super-secure-random-string
JWT_REFRESH_EXPIRE=30d

# Cloudinary (from your .env file)
CLOUDINARY_CLOUD_NAME=dahotkqpi
CLOUDINARY_API_KEY=666438419771276
CLOUDINARY_API_SECRET=Y9SjL2VIMHqbAyATD5k1DSJD0Xw

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Chat Provider
CHAT_PROVIDER=huggingface

# Hugging Face API (Get your token from https://huggingface.co/settings/tokens)
HF_TOKEN=hf_YOUR_HUGGINGFACE_TOKEN_HERE
HF_MODEL=Qwen/Qwen3-4B-Instruct-2507:nscale

# LibreTranslate
LIBRETRANSLATE_URL=https://libretranslate.com/translate

# Blockchain Configuration (use your actual values)
ETH_PRIVATE_KEY=your-ethereum-private-key-here
ETH_RPC_URL=https://sepolia.infura.io/v3/your-infura-project-id
CONTRACT_ADDRESS=your-deployed-contract-address
WALLET_ADDRESS=your-wallet-address

# Frontend URL (will update after Netlify deployment)
FRONTEND_URL=https://your-netlify-app.netlify.app
SITE_URL=https://your-netlify-app.netlify.app
```

### 2.4 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for the build to complete (5-10 minutes)
3. **Copy your backend URL**: `https://codemeet-backend.onrender.com`

---

## 🎨 Step 3: Deploy Frontend to Netlify

### 3.1 Update Frontend API URL

First, create a `.env.production` file in the frontend folder:

```bash
# In frontend/.env.production
VITE_API_URL=https://codemeet-backend.onrender.com
```

Commit and push:
```bash
git add .
git commit -m "Add production API URL"
git push origin main
```

### 3.2 Deploy to Netlify

**Option A: Deploy via Netlify UI (Recommended)**

1. **Go to [Netlify](https://app.netlify.com/)**
2. **Click "Add new site" → "Import an existing project"**
3. **Connect to GitHub** and select your repository
4. **Configure build settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - **Node version**: `18`

5. **Add environment variables** (Site settings → Environment variables):
   ```
   VITE_API_URL=https://codemeet-backend.onrender.com
   ```

6. **Click "Deploy site"**
7. **Copy your Netlify URL**: `https://your-app-name.netlify.app`

**Option B: Deploy via Netlify CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy frontend
cd frontend
netlify init
netlify deploy --prod
```

### 3.3 Update Backend CORS Settings

Go back to **Render** and update these environment variables:

```env
FRONTEND_URL=https://your-app-name.netlify.app
SITE_URL=https://your-app-name.netlify.app
```

Then **manually redeploy** the backend from Render dashboard.

---

## 🔒 Step 4: Security Checklist

### Backend (.env on Render)
- ✅ Change JWT_SECRET to a strong random string
- ✅ Change JWT_REFRESH_SECRET to another strong random string
- ✅ Use MongoDB Atlas connection string (not localhost)
- ✅ Update FRONTEND_URL to your Netlify URL
- ✅ Never commit .env file to GitHub

### Frontend
- ✅ Ensure VITE_API_URL points to Render backend URL
- ✅ No sensitive keys in frontend code

---

## 🧪 Step 5: Test Your Deployment

1. **Visit your Netlify frontend URL**
2. **Test user registration and login**
3. **Test issue submission**
4. **Test chatbot functionality**
5. **Test community features**
6. **Test blockchain verification** (admin panel)

---

## 📊 Monitoring & Logs

### Render (Backend)
- Go to your service → **Logs** tab
- View real-time logs for debugging

### Netlify (Frontend)
- Go to your site → **Deploys** tab
- View build logs and deploy status

---

## 🔄 Continuous Deployment

Both Render and Netlify support **automatic deployments**:

- **Push to GitHub main branch** → Automatic deployment
- **Backend**: Render auto-deploys on push
- **Frontend**: Netlify auto-deploys on push

---

## 🆘 Troubleshooting

### Backend Issues

**Problem**: Build fails
```bash
# Solution: Check build logs on Render
# Ensure package.json has correct scripts:
"scripts": {
  "build": "tsc",
  "start": "node dist/server.js"
}
```

**Problem**: Database connection fails
```bash
# Solution: 
# 1. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
# 2. Verify MONGODB_URI format
# 3. Ensure password doesn't have special characters (or URL encode them)
```

**Problem**: 502 Bad Gateway
```bash
# Solution:
# 1. Check Render logs for errors
# 2. Verify all environment variables are set
# 3. Check if MongoDB is accessible
```

### Frontend Issues

**Problem**: "Cannot connect to API"
```bash
# Solution:
# 1. Verify VITE_API_URL in Netlify environment variables
# 2. Check if backend is running on Render
# 3. Verify CORS settings on backend (FRONTEND_URL)
```

**Problem**: Blank page after deployment
```bash
# Solution:
# 1. Check browser console for errors
# 2. Verify build command completed successfully
# 3. Check Netlify redirects in netlify.toml
```

---

## 📝 Environment Variables Summary

### Backend (Render)
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `MONGODB_URI` | Database connection | `mongodb+srv://...` |
| `JWT_SECRET` | Auth secret | Random string |
| `HF_TOKEN` | Hugging Face token | `hf_...` |
| `FRONTEND_URL` | Frontend URL | `https://app.netlify.app` |
| `ETH_PRIVATE_KEY` | Blockchain key | `0x...` |

### Frontend (Netlify)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://backend.onrender.com` |

---

## 🎉 Deployment Complete!

Your CodeMeet application is now live! 🚀

- **Frontend**: https://your-app.netlify.app
- **Backend**: https://codemeet-backend.onrender.com

Share your deployed app with the world! 🌍

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Render/Netlify logs
3. Verify all environment variables are correctly set
4. Check MongoDB Atlas connection

Happy deploying! 🎊
