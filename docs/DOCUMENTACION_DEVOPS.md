# Documentación Técnica, Seguridad y Estrategia DevOps - IT Incident Hub
**Proyecto:** Ingeniería en Sistemas / Proyecto Integrador DevOps  
**Responsable Principal:** Samuel Israel Reyes Tanahuvia  
**Versión Actual:** `v1.0.0`

---

## 1. Arquitectura del Sistema
El sistema **IT Incident Hub** está diseñado bajo una arquitectura de 3 capas desacopladas gestionadas en un monorepo y respaldadas por contenedores Docker:
- **Capa de Presentación (Frontend):** SPA construida en React + Vite (puerto `5173`), que incorpora el Dashboard de indicadores operativos, 4 filtros multicriterio en tiempo real (estado, prioridad, categoría y técnico) y el módulo de Ayuda Inteligente. Se comunica con el backend mediante peticiones HTTP con Axios.
- **Capa de Lógica de Negocio (Backend):** API RESTful en Node.js y Express (puerto `4000`) encargada de gestionar el ciclo de vida de los incidentes (`NUEVO`, `ASIGNADO`, `EN_PROCESO`, `RESUELTO`, `CERRADO`), la asignación de técnicos y el historial de bitácoras.
- **Capa de Persistencia (Base de Datos):** Contenedor `incident_db` basado en `postgres:15-alpine` con volúmenes persistentes y aprovisionamiento automático de esquema mediante `database/init.sql`.

---

## 2. Estrategia de Branching y Flujo de Trabajo (GitFlow Simplificado)
Para proteger la estabilidad del entorno productivo, el repositorio aplica las siguientes políticas:
- **`main`:** Rama principal protegida e inmutable ante commits directos. Solo recibe cambios mediante Pull Requests (PR) aprobados y con validaciones CI en verde.
- **`feature/*`:** Ramas para nuevas funcionalidades (ej. `feature/AB#12-dashboard-indicadores`, `feature/AB#15-filtros-avanzados`).
- **`fix/*`:** Ramas para corrección de defectos o fallos en pipelines (ej. `fix/AB#21-validacion-estados-test`).
- **`refactor/*`:** Ramas destinadas a pagar deuda técnica y optimizar código sin alterar el comportamiento externo (ej. `refactor/AB#18-extraccion-variables-entorno`).
- **Trazabilidad:** Todo commit y Pull Request incluye la referencia `AB#<ID>` para vincular el cambio técnico con su Work Item correspondiente en Azure Boards.

---

## 3. Gestión de Seguridad y Secretos
1. **Exclusión en el Control de Versiones:** El archivo `.gitignore` bloquea explícitamente archivos `.env`, certificados y configuraciones locales para evitar la exposición de credenciales en commits o capturas.
2. **Inyección de Secretos en CI/CD:** Las cadenas de conexión a PostgreSQL, credenciales de usuario y puertos sensibles se almacenan como **Variables Secretas cifradas** dentro de Azure Pipelines (`SECRET_DB_PASSWORD`, `SECRET_DB_HOST`) y **GitHub Actions Secrets**.
3. **Principio de Menor Privilegio:** La conexión de la API hacia PostgreSQL se realiza parametrizando las consultas SQL (`$1, $2`) mediante el driver `pg`, mitigando ataques de inyección SQL.

---

## 4. Reporte de Auditoría de Dependencias (`npm audit`)
Se ejecutó un análisis estático de vulnerabilidades sobre los árboles de dependencias de `backend/` y `frontend/`:

| Paquete / Módulo | Entorno | Severidad Detectada | Vulnerabilidad / Descripción | Decisión Técnica Tomada |
| :--- | :--- | :--- | :--- | :--- |
| `express`, `pg`, `cors`, `dotenv` | Producción (Backend) | **0 Vulnerabilidades** | N/A | Aprobado para producción sin restricciones. |
| `react`, `react-dom`, `axios` | Producción (Frontend) | **0 Vulnerabilidades** | N/A | Versiones actualizadas y verificadas para el artefacto final. |
| `esbuild` / dependencias transitivas de `vite` | Desarrollo (`devDependencies`) | **Moderada (`moderate`)** | Alerta asociada únicamente al servidor de desarrollo local de Vite. | **Riesgo Aceptado y Mitigado:** El paquete no forma parte del bundle estático compilado (`dist/`) que se empaqueta en el artefacto de producción. |

