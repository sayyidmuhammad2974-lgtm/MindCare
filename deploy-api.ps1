# ================================================================
# Deploy/update backend MindCare (Railway) - Windows PowerShell
# Pakai: .\deploy-api.ps1   (project Railway harus sudah ter-link)
# !!! Setup pertama kali dilakukan manual (railway init + domain) !!!
# ================================================================
$ErrorActionPreference = 'Stop'
$backend = Join-Path $PSScriptRoot 'backend'

# 1) Sinkronkan NVIDIA_API_KEY dari backend/.env -> Railway variables
#    (nilai key tidak pernah ditampilkan/log)
$envFile = Join-Path $backend '.env'
if (Test-Path $envFile) {
    $m = Select-String -Path $envFile -Pattern '^\s*(?:export\s+)?NVIDIA_API_KEY\s*=\s*(.+?)\s*$'
    if ($m) {
        $key = $m.Matches[0].Groups[1].Value.Trim('"').Trim("'")
        $out = npx -y @railway/cli variables --set "NVIDIA_API_KEY=$key" 2>&1 | Out-String
        # Redact key dari output apapun bentuknya
        Write-Output ($out -replace [regex]::Escape($key), '***REDACTED***')
    } else {
        Write-Warning 'backend/.env ada tetapi baris NVIDIA_API_KEY tidak ditemukan - variable Railway dibiarkan.'
    }
} else {
    Write-Warning 'backend/.env tidak ada - variable Railway tidak diubah.'
}

# 2) Upload kode terbaru dari folder backend/
Push-Location $backend
try {
    npx -y @railway/cli up
} finally {
    Pop-Location
}
