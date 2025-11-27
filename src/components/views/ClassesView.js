"use client";
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Users, BookOpen, GraduationCap, Loader2, Search, Hash } from 'lucide-react';
import { useData } from '@/context/DataContext';
import toast from 'react-hot-toast';
import PasswordConfirmModal from '../modals/PasswordConfirmModal';

export default function ClassesView({ onEdit }) {
  const { data, fetchClasses, deleteClass, loading } = useData();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleDeleteClick = (classItem) => {
    setClassToDelete(classItem);
    setPasswordModalOpen(true);
  };

  const handleConfirmDelete = async (password) => {
    try {
      await deleteClass(classToDelete.clase_id, password);
      toast.success('Clase eliminada exitosamente');
      setClassToDelete(null);
      setPasswordModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  // Filtrado de clases
  const filteredClasses = data.classes.filter(c => 
    c.nombre_clase.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.codigo_clase.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.maestro_nombre && c.maestro_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Estilos
  const searchInputStyle = {
    padding: '10px 16px 10px 40px', borderRadius: '12px', border: '1px solid #e2e8f0',
    fontSize: '0.95rem', width: '100%', maxWidth: '300px', outline: 'none',
    transition: 'all 0.2s', color: '#334155'
  };

  // Estilo para cada fila/tarjeta de clase (Separadas, igual que en StudentsView)
  const classCardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'border-color 0.2s ease',
    marginBottom: '12px', // Separación entre clases para efecto flotante
    flexWrap: 'wrap',
    gap: '16px'
  };

  return (
    <>
      <div className="content-card" style={{ borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' }}>
        
        {/* --- HEADER DE LA VISTA --- */}
        <div style={{ 
            padding: '24px', 
            backgroundColor: 'white', 
            borderRadius: '20px', 
            border: '1px solid #e2e8f0',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '10px', color: '#0284c7' }}>
                  <BookOpen size={24} />
                </div>
                Gestión de Clases
              </h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                Administra las materias y asignaciones docentes
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
               <button 
                onClick={() => onEdit('classes', null)} 
                className="btn btn-primary"
                style={{ 
                  padding: '10px 20px', borderRadius: '10px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                }}
              >
                <Plus size={20} />
                Nueva Clase
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, código o maestro..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* --- LISTA DE CLASES (Separadas) --- */}
        <div style={{ padding: '0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Loader2 className="spin" size={40} color="#3b82f6" style={{ marginBottom: '16px' }} />
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>Cargando catálogo de clases...</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', backgroundColor: 'white', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
              <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <BookOpen size={40} color="#cbd5e1" />
              </div>
              <h4 style={{ margin: '0 0 8px', color: '#475569', fontSize: '1.1rem' }}>No se encontraron clases</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando una nueva clase al sistema'}
              </p>
            </div>
          ) : (
            <div>
              {filteredClasses.map((classItem) => (
                <div 
                  key={classItem.clase_id} 
                  className="class-row-hover"
                  style={classCardStyle}
                >
                  {/* Izquierda: Info Principal */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 2, minWidth: '280px' }}>
                    <div style={{ 
                      width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', 
                      color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '700', fontSize: '1rem', border: '1px solid #dbeafe'
                    }}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>
                        {classItem.nombre_clase}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ 
                          fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px',
                          display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}>
                          <Hash size={12} /> {classItem.codigo_clase}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Centro: Maestro */}
                  <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {classItem.maestro_id ? (
                      <>
                        <div style={{ padding: '8px', borderRadius: '50%', background: '#f3e8ff', color: '#9333ea' }}>
                          <GraduationCap size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Maestro</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#334155' }}>
                            {classItem.maestro_nombre} {classItem.maestro_apellido}
                          </div>
                        </div>
                      </>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>Sin asignar</span>
                    )}
                  </div>

                  {/* Centro-Derecha: Inscritos */}
                  <div style={{ flex: 0.5, minWidth: '100px', display: 'flex', justifyContent: 'center' }}>
                    <span style={{
                      background: classItem.total_alumnos > 0 ? '#ecfdf5' : '#f1f5f9',
                      color: classItem.total_alumnos > 0 ? '#059669' : '#64748b',
                      padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700,
                      border: classItem.total_alumnos > 0 ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                      display: 'inline-flex', alignItems: 'center', gap: '6px'
                    }}>
                      <Users size={14} />
                      {classItem.total_alumnos || 0}
                    </span>
                  </div>

                  {/* Derecha: Acciones */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => onEdit('classes', classItem)}
                      title="Editar"
                      style={{ 
                        background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                        padding: '8px', cursor: 'pointer', color: '#3b82f6', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#eff6ff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(classItem)}
                      title="Eliminar"
                      style={{ 
                        background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                        padding: '8px', cursor: 'pointer', color: '#ef4444', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación */}
      <PasswordConfirmModal
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setClassToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Clase"
        message={classToDelete ? `Estás a punto de eliminar la clase "${classToDelete.nombre_clase}". Esto eliminará permanentemente el registro y desvinculará a todos los alumnos inscritos.` : ''}
      />

      <style jsx global>{`
        .class-row-hover:hover {
          border-color: #bfdbfe !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}