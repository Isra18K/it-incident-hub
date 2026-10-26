-- Creación de la tabla de incidentes (Task 1.1.1.1)
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    username VARCHAR(100) NOT NULL,
    assigned_technician VARCHAR(100),
    status VARCHAR(30) DEFAULT 'NUEVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creación de la tabla de bitácora y comentarios (Task 2.1.1.1)
CREATE TABLE IF NOT EXISTS incident_logs (
    id SERIAL PRIMARY KEY,
    incident_id INT REFERENCES incidents(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);