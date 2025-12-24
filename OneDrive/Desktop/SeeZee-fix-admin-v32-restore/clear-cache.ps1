# Clear Next.js build cache
Write-Host "Clearing Next.js build cache..." -ForegroundColor Yellow

# Stop any running Node processes (optional - uncomment if needed)
# Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove .next directory
if (Test-Path ".next") {
    Write-Host "Removing .next directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Write-Host "✓ .next directory removed" -ForegroundColor Green
} else {
    Write-Host "No .next directory found" -ForegroundColor Gray
}

# Remove node_modules/.cache if it exists
if (Test-Path "node_modules/.cache") {
    Write-Host "Removing node_modules/.cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue
    Write-Host "✓ Cache directory removed" -ForegroundColor Green
}

# Remove Turbopack cache
if (Test-Path ".turbo") {
    Write-Host "Removing .turbo directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".turbo" -ErrorAction SilentlyContinue
    Write-Host "✓ .turbo directory removed" -ForegroundColor Green
}

Write-Host "`nCache cleared! Please restart your dev server." -ForegroundColor Green






