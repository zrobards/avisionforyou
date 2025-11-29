$logFile = "C:\Users\seanp\OneDrive\Desktop\SeeZee-fix-admin-v32-restore\deployment-log.txt"
$ErrorActionPreference = "Continue"

"=== Vercel Deployment Log ===" | Out-File -FilePath $logFile
"Started at: $(Get-Date)" | Out-File -FilePath $logFile -Append
"" | Out-File -FilePath $logFile -Append

Set-Location "C:\Users\seanp\OneDrive\Desktop\SeeZee-fix-admin-v32-restore"

"Running: npx vercel --prod --yes" | Out-File -FilePath $logFile -Append
"" | Out-File -FilePath $logFile -Append

npx vercel --prod --yes 2>&1 | Tee-Object -FilePath $logFile -Append

"" | Out-File -FilePath $logFile -Append
"Completed at: $(Get-Date)" | Out-File -FilePath $logFile -Append
"Exit code: $LASTEXITCODE" | Out-File -FilePath $logFile -Append

