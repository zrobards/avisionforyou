Write-Host "🚀 Deploying SeeZee to Vercel Production..." -ForegroundColor Cyan
Write-Host ""

# Check if project is linked
if (Test-Path ".\.vercel\project.json") {
    $project = Get-Content ".\.vercel\project.json" | ConvertFrom-Json
    Write-Host "✅ Project linked: $($project.projectName)" -ForegroundColor Green
    Write-Host "   Project ID: $($project.projectId)" -ForegroundColor Gray
    Write-Host ""
}

# Check authentication
Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Yellow
$whoami = npx vercel whoami 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Authenticated: $whoami" -ForegroundColor Green
} else {
    Write-Host "⚠️  Not authenticated. Please run: npx vercel login" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opening login..." -ForegroundColor Yellow
    npx vercel login
}

Write-Host ""
Write-Host "📦 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Deploying to production..." -ForegroundColor Yellow
Write-Host ""

# Deploy with verbose output
npx vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your site should be live at: https://see-zee.com" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Exit code: $LASTEXITCODE" -ForegroundColor Red
}









