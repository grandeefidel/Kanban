# Build and run the Kanban app. Windows.
$ErrorActionPreference = "Stop"

$Image = "kanban"
$Container = "kanban"
$Volume = "kanban-data"
$Port = 8000
$Root = Split-Path -Parent $PSScriptRoot

docker build --target runtime -t $Image $Root
docker rm -f $Container 2>$null | Out-Null

$EnvArgs = @()
if (Test-Path "$Root\.env") {
    $EnvArgs = @("--env-file", "$Root\.env")
}

docker run -d --name $Container -p "${Port}:8000" -v "${Volume}:/data" @EnvArgs $Image | Out-Null

Write-Host "Kanban running at http://localhost:$Port"
Write-Host "Stop it with scripts\stop.ps1"
