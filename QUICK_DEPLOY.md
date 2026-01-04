# 🚀 Quick Start Deployment Checklist

## ✅ Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] GitHub account with your code pushed
- [ ] Netlify account (https://netlify.com)
- [ ] Render account (https://render.com)
- [ ] MongoDB Atlas account (https://mongodb.com/cloud/atlas)
- [ ] All environment variables documented

---

## 📝 Step-by-Step Guide

### 1️⃣ Commit and Push to GitHub

```powershell
# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Push to GitHub
git push origin main
```

---

### 2️⃣ Set Up MongoDB Atlas (5 minutes)

1. **Create Account**: https://www.mongodb.com/cloud/atlas
2. **Create Free Cluster** (M0 - Free forever)
3. **Create Database User**:
   - Username: `codemeet-admin`
   - Password: Generate secure password
   - **Save password!**
4. **Whitelist All IPs**:
   - Network Access → Add IP Address
   - Enter: `0.0.0.0/0` (Allow from anywhere)
5. **Get Connection String**:
   - Connect → Drivers
   - Copy: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/codemeet`

---

### 3️⃣ Deploy Backend to Render (10 minutes)

1. **Go to**: https://dashboard.render.com/
2. **New Web Service** → Connect GitHub repository
3. **Configure**:
   ```
   Name: codemeet-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free
   ```

4. **Add Environment Variables** (click "Add Environment Variable"):
   
   **Required Variables:**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://your-connection-string-here
   JWT_SECRET=generate-random-32-char-string
   JWT_REFRESH_SECRET=generate-another-random-32-char-string
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   CHAT_PROVIDER=huggingface
   HF_TOKEN=hf_YourHuggingFaceTokenHere
   HF_MODEL=Qwen/Qwen3-4B-Instruct-2507:nscale
   LIBRETRANSLATE_URL=https://libretranslate.com/translate
   ```

   **Optional Variables (for full features):**
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ETH_PRIVATE_KEY=your-ethereum-private-key
   ETH_RPC_URL=https://sepolia.infura.io/v3/your-infura-id
   CONTRACT_ADDRESS=your-contract-address
   WALLET_ADDRESS=your-wallet-address
   ```

   **Will update after Netlify:**
   ```env
   FRONTEND_URL=https://your-app.netlify.app
   SITE_URL=https://your-app.netlify.app
   ```

5. **Click "Create Web Service"**
6. **Wait 5-10 minutes** for build to complete
7. **Copy your backend URL**: `https://codemeet-backend.onrender.com`

---

### 4️⃣ Deploy Frontend to Netlify (5 minutes)

1. **Update `.env.production`** in frontend folder:
   ```env
   VITE_API_URL=https://codemeet-backend.onrender.com
   ```

2. **Commit and push**:
   ```powershell
   git add .
   git commit -m "Add production API URL"
   git push origin main
   ```

3. **Go to**: https://app.netlify.com/
4. **Add New Site** → Import from Git → GitHub
5. **Select your repository**
6. **Configure**:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

7. **Add Environment Variable**:
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://codemeet-backend.onrender.com`

8. **Click "Deploy site"**
9. **Wait 3-5 minutes** for build
10. **Copy your Netlify URL**: `https://your-app-name.netlify.app`

---

### 5️⃣ Update Backend CORS (2 minutes)

1. **Go back to Render** dashboard
2. **Open your backend service**
3. **Environment** → **Update these variables**:
   ```env
   FRONTEND_URL=https://your-app-name.netlify.app
   SITE_URL=https://your-app-name.netlify.app
   ```
4. **Save Changes** → **Manual Deploy** → **Deploy latest commit**

---

## 🧪 Testing Your Deployment

Visit your Netlify URL and test:

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Issue submission works
- [ ] Chatbot responds
- [ ] Community hub works
- [ ] Image uploads work (if Cloudinary configured)
- [ ] Blockchain verification (if configured)

---

## 🐛 Common Issues & Solutions

### Backend 502 Error
```
Problem: Backend shows 502 Bad Gateway
Solution: 
1. Check Render logs
2. Verify MONGODB_URI is correct
3. Check MongoDB Atlas IP whitelist (0.0.0.0/0)
4. Verify all required env vars are set
```

### Frontend Can't Connect
```
Problem: "Cannot connect to server"
Solution:
1. Verify VITE_API_URL in Netlify env vars
2. Check backend is running on Render
3. Verify FRONTEND_URL is set on backend
4. Check browser console for CORS errors
```

### Database Connection Failed
```
Problem: "MongoServerError: Authentication failed"
Solution:
1. Check username and password in MONGODB_URI
2. Ensure password doesn't have special chars (or URL encode)
3. Verify database user exists in MongoDB Atlas
4. Check network access allows 0.0.0.0/0
```

### Build Failed
```
Problem: Build fails on Render/Netlify
Solution:
1. Check build logs for specific errors
2. Verify package.json has correct scripts
3. Ensure all dependencies are in package.json
4. Check Node version compatibility
```

---

## 📊 Monitoring

### View Logs

**Render (Backend):**
- Dashboard → Your Service → Logs tab

**Netlify (Frontend):**
- Dashboard → Your Site → Deploys tab → View logs

---

## 🔄 Continuous Deployment

Both services auto-deploy on git push:

```powershell
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# ✅ Render and Netlify will auto-deploy!
```

---

## 🎉 You're Done!

Your app is now live at:
- **Frontend**: https://your-app-name.netlify.app
- **Backend**: https://codemeet-backend.onrender.com

Share it with the world! 🌍

---

## 📞 Need Help?

- Check **DEPLOYMENT.md** for detailed guide
- View logs on Render/Netlify for errors
- Verify all environment variables are correct
- Check MongoDB Atlas connection

---

## ⚡ Quick Commands Reference

```powershell
# Run deployment helper script
./deploy.ps1

# Push to GitHub
git add .; git commit -m "Update"; git push

# Check deployment status
# Render: https://dashboard.render.com/
# Netlify: https://app.netlify.com/
```
