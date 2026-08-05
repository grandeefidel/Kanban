# Stop and remove the Kanban container. The kanban-data volume is kept.
$Container = "kanban"

if (docker ps -aq --filter "name=^$Container$") {
    docker rm -f $Container | Out-Null
    Write-Host "Kanban stopped."
} else {
    Write-Host "Kanban was not running."
}
