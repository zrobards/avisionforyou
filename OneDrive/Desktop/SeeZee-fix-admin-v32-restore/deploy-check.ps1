$ErrorActionPreference = "Continue"
Set-Location "C:\Users\seanp\OneDrive\Desktop\SeeZee-fix-admin-v32-restore"
Write-Host "Starting Vercel deployment..." -ForegroundColor Green
npx vercel --prod --yes 2>&1 | ForEach-Object { Write-Host $_ }
Write-Host "Deployment command completed with exit code: $LASTEXITCODE" -ForegroundColor Yellow

