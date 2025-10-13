#!/bin/bash

# 🚀 Quick Deployment Script for CodeMeet

echo "🚀 CodeMeet Deployment Helper"
echo "=============================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized!"
    echo "Run: git init && git add . && git commit -m 'Initial commit'"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Commit and push changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        git push origin main
        echo "✅ Changes pushed to GitHub!"
    else
        echo "⚠️  Skipping commit..."
    fi
else
    echo "✅ No uncommitted changes"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. 🗄️  Set up MongoDB Atlas:"
echo "   → https://www.mongodb.com/cloud/atlas"
echo "   → Create a free M0 cluster"
echo "   → Get connection string"
echo ""
echo "2. 🔧 Deploy Backend to Render:"
echo "   → https://dashboard.render.com/"
echo "   → New Web Service → Connect GitHub repo"
echo "   → Root Directory: backend"
echo "   → Build: npm install && npm run build"
echo "   → Start: npm start"
echo "   → Add environment variables (see DEPLOYMENT.md)"
echo ""
echo "3. 🎨 Deploy Frontend to Netlify:"
echo "   → https://app.netlify.com/"
echo "   → Import from GitHub"
echo "   → Base directory: frontend"
echo "   → Build: npm run build"
echo "   → Publish: frontend/dist"
echo "   → Add VITE_API_URL env variable"
echo ""
echo "4. 🔄 Update CORS:"
echo "   → Go back to Render"
echo "   → Update FRONTEND_URL with Netlify URL"
echo "   → Redeploy backend"
echo ""
echo "📖 Full guide: See DEPLOYMENT.md"
echo ""
echo "🎉 Good luck with your deployment!"
