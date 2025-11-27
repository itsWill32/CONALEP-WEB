"use client";
import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Filter, X, ChevronLeft, ChevronRight, User, Mail, Phone, GraduationCap, Loader2, Hash } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useGradosGrupos } from '@/hooks/useGradosGrupos';
import toast from 'react-hot-toast';
import PasswordConfirmModal from '../modals/PasswordConfirmModal';

export default function StudentsView({ onEdit }) {
  const { data, fetchStudents, deleteStudent, loading } = useData();
  const { grados, grupos, refresh } = useGradosGrupos();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ grado: '', grupo: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Carga inicial
  useEffect(() => {
    refresh();
    loadStudents(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recargar al cambiar página o filtros estrictos
  // (El buscador NO recarga, filtra en cliente como en Clases)
  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters.grado, filters.grupo]);

  const loadStudents = async () => {
    const params = { 
      page: currentPage, 
      limit: 50 
    };
    if (filters.grado) params.grado = filters.grado;
    if (filters.grupo) params.grupo = filters.grupo;
    
    await fetchStudents(params);
  };

  // Lógica de Filtrado INSTANTÁNEO (Igual que en ClasesView)
  const filteredStudents = data.students.filter(student => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      student.nombre.toLowerCase().includes(search) ||
      student.apellido_paterno.toLowerCase().includes(search) ||
      (student.apellido_materno && student.apellido_materno.toLowerCase().includes(search)) ||
      student.matricula.toLowerCase().includes(search) ||
      student.correo_institucional.toLowerCase().includes(search)
    );
  });

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setPasswordModalOpen(true);
  };

  const handleConfirmDelete = async (password) => {
    try {
      await deleteStudent(studentToDelete.alumno_id, password);
      toast.success('Alumno eliminado exitosamente');
      setPasswordModalOpen(false);
      setStudentToDelete(null);
      loadStudents(); 
    } catch (error) {
      console.error(error);
    }
  };

  const clearFilters = () => {
    setFilters({ grado: '', grupo: '' });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const pagination = data.pagination?.students || { page: 1, pages: 1, total: 0 };

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

  // Estilo para cada fila/tarjeta de alumno (Separadas)
  const studentCardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'border-color 0.2s ease',
    marginBottom: '12px', // Separación entre alumnos
    flexWrap: 'wrap',
    gap: '16px'
  };

  return (
    <>
      <div className="content-card" style={{ borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' }}>
        
        {/* --- HEADER DE LA VISTA (En tarjeta blanca) --- */}
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
                <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '10px', color: '#0284c7' }}>
                  <User size={24} />
                </div>
                Gestión de Alumnos
              </h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                Administra el padrón estudiantil y sus datos académicos
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
               <button 
                onClick={() => onEdit('students', null)} 
                className="btn btn-primary"
                style={{ 
                  padding: '10px 20px', borderRadius: '10px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                }}
              >
                <Plus size={20} />
                Nuevo Alumno
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Barra de Búsqueda */}
            <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Buscar alumno por nombre, matrícula..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchInputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline"
              style={{ padding: '10px 12px', borderRadius: '10px', height: '42px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Filter size={18} /> {showFilters ? 'Ocultar' : 'Filtros'}
            </button>
          </div>

          {/* Filtros Desplegables (Grado/Grupo) */}
          {showFilters && (
            <div style={{
              marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9',
              display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{flex: 1, minWidth: '140px'}}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Grado</label>
                <select
                  value={filters.grado}
                  onChange={(e) => setFilters({ ...filters, grado: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: '#f8fafc' }}
                >
                  <option value="">Todos</option>
                  {grados.map(g => <option key={g} value={g}>{g}° Semestre</option>)}
                </select>
              </div>
              <div style={{flex: 1, minWidth: '140px'}}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Grupo</label>
                <select
                  value={filters.grupo}
                  onChange={(e) => setFilters({ ...filters, grupo: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: '#f8fafc' }}
                >
                  <option value="">Todos</option>
                  {grupos.map(g => <option key={g} value={g}>Grupo {g}</option>)}
                </select>
              </div>
              <button 
                onClick={clearFilters} 
                className="btn-outline" 
                style={{ padding: '10px 16px', height: '42px', display: 'flex', alignItems: 'center', borderRadius: '10px', gap: '6px' }}
              >
                <X size={16} /> Limpiar
              </button>
            </div>
          )}
        </div>

        {/* --- LISTA DE ALUMNOS (Separados con fondo entre ellos) --- */}
        <div style={{ padding: '0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Loader2 className="spin" size={40} color="#3b82f6" style={{ marginBottom: '16px' }} />
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>Cargando alumnos...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', backgroundColor: 'white', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
              <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <User size={40} color="#cbd5e1" />
              </div>
              <h4 style={{ margin: '0 0 8px', color: '#475569', fontSize: '1.1rem' }}>No se encontraron alumnos</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay alumnos registrados con estos filtros'}
              </p>
            </div>
          ) : (
            <div>
              {filteredStudents.map((student) => (
                <div 
                  key={student.alumno_id} 
                  className="student-row-hover"
                  style={studentCardStyle}
                >
                  {/* Izquierda: Info Principal */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 2, minWidth: '280px' }}>
                    <div style={{ 
                      width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', 
                      color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '700', fontSize: '1rem', border: '1px solid #dbeafe'
                    }}>
                      {student.nombre.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>
                        {student.nombre} {student.apellido_paterno} {student.apellido_materno}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                          {student.matricula}
                        </span>
                        <span style={{ color: '#cbd5e1' }}>|</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} /> {student.correo_institucional}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Centro: Grado y Grupo */}
                  <div style={{ flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', background: '#f0fdf4', color: '#15803d', border: '1px solid #dcfce7' }}>
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Ubicación</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>
                        {student.grado}° "{student.grupo}"
                      </div>
                    </div>
                  </div>

                  {/* Derecha: Acciones */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => onEdit('students', student)}
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
                      onClick={() => handleDeleteClick(student)}
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

        {/* --- PAGINACIÓN --- */}
        {pagination.pages > 1 && (
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            marginTop: '20px', padding: '16px 24px', background: 'white', 
            borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
              Página <span style={{ color: '#0f172a', fontWeight: 700 }}>{currentPage}</span> de {pagination.pages}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn-outline"
                style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, borderRadius: '8px', background: 'white' }}
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                disabled={currentPage === pagination.pages}
                className="btn-outline"
                style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, borderRadius: '8px', background: 'white' }}
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <PasswordConfirmModal
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Alumno"
        message={`Estás a punto de eliminar al alumno ${studentToDelete?.nombre} ${studentToDelete?.apellido_paterno}.`}
      />

      <style jsx global>{`
        .student-row-hover:hover {
          border-color: #bfdbfe !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}