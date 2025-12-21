# Deploy to Vercel Production Script
Write-Host "🚀 Deploying SeeZee to Vercel Production..." -ForegroundColor Green
Write-Host ""

# Check if vercel.json exists
if (Test-Path "vercel.json") {
    Write-Host "✅ Vercel configuration found" -ForegroundColor Green
} else {
    Write-Host "❌ vercel.json not found!" -ForegroundColor Red
    exit 1
}

# Build the project first
Write-Host ""
Write-Host "📦 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Deploy to production
Write-Host "🚀 Deploying to Vercel Production..." -ForegroundColor Yellow
Write-Host ""

npx vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Verify environment variables in Vercel dashboard"
    Write-Host "2. Test your production URL: https://see-zee.com"
    Write-Host "3. Test Google OAuth login"
    Write-Host "4. Verify database connections"
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check the errors above." -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Tips:" -ForegroundColor Yellow
    Write-Host "- Make sure you're logged in: npx vercel login"
    Write-Host "- Check environment variables in Vercel dashboard"
    Write-Host "- Review deploy-to-vercel.md for detailed instructions"
}









