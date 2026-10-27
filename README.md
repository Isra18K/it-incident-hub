# IT Incident Hub - Plataforma Trazable de Gestión de Incidentes TI

Solución web full-stack contenerizada y gestionada bajo prácticas DevOps de integración y entrega continua (CI/CD) para centralizar, dar seguimiento y medir la resolución de incidentes tecnológicos.

## 1. Requisitos Previos
- **Docker y Docker Compose** (para la base de datos PostgreSQL 15-alpine)
- **Node.js v20+** y **npm**
- **Git**
- **Agente Autohospedado de Azure DevOps** configurado localmente

## 2. Instalación y Ejecución Local

### Paso 1: Levantar Base de Datos Contenerizada
```bash
cd database
docker compose up -d