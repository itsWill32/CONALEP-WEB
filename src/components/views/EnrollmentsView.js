"use client";
import { useState, useEffect } from 'react';
import { Users, Filter, X, Search, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
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

  // Estilo base para tarjeta
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative'
  };

  return (
    <div className="content-card" style={{ borderRadius: '20px', border: 'none', boxShadow: 'none', background: 'transparent', padding: 0 }}>
      
      {/* --- HEADER & FILTROS --- */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        padding: '24px', 
        border: '1px solid #e2e8f0', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: showFilters ? '20px' : '0' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '10px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)' }}>
                <Users size={24} />
              </div>
              Gestión de Inscripciones
            </h2>
            <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.95rem' }}>
              Administra los alumnos inscritos en cada clase
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
            style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px',
                fontWeight: 600, transition: 'all 0.2s'
            }}
          >
            <Filter size={18} />
            {showFilters ? 'Ocultar Filtros' : 'Filtrar Clases'}
          </button>
        </div>

        {/* Panel de Filtros */}
        {showFilters && (
          <div style={{
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                Filtrar por Maestro
              </label>
              <div style={{ position: 'relative' }}>
                <GraduationCap size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <select
                  value={filters.maestro}
                  onChange={(e) => setFilters({ ...filters, maestro: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 16px 10px 40px', borderRadius: '10px', border: '1px solid #e2e8f0',
                    fontSize: '0.95rem', color: '#334155', outline: 'none', backgroundColor: '#f8fafc'
                  }}
                >
                  <option value="">Todos los maestros</option>
                  {maestrosUnicos.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                Búsqueda Rápida
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={filters.buscar}
                  onChange={(e) => setFilters({ ...filters, buscar: e.target.value })}
                  placeholder="Clase, código..."
                  style={{
                    width: '100%', padding: '10px 16px 10px 40px', borderRadius: '10px', border: '1px solid #e2e8f0',
                    fontSize: '0.95rem', color: '#334155', outline: 'none', backgroundColor: '#f8fafc'
                  }}
                />
                {filters.buscar && (
                    <button onClick={() => setFilters({...filters, buscar: ''})} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                        <X size={16} />
                    </button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                onClick={clearFilters} 
                className="btn-outline" 
                style={{ 
                    width: '100%', padding: '10px', borderRadius: '10px', border: '1px dashed #cbd5e1',
                    color: '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                    fontWeight: 600
                }}
                onMouseEnter={e => {e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'}}
                onMouseLeave={e => {e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#cbd5e1'}}
              >
                <X size={16} /> Limpiar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- GRID DE CLASES --- */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <p style={{ fontSize: '1.1rem' }}>Cargando clases disponibles...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div style={{ 
            textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px dashed #e2e8f0' 
        }}>
          <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <BookOpen size={40} color="#cbd5e1" />
          </div>
          <h3 style={{ color: '#475569', marginBottom: '8px' }}>No se encontraron clases</h3>
          <p style={{ color: '#94a3b8' }}>Intenta ajustar los filtros de búsqueda.</p>
          <button onClick={clearFilters} style={{ marginTop: '16px', color: '#3b82f6', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            Ver todas las clases
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {filteredClasses.map((classItem) => (
            <div
              key={classItem.clase_id}
              className="class-card hover-scale"
              style={cardStyle}
              onClick={() => onManage(classItem)}
            >
                {/* Card Header */}
                <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <span style={{ 
                            fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', 
                            background: '#eff6ff', padding: '4px 10px', borderRadius: '8px', 
                            letterSpacing: '0.5px' 
                        }}>
                            {classItem.codigo_clase}
                        </span>
                        {classItem.total_alumnos > 0 && (
                            <span style={{ 
                                fontSize: '0.8rem', fontWeight: 600, color: '#059669', 
                                display: 'flex', alignItems: 'center', gap: '4px',
                                background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px'
                            }}>
                                <Users size={14} /> {classItem.total_alumnos}
                            </span>
                        )}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: '0 0 8px', lineHeight: '1.3' }}>
                        {classItem.nombre_clase}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                        <GraduationCap size={16} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {classItem.maestro_nombre ? `${classItem.maestro_nombre} ${classItem.maestro_apellido}` : 'Sin asignar'}
                        </span>
                    </div>
                </div>

                {/* Card Footer */}
                <div style={{ 
                    padding: '16px 24px', 
                    background: '#f8fafc', 
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                        {classItem.total_alumnos === 0 ? 'Sin alumnos' : 'Gestionar lista'}
                    </span>
                    <div style={{ 
                        background: 'white', width: '36px', height: '36px', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0',
                        color: '#3b82f6'
                    }}>
                        <ArrowRight size={18} />
                    </div>
                </div>
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        .hover-scale {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-scale:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 20px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            border-color: #bfdbfe !important;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}