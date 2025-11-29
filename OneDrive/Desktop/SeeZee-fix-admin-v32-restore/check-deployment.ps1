Set-Location "C:\Users\seanp\OneDrive\Desktop\SeeZee-fix-admin-v32-restore"

# List recent deployments
Write-Host "Checking recent deployments..." -ForegroundColor Cyan
$deployments = npx vercel ls --yes 2>&1
$deployments | Out-File -FilePath "deployments.txt"
Write-Host "Deployments saved to deployments.txt" -ForegroundColor Green

# Get project info  
Write-Host "`nGetting project info..." -ForegroundColor Cyan
$projectInfo = npx vercel project ls --yes 2>&1
$projectInfo | Out-File -FilePath "project-info.txt"
Write-Host "Project info saved to project-info.txt" -ForegroundColor Green

