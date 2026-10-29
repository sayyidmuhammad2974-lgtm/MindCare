# Deploy MindCare ke Cloudflare Workers (static assets) - Windows PowerShell
# Pakai: .\deploy-cf.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

# 1) Sinkronkan file terbaru dari root -> public/
$files = @('index.html','chat.html','skrining.html','rujukan.html','style.css','tailwind.js','script.js','chat.js','chat-api.js','_headers')
foreach($f in $files){ Copy-Item (Join-Path $root $f) (Join-Path $root 'public') -Force }
New-Item (Join-Path $root 'public\assets') -ItemType Directory -Force | Out-Null
Copy-Item (Join-Path $root 'assets\*') (Join-Path $root 'public\assets') -Recurse -Force

# 2) Upload ke Cloudflare
npx -y wrangler@latest deploy
