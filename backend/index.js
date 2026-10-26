const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get('/', (req, res) => {
  res.json({ message: 'IT Incident Hub API funcionando correctamente 🚀' });
});

// 1. CREAR UN INCIDENTE (Task 1.1.1.2)
app.post('/api/incidents', async (req, res) => {
  const { title, description, category, priority, username } = req.body;
  try {
    const query = `
      INSERT INTO incidents (title, description, category, priority, username, status)
      VALUES ($1, $2, $3, $4, $5, 'NUEVO')
      RETURNING *;
    `;
    const values = [title, description, category, priority, username];
    const newIncident = await pool.query(query, values);
    res.status(201).json(newIncident.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error en el servidor al crear el incidente' });
  }
});

// 2. CONSULTAR TODOS LOS INCIDENTES (Task 1.1.2.2)
app.get('/api/incidents', async (req, res) => {
  try {
    const allIncidents = await pool.query('SELECT * FROM incidents ORDER BY id DESC');
    res.json(allIncidents.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al consultar los incidentes' });
  }
});

// 3. ASIGNAR TÉCNICO A UN INCIDENTE (Task 1.2.1.2)
app.put('/api/incidents/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { assigned_technician } = req.body;
  try {
    const query = `
      UPDATE incidents 
      SET assigned_technician = $1, status = 'ASIGNADO' 
      WHERE id = $2 
      RETURNING *;
    `;
    const updated = await pool.query(query, [assigned_technician, id]);
    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Incidente no encontrado' });
    }
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al asignar técnico' });
  }
});

// 4. CAMBIAR ESTADO DEL INCIDENTE (Task 1.2.2.2)
app.patch('/api/incidents/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStates = ['NUEVO', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'];
  
  if (!validStates.includes(status)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  try {
    const query = `
      UPDATE incidents 
      SET status = $1 
      WHERE id = $2 
      RETURNING *;
    `;
    const updated = await pool.query(query, [status, id]);
    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Incidente no encontrado' });
    }
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
});

// 5. AGREGAR COMENTARIO A LA BITÁCORA (Task 2.1.1.2)
app.post('/api/incidents/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { comment, author } = req.body;
  try {
    const query = `
      INSERT INTO incident_logs (incident_id, comment, author)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const newLog = await pool.query(query, [id, comment, author]);
    res.status(201).json(newLog.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al registrar el comentario' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});