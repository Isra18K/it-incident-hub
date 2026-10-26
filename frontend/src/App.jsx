import React, { useEffect, useState } from 'react';
import { getIncidents, createIncident, updateStatus, assignTechnician } from './api';
import './App.css';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Redes',
    priority: 'Media',
    username: ''
  });
  const [filterStatus, setFilterStatus] = useState('TODOS');

  const fetchIncidents = async () => {
    try {
      const res = await getIncidents();
      setIncidents(res.data);
    } catch (err) {
      console.error("Error al obtener incidentes:", err);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createIncident(form);
      setForm({ title: '', description: '', category: 'Redes', priority: 'Media', username: '' });
      fetchIncidents();
    } catch (err) {
      console.error("Error al crear incidente:", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus(id, newStatus);
      fetchIncidents();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const handleAssign = async (id) => {
    const tech = prompt("Ingrese el nombre del técnico a asignar:");
    if (tech) {
      try {
        await assignTechnician(id, tech);
        fetchIncidents();
      } catch (err) {
        console.error("Error al asignar técnico:", err);
      }
    }
  };

  const filteredIncidents = incidents.filter(inc => {
    if (filterStatus === 'TODOS') return true;
    return inc.status === filterStatus;
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🚀 IT Incident Hub - Panel de Control DevOps</h1>

      {/* Formulario de Creación */}
      <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Registrar Nuevo Incidente</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input type="text" placeholder="Título del incidente" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required style={{ padding: '8px' }} />
          <input type="text" placeholder="Tu Nombre / Usuario" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required style={{ padding: '8px' }} />
          <textarea placeholder="Descripción detallada" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required style={{ padding: '8px', gridColumn: 'span 2' }} />
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ padding: '8px' }}>
            <option value="Redes">Redes</option>
            <option value="Software">Software</option>
            <option value="Hardware">Hardware</option>
            <option value="Base de Datos">Base de Datos</option>
          </select>
          <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} style={{ padding: '8px' }}>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
            <option value="Crítica">Crítica</option>
          </select>
          <button type="submit" style={{ gridColumn: 'span 2', background: '#007bff', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Guardar Incidente</button>
        </form>
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filtrar por Estado:</label>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '6px' }}>
          <option value="TODOS">TODOS</option>
          <option value="NUEVO">NUEVO</option>
          <option value="ASIGNADO">ASIGNADO</option>
          <option value="EN_PROCESO">EN_PROCESO</option>
          <option value="RESUELTO">RESUELTO</option>
          <option value="CERRADO">CERRADO</option>
        </select>
      </div>

      {/* Tabla de Incidentes */}
      <h3>Listado de Incidentes ({filteredIncidents.length})</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#ddd' }}>
            <th>ID</th>
            <th>Título</th>
            <th>Categoría</th>
            <th>Prioridad</th>
            <th>Reportado por</th>
            <th>Técnico</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredIncidents.map(inc => (
            <tr key={inc.id}>
              <td>{inc.id}</td>
              <td>{inc.title}</td>
              <td>{inc.category}</td>
              <td>{inc.priority}</td>
              <td>{inc.username}</td>
              <td>{inc.assigned_technician || 'Sin Asignar'}</td>
              <td><b>{inc.status}</b></td>
              <td>
                <button onClick={() => handleAssign(inc.id)} style={{ marginRight: '5px' }}>Asignar</button>
                <select value={inc.status} onChange={e => handleStatusChange(inc.id, e.target.value)}>
                  <option value="NUEVO">NUEVO</option>
                  <option value="ASIGNADO">ASIGNADO</option>
                  <option value="EN_PROCESO">EN_PROCESO</option>
                  <option value="RESUELTO">RESUELTO</option>
                  <option value="CERRADO">CERRADO</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;