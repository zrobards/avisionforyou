# Deploy to Vercel Production
Write-Host "Starting Vercel deployment..." -ForegroundColor Green

# Check if vercel CLI is available
try {
    $vercelVersion = npx vercel --version 2>&1
    Write-Host "Vercel CLI version: $vercelVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error checking Vercel CLI: $_" -ForegroundColor Red
    exit 1
}

# Check authentication
Write-Host "Checking Vercel authentication..." -ForegroundColor Yellow
$whoami = npx vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not authenticated. Please run: npx vercel login" -ForegroundColor Red
    exit 1
}
Write-Host "Authenticated as: $whoami" -ForegroundColor Green

# Check if project is linked
if (-not (Test-Path .vercel)) {
    Write-Host "Project not linked. Linking now..." -ForegroundColor Yellow
    npx vercel link --yes 2>&1 | ForEach-Object { Write-Host $_ }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to link project" -ForegroundColor Red
        exit 1
    }
}

# Deploy to production
Write-Host "`nDeploying to Vercel Production..." -ForegroundColor Yellow
Write-Host "This may take a few minutes...`n" -ForegroundColor Cyan

$deployOutput = npx vercel --prod --yes 2>&1
$deployOutput | ForEach-Object { Write-Host $_ }

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
    Write-Host "Check your deployment at: https://see-zee.com" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Red
    exit 1
}









