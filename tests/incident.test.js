const test = require('node:test');
const assert = require('node:assert/strict');

// Validación de reglas de negocio del dominio de Incidentes
const ESTADOS_VALIDOS = ['NUEVO', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'];
const PRIORIDADES_VALIDAS = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

function validarIncidente(incidente) {
  if (!incidente.titulo || !incidente.descripcion || !incidente.categoria) {
    return { valido: false, error: 'Campos obligatorios faltantes' };
  }
  if (!ESTADOS_VALIDOS.includes(incidente.estado)) {
    return { valido: false, error: 'Estado no permitido' };
  }
  if (!PRIORIDADES_VALIDAS.includes(incidente.prioridad)) {
    return { valido: false, error: 'Prioridad inválida' };
  }
  return { valido: true };
}

test('Debe validar correctamente un incidente con todos los campos obligatorios', () => {
  const nuevoIncidente = {
    titulo: 'Caída de enlace VLAN 20',
    descripcion: 'Sin salida a internet en laboratorio',
    categoria: 'Redes',
    prioridad: 'CRITICA',
    usuario: 'sreyes',
    estado: 'NUEVO'
  };
  const resultado = validarIncidente(nuevoIncidente);
  assert.equal(resultado.valido, true);
});

test('Debe rechazar un incidente con un estado fuera del estándar DevOps', () => {
  const incidenteInvalido = {
    titulo: 'Error en impresora',
    descripcion: 'Atasco de papel',
    categoria: 'Hardware',
    prioridad: 'BAJA',
    usuario: 'sreyes',
    estado: 'PENDIENTE_REVISION' // Estado no válido según guía
  };
  const resultado = validarIncidente(incidenteInvalido);
  assert.equal(resultado.valido, false);
});