---

## 5. Registro y Mitigación de Deuda Técnica
Cumpliendo con el estándar de calidad del proyecto, se identificaron **5 deudas técnicas reales**, de las cuales **3 fueron resueltas mediante trabajo trazable** antes del lanzamiento `v1.0.0`:

| ID | Deuda Técnica Identificada | Impacto | Estado | Acción / Resolución Trazable |
| :--- | :--- | :--- | :--- | :--- |
| **DT-01** | Credenciales de base de datos definidas en código fuente plano (`hardcoded`). | Crítico (Seguridad) | **RESUELTA** | Migración a variables de entorno con `dotenv` y secretos protegidos en Azure Pipelines (`refactor/AB#18-variables-entorno`). |
| **DT-02** | Ausencia de validación estricta en los estados y campos de creación de incidentes. | Alto (Integridad) | **RESUELTA** | Implementación de validaciones en formularios controlados en React y reglas de negocio verificadas en `tests/incident.test.js` (`fix/AB#19-validacion-esquemas`). |
| **DT-03** | Filtrado limitado únicamente por estado del incidente en la vista principal. | Medio (Usabilidad) | **RESUELTA** | Refactorización de la interfaz para soportar filtrado simultáneo por estado, prioridad, categoría y técnico junto con el Dashboard de métricas (`feature/AB#20-dashboard-multifiltros`). |
| **DT-04** | Ausencia de paginación del lado del servidor (`LIMIT`/`OFFSET`) en el endpoint `GET /api/incidents`. | Medio (Rendimiento) | **DOCUMENTADA (Backlog)** | Con volúmenes menores a 1,000 registros el filtrado en memoria es inmediato; se programa implementar paginación SQL en `v1.1.0`. |
| **DT-05** | Falta de índices compuestos en PostgreSQL sobre las columnas `estado`, `prioridad` y `categoria`. | Bajo (Base de Datos) | **DOCUMENTADA (Backlog)** | Registrada en el backlog técnico para optimizar consultas analíticas del Dashboard cuando la tabla supere los 10,000 incidentes. |

---

## 6. Versionado Semántico y Estrategia de Release
### Secuencia de Versiones (Semantic Versioning)
- **`v0.1.0` (Semana 1):** Inicialización del monorepo, base de datos en Docker (`init.sql`), CRUD base en Express y estructura inicial en React.
- **`v0.2.0` (Semana 2):** Integración de bitácora de comentarios, asignación de técnicos, configuración de `azure-pipelines.yml`, agente autohospedado, workflow en GitHub Actions y resolución de deudas técnicas DT-01 y DT-02.
- **`v1.0.0` (Semana 3 - Release Final):** Incorporación del Dashboard de indicadores, los 4 filtros operativos, empaquetado de artefacto verificado y cierre del ciclo de pruebas.

### Estrategia de Lanzamiento y Controles de Aprobación
El despliegue de **IT Incident Hub** se estructura en tres ambientes progresivos dentro de Azure DevOps Releases:
1. **Ambiente `Desarrollo (Dev)`:** Despliegue automático tras cada fusión exitosa a `main` que genere el artefacto `drop-incident-hub`.
2. **Ambiente `Pre-Producción (QA / Staging)`:** Requiere como **control pre-despliegue (Pre-deployment approval)** que el pipeline de CI haya superado el 100% de las pruebas automatizadas y la auditoría `npm audit`. Aquí se valida la integración con el contenedor PostgreSQL.
3. **Ambiente `Producción (Prod - v1.0.0)`:** Protegido mediante un **Control de Aprobación Manual (Manual Approval Gate)** en Azure DevOps asignado al líder técnico, quien verifica la bitácora de cambios, la ausencia de secretos expuestos y autoriza la liberación final.