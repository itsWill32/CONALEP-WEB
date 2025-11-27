"use client";
import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, GraduationCap, Mail, Phone, Loader2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import toast from 'react-hot-toast';
import PasswordConfirmModal from '../modals/PasswordConfirmModal';

export default function TeachersView({ onEdit }) {
  const { data, fetchTeachers, deleteTeacher, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    const params = {};
    if (searchTerm) params.buscar = searchTerm;
    await fetchTeachers(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTeachers();
  };

  const handleDeleteClick = (teacher) => {
    setTeacherToDelete(teacher);
    setPasswordModalOpen(true);
  };

  const handleConfirmDelete = async (password) => {
    try {
      await deleteTeacher(teacherToDelete.maestro_id, password);
      toast.success('Maestro eliminado exitosamente');
      setPasswordModalOpen(false);
      setTeacherToDelete(null);
      loadTeachers(); // Refresh list after delete
    } catch (error) {
      throw error;
    }
  };

  // Estilos
  const headerStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px', flexWrap: 'wrap', gap: '16px'
  };

  const searchInputStyle = {
    padding: '10px 16px 10px 40px', borderRadius: '12px', border: '1px solid #e2e8f0',
    fontSize: '0.95rem', width: '100%', maxWidth: '300px', outline: 'none',
    transition: 'all 0.2s', color: '#334155'
  };

  // Estilo para cada fila/tarjeta de maestro (Separadas, estilo flotante)
  const teacherCardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'border-color 0.2s ease',
    marginBottom: '12px', // Separación entre maestros
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
          <div style={headerStyle}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#f3e8ff', padding: '8px', borderRadius: '10px', color: '#9333ea' }}>
                  <GraduationCap size={24} />
                </div>
                Gestión de Maestros
              </h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                Administra el personal docente de la institución
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
               <button 
                onClick={() => onEdit('teachers', null)} 
                className="btn btn-primary"
                style={{ 
                  padding: '10px 20px', borderRadius: '10px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                }}
              >
                <Plus size={20} />
                Nuevo Maestro
              </button>
            </div>
          </div>

          <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#9333ea'; e.target.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
          </form>
        </div>

        {/* --- LISTA DE MAESTROS (Separadas) --- */}
        <div style={{ padding: '0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Loader2 className="spin" size={40} color="#9333ea" style={{ marginBottom: '16px' }} />
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>Cargando maestros...</p>
            </div>
          ) : data.teachers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', backgroundColor: 'white', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
              <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <GraduationCap size={40} color="#cbd5e1" />
              </div>
              <h4 style={{ margin: '0 0 8px', color: '#475569', fontSize: '1.1rem' }}>No se encontraron maestros</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando un nuevo maestro al sistema'}
              </p>
            </div>
          ) : (
            <div>
              {data.teachers.map((teacher) => (
                <div 
                  key={teacher.maestro_id} 
                  className="teacher-row-hover"
                  style={teacherCardStyle}
                >
                  {/* Izquierda: Info Principal */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 2, minWidth: '280px' }}>
                    <div style={{ 
                      width: '42px', height: '42px', borderRadius: '10px', background: '#f3e8ff', 
                      color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '700', fontSize: '1rem', border: '1px solid #e9d5ff'
                    }}>
                      {teacher.nombre.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>
                        {teacher.nombre} {teacher.apellido_paterno} {teacher.apellido_materno}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} /> {teacher.correo_login}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Centro: Teléfono */}
                  <div style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {teacher.telefono ? (
                        <>
                            <div style={{ padding: '6px', borderRadius: '50%', background: '#f0fdf4', color: '#15803d' }}>
                                <Phone size={16} />
                            </div>
                            <span style={{ fontSize: '0.9rem', color: '#334155' }}>{teacher.telefono}</span>
                        </>
                    ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>Sin teléfono</span>
                    )}
                  </div>

                  {/* Derecha: Acciones */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => onEdit('teachers', teacher)}
                      title="Editar Maestro"
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
                      onClick={() => handleDeleteClick(teacher)}
                      title="Eliminar Maestro"
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
          setTeacherToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Maestro"
        message={`Estás a punto de eliminar al maestro ${teacherToDelete?.nombre} ${teacherToDelete?.apellido_paterno}. Todas las clases asignadas a este maestro quedarán sin instructor.`}
      />

      <style jsx global>{`
        .teacher-row-hover:hover {
          border-color: #e9d5ff !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}