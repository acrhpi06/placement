$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$backendDir = Join-Path $scriptDir 'backend'
$frontendDir = Join-Path $scriptDir 'frontend'
$frontendUrl = 'http://localhost:5173'
$backendUrl = 'http://localhost:5000/api/health'

Write-Host 'Starting backend...'
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$backendDir'; npm.cmd run dev"

Write-Host 'Starting frontend...'
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$frontendDir'; npm.cmd run dev"

$braveCommand = Get-Command brave -ErrorAction SilentlyContinue
$bravePaths = @(
    'C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe',
    'C:\Program Files (x86)\BraveSoftware\Brave-Browser\Application\brave.exe'
)

$bravePath = if ($braveCommand) {
    $braveCommand.Source
} else {
    $bravePaths | Where-Object { Test-Path $_ -PathType Leaf } | Select-Object -First 1
}

if ($null -eq $bravePath) {
    Write-Warning 'Brave browser was not found by path. Please install Brave or add it to PATH.'
    return
}

Write-Host "Opening Brave at $frontendUrl..."
Start-Process $bravePath $frontendUrl

Write-Host 'Done. Backend on http://localhost:5000 and frontend on http://localhost:5173.'
