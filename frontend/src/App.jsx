import React, { useEffect, useState, useMemo } from 'react';
import { getIncidents, createIncident, updateStatus, assignTechnician, addComment } from './api';
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

  // Estados para los 4 filtros obligatorios
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [filterPriority, setFilterPriority] = useState('TODAS');
  const [filterCategory, setFilterCategory] = useState('TODAS');
  const [filterTechnician, setFilterTechnician] = useState('TODOS');

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [localComments, setLocalComments] = useState({});

  const fetchIncidents = async () => {
    try {
      const res = await getIncidents();
      setIncidents(res.data);
      if (selectedIncident) {
        const updated = res.data.find(i => i.id === selectedIncident.id);
        if (updated) setSelectedIncident(updated);
      }
    } catch (err) {
      console.error("Error al obtener incidentes:", err);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Función de Ayuda Inteligente (Autocompletado guiado)
  const handleSmartHelp = () => {
    setForm({
      title: 'Pérdida de conectividad en el Switch Core 01',
      description: 'Se reporta intermitencia en los puertos troncales del laboratorio de cómputo principal, afectando el acceso a internet y servicios internos.',
      category: 'Redes',
      priority: 'Alta',
      username: 'Samuel Reyes (Soporte)'
    });
  };

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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;
    try {
      await addComment(selectedIncident.id, commentText, commentAuthor);
      const nuevoComentario = {
        author: commentAuthor,
        comment: commentText,
        created_at: new Date().toLocaleString()
      };
      setLocalComments(prev => ({
        ...prev,
        [selectedIncident.id]: [...(prev[selectedIncident.id] || []), nuevoComentario]
      }));
      setCommentText('');
      setCommentAuthor('');
      fetchIncidents();
      alert('Comentario agregado a la bitácora con éxito');
    } catch (err) {
      console.error("Error al agregar comentario:", err);
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'NUEVO': return 'badge badge-nuevo';
      case 'ASIGNADO': return 'badge badge-asignado';
      case 'EN_PROCESO': return 'badge badge-proceso';
      case 'RESUELTO': return 'badge badge-resuelto';
      case 'CERRADO': return 'badge badge-cerrado';
      default: return 'badge';
    }
  };

  // Cálculo de Indicadores para el Dashboard Básico
  const dashboardMetrics = useMemo(() => {
    const abiertos = incidents.filter(inc =>
      ['NUEVO', 'ASIGNADO', 'EN_PROCESO'].includes(inc.status)
    ).length;

    const cerrados = incidents.filter(inc =>
      ['RESUELTO', 'CERRADO'].includes(inc.status)
    ).length;

    const criticos = incidents.filter(inc =>
      ['Crítica', 'Critica', 'CRITICA', 'Alta', 'ALTA'].includes(inc.priority)
    ).length;

    const porCategoria = incidents.reduce((acc, inc) => {
      const cat = inc.category || 'Sin categoría';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const porTecnico = incidents.reduce((acc, inc) => {
      const tec = inc.assigned_technician || 'Sin asignar';
      acc[tec] = (acc[tec] || 0) + 1;
      return acc;
    }, {});

    return { abiertos, cerrados, criticos, porCategoria, porTecnico };
  }, [incidents]);

  // Listas dinámicas para los selectores de filtro
  const uniqueTechnicians = useMemo(() => {
    return [...new Set(incidents.map(inc => inc.assigned_technician || 'Sin asignar'))];
  }, [incidents]);

  // Filtrado combinado por Estado, Prioridad, Categoría y Técnico
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchStatus = filterStatus === 'TODOS' || inc.status === filterStatus;
      const matchPriority = filterPriority === 'TODAS' || inc.priority === filterPriority;
      const matchCategory = filterCategory === 'TODAS' || inc.category === filterCategory;
      const techName = inc.assigned_technician || 'Sin asignar';
      const matchTechnician = filterTechnician === 'TODOS' || techName === filterTechnician;

      return matchStatus && matchPriority && matchCategory && matchTechnician;
    });
  }, [incidents, filterStatus, filterPriority, filterCategory, filterTechnician]);

  const resetFilters = () => {
    setFilterStatus('TODOS');
    setFilterPriority('TODAS');
    setFilterCategory('TODAS');
    setFilterTechnician('TODOS');
  };

  // Obtener comentarios del incidente seleccionado (desde backend o estado local)
  const currentComments = selectedIncident
    ? (selectedIncident.comments || localComments[selectedIncident.id] || [])
    : [];

  return (
    <div>
      {/* Barra de navegación superior */}
      <div className="top-navbar">
        <h1>🚀 IT Incident Hub</h1>
        <span>Panel de Operaciones DevOps & ITSM</span>
      </div>

      <div className="container">
        {/* DASHBOARD DE INDICADORES OPERATIVOS */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1e293b' }}>
            📊 Dashboard de Indicadores Operativos
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ background: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>INCIDENTES ABIERTOS</span>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1d4ed8', margin: '4px 0' }}>
                {dashboardMetrics.abiertos}
              </div>
              <small style={{ color: '#64748b' }}>Nuevo / Asignado / En Proceso</small>
            </div>

            <div style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>INCIDENTES CERRADOS</span>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#15803d', margin: '4px 0' }}>
                {dashboardMetrics.cerrados}
              </div>
              <small style={{ color: '#64748b' }}>Resuelto / Cerrado</small>
            </div>

            <div style={{ background: '#fef2f2', borderLeft: '4px solid #dc2626', padding: '14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>CRÍTICOS / ALTA PRIORIDAD</span>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b91c1c', margin: '4px 0' }}>
                {dashboardMetrics.criticos}
              </div>
              <small style={{ color: '#64748b' }}>Atención prioritaria requerida</small>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>POR CATEGORÍA</span>
              <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', fontSize: '0.88rem', color: '#334155' }}>
                {Object.entries(dashboardMetrics.porCategoria).length === 0 ? (
                  <li style={{ color: '#94a3b8' }}>Sin registros</li>
                ) : (
                  Object.entries(dashboardMetrics.porCategoria).map(([cat, total]) => (
                    <li key={cat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{cat}:</span>
                      <b>{total}</b>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>POR TÉCNICO</span>
              <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', fontSize: '0.88rem', color: '#334155' }}>
                {Object.entries(dashboardMetrics.porTecnico).length === 0 ? (
                  <li style={{ color: '#94a3b8' }}>Sin asignaciones</li>
                ) : (
                  Object.entries(dashboardMetrics.porTecnico).map(([tec, total]) => (
                    <li key={tec} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{tec}:</span>
                      <b>{total}</b>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Formulario de Registro */}
        <div className="card">
          <div className="card-header-flex">
            <h3>Registrar Nueva Incidencia</h3>
            <button type="button" className="btn-ai-helper" onClick={handleSmartHelp}>
              🤖 Ayuda Inteligente (Autocompletar)
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <input type="text" placeholder="Título del incidente" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <input type="text" placeholder="Tu Nombre / Usuario" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
            </div>
            <div className="form-group full">
              <textarea placeholder="Descripción detallada del problema..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            </div>
            <div className="form-group">
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value="Redes">Redes</option>
                <option value="Software">Software</option>
                <option value="Hardware">Hardware</option>
                <option value="Base de Datos">Base de Datos</option>
              </select>
            </div>
            <div className="form-group">
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="Baja">Prioridad Baja</option>
                <option value="Media">Prioridad Media</option>
                <option value="Alta">Prioridad Alta</option>
                <option value="Crítica">Prioridad Crítica</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Guardar e Iniciar Incidente</button>
          </form>
        </div>

        {/* Controles y 4 Filtros Obligatorios */}
        <div className="controls-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>
            Listado de Reportes ({filteredIncidents.length})
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <div>
              <label style={{ marginRight: '6px', fontSize: '0.85rem', color: '#64748b' }}>Estado:</label>
              <select className="status-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="TODOS">Todos</option>
                <option value="NUEVO">Nuevo</option>
                <option value="ASIGNADO">Asignado</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="RESUELTO">Resuelto</option>
                <option value="CERRADO">Cerrado</option>
              </select>
            </div>

            <div>
              <label style={{ marginRight: '6px', fontSize: '0.85rem', color: '#64748b' }}>Prioridad:</label>
              <select className="status-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                <option value="TODAS">Todas</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>

            <div>
              <label style={{ marginRight: '6px', fontSize: '0.85rem', color: '#64748b' }}>Categoría:</label>
              <select className="status-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="TODAS">Todas</option>
                <option value="Redes">Redes</option>
                <option value="Software">Software</option>
                <option value="Hardware">Hardware</option>
                <option value="Base de Datos">Base de Datos</option>
              </select>
            </div>

            <div>
              <label style={{ marginRight: '6px', fontSize: '0.85rem', color: '#64748b' }}>Técnico:</label>
              <select className="status-select" value={filterTechnician} onChange={e => setFilterTechnician(e.target.value)}>
                <option value="TODOS">Todos</option>
                {uniqueTechnicians.map(tech => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
            </div>

            <button type="button" className="btn-action" onClick={resetFilters}>
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Tabla Moderna */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Prioridad</th>
                <th>Reportado por</th>
                <th>Fecha</th>
                <th>Técnico</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>
                    No hay incidencias registradas con estos criterios de filtrado.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map(inc => (
                  <tr key={inc.id}>
                    <td><b>#{inc.id}</b></td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{inc.title}</div>
                      <small style={{ color: '#64748b' }}>{inc.description}</small>
                    </td>
                    <td>{inc.category}</td>
                    <td><b>{inc.priority}</b></td>
                    <td>{inc.username}</td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {inc.created_at ? new Date(inc.created_at).toLocaleDateString() : new Date().toLocaleDateString()}
                    </td>
                    <td>{inc.assigned_technician || <span style={{ color: '#94a3b8' }}>Sin asignar</span>}</td>
                    <td><span className={getBadgeClass(inc.status)}>{inc.status}</span></td>
                    <td>
                      <button className="btn-action" onClick={() => handleAssign(inc.id)}>Asignar</button>
                      <select className="status-select" value={inc.status} onChange={e => handleStatusChange(inc.id, e.target.value)}>
                        <option value="NUEVO">NUEVO</option>
                        <option value="ASIGNADO">ASIGNADO</option>
                        <option value="EN_PROCESO">EN_PROCESO</option>
                        <option value="RESUELTO">RESUELTO</option>
                        <option value="CERRADO">CERRADO</option>
                      </select>
                      <button className="btn-action" style={{ marginTop: '4px' }} onClick={() => setSelectedIncident(inc)}>Bitácora</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Panel de Bitácora con Historial Visible */}
        {selectedIncident && (
          <div className="card" style={{ marginTop: '30px', border: '2px solid #2563eb' }}>
            <h3>Bitácora de Seguimiento - Incidente #{selectedIncident.id}: {selectedIncident.title}</h3>
            <p style={{ color: '#64748b' }}>{selectedIncident.description}</p>

            {/* Historial de Comentarios del Incidente */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#334155' }}>
                🕒 Historial de Comentarios
              </h4>
              {currentComments.length === 0 ? (
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
                  Aún no hay comentarios registrados para este incidente.
                </p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.9rem', color: '#1e293b' }}>
                  {currentComments.map((c, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>
                      <b>{c.author || c.username || 'Técnico'}:</b> {c.comment || c.content || c.text}{' '}
                      {c.created_at && <small style={{ color: '#64748b' }}>({c.created_at})</small>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form onSubmit={handleAddComment} className="form-grid" style={{ marginTop: '15px' }}>
              <div className="form-group">
                <input type="text" placeholder="Tu nombre (Autor)" value={commentAuthor} onChange={e => setCommentAuthor(e.target.value)} required />
              </div>
              <div className="form-group full">
                <textarea placeholder="Escribe un avance o comentario técnico..." value={commentText} onChange={e => setCommentText(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" style={{ background: '#16a34a' }}>Registrar en Bitácora</button>
            </form>
            <button className="btn-action" style={{ marginTop: '15px', background: '#f1f5f9' }} onClick={() => setSelectedIncident(null)}>Cerrar Panel de Bitácora</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;