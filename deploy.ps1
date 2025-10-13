# 🚀 Quick Deployment Script for CodeMeet

Write-Host "🚀 CodeMeet Deployment Helper" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository not initialized!" -ForegroundColor Red
    Write-Host "Run: git init; git add .; git commit -m 'Initial commit'" -ForegroundColor Yellow
    exit 1
}

# Check for uncommitted changes
$status = git status -s
if ($status) {
    Write-Host "📝 You have uncommitted changes:" -ForegroundColor Yellow
    git status -s
    Write-Host ""
    $commit = Read-Host "Commit and push changes? (y/n)"
    
    if ($commit -eq "y" -or $commit -eq "Y") {
        git add .
        $commitMsg = Read-Host "Enter commit message"
        git commit -m $commitMsg
        git push origin main
        Write-Host "✅ Changes pushed to GitHub!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Skipping commit..." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ No uncommitted changes" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🗄️  Set up MongoDB Atlas:" -ForegroundColor White
Write-Host "   → https://www.mongodb.com/cloud/atlas" -ForegroundColor Gray
Write-Host "   → Create a free M0 cluster" -ForegroundColor Gray
Write-Host "   → Get connection string" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🔧 Deploy Backend to Render:" -ForegroundColor White
Write-Host "   → https://dashboard.render.com/" -ForegroundColor Gray
Write-Host "   → New Web Service → Connect GitHub repo" -ForegroundColor Gray
Write-Host "   → Root Directory: backend" -ForegroundColor Gray
Write-Host "   → Build: npm install && npm run build" -ForegroundColor Gray
Write-Host "   → Start: npm start" -ForegroundColor Gray
Write-Host "   → Add environment variables (see DEPLOYMENT.md)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🎨 Deploy Frontend to Netlify:" -ForegroundColor White
Write-Host "   → https://app.netlify.com/" -ForegroundColor Gray
Write-Host "   → Import from GitHub" -ForegroundColor Gray
Write-Host "   → Base directory: frontend" -ForegroundColor Gray
Write-Host "   → Build: npm run build" -ForegroundColor Gray
Write-Host "   → Publish: frontend/dist" -ForegroundColor Gray
Write-Host "   → Add VITE_API_URL env variable" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 🔄 Update CORS:" -ForegroundColor White
Write-Host "   → Go back to Render" -ForegroundColor Gray
Write-Host "   → Update FRONTEND_URL with Netlify URL" -ForegroundColor Gray
Write-Host "   → Redeploy backend" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Full guide: See DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Good luck with your deployment!" -ForegroundColor Green
