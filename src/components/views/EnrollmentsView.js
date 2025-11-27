"use client";
import { useState, useEffect } from 'react';
import { Users, Filter, X } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useGradosGrupos } from '@/hooks/useGradosGrupos';

export default function EnrollmentsView({ onManage }) {
  const { data, fetchClasses, loading } = useData();
  const { grados, grupos } = useGradosGrupos();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    maestro: '',
    buscar: ''
  });
  const [filteredClasses, setFilteredClasses] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data.classes, filters]);

  const applyFilters = () => {
    let result = [...data.classes];

    if (filters.maestro) {
      result = result.filter(clase => 
        clase.maestro_id === parseInt(filters.maestro)
      );
    }

    if (filters.buscar) {
      const search = filters.buscar.toLowerCase();
      result = result.filter(clase =>
        clase.nombre_clase.toLowerCase().includes(search) ||
        clase.codigo_clase.toLowerCase().includes(search) ||
        clase.maestro_nombre?.toLowerCase().includes(search) ||
        clase.maestro_apellido?.toLowerCase().includes(search)
      );
    }

    setFilteredClasses(result);
  };

  const clearFilters = () => {
    setFilters({ maestro: '', buscar: '' });
  };

  // Obtener lista única de maestros
  const maestrosUnicos = Array.from(
    new Map(
      data.classes
        .filter(c => c.maestro_id)
        .map(c => [c.maestro_id, {
          id: c.maestro_id,
          nombre: `${c.maestro_nombre} ${c.maestro_apellido}`
        }])
    ).values()
  ).sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div className="content-card">
      <div className="card-header">
        <h4>Gestión de Inscripciones por Clase</h4>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-outline"
        >
          <Filter size={18} />
          Filtros
        </button>
      </div>

      {showFilters && (
        <div style={{
          padding: '20px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>
              Maestro
            </label>
            <select
              value={filters.maestro}
              onChange={(e) => setFilters({ ...filters, maestro: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            >
              <option value="">Todos</option>
              {maestrosUnicos.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>
              Buscar
            </label>
            <input
              type="text"
              value={filters.buscar}
              onChange={(e) => setFilters({ ...filters, buscar: e.target.value })}
              placeholder="Nombre o código de clase..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={clearFilters} className="btn btn-outline" style={{ width: '100%' }}>
              <X size={16} style={{ marginRight: '6px' }} />
              Limpiar
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Cargando clases...
          </div>
        ) : filteredClasses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <p>No se encontraron clases</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {filteredClasses.map((classItem) => (
              <div
                key={classItem.clase_id}
                style={{
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  background: 'white',
                  transition: '0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(44, 135, 105, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#64748b', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '4px'
                  }}>
                    {classItem.codigo_clase}
                  </div>
                  <h4 style={{ 
                    fontSize: '1.1rem', 
                    color: '#1e293b',
                    marginBottom: '8px',
                    fontWeight: 600
                  }}>
                    {classItem.nombre_clase}
                  </h4>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    👨‍🏫 {classItem.maestro_nombre} {classItem.maestro_apellido}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#0369a1',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}>
                    <Users size={18} />
                    {classItem.total_alumnos || 0} alumno{classItem.total_alumnos !== 1 ? 's' : ''}
                  </div>
                  <button
                    onClick={() => onManage(classItem)}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  >
                    Gestionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
