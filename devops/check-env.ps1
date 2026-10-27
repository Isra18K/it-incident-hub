# Script de verificacion de entorno DevOps y Agente Local
Write-Host "Verificando estado de Docker y Node.js para IT Incident Hub..."
docker ps --filter "name=incident_db"
node -v
npm -v
