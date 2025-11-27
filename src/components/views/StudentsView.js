"use client";
import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(1); // ✅ AGREGAR

  useEffect(() => {
    refresh();
    loadStudents();
  }, []);

  useEffect(() => {
    setCurrentPage(1); 
    loadStudents();
  }, [filters]);

  useEffect(() => {
    loadStudents(); 
  }, [currentPage]);

  const loadStudents = async () => {
    const params = { 
      page: currentPage, 
      limit: 50 
    };
    if (searchTerm) params.buscar = searchTerm;
    if (filters.grado) params.grado = filters.grado;
    if (filters.grupo) params.grupo = filters.grupo;
    
    await fetchStudents(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // ✅ Reset a página 1
    loadStudents();
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setPasswordModalOpen(true);
  };

  const handleConfirmDelete = async (password) => {
    try {
      await deleteStudent(studentToDelete.alumno_id, password);
      toast.success('Alumno eliminado exitosamente');
    } catch (error) {
      throw error;
    }
  };

  const clearFilters = () => {
    setFilters({ grado: '', grupo: '' });
    setSearchTerm('');
    setCurrentPage(1); 
  };


  const pagination = data.pagination?.students || { page: 1, pages: 1, total: 0 };

  return (
    <>
      <div className="content-card">
        <div className="card-header">
          <h4>Gestión de Alumnos</h4>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline"
            >
              <Filter size={18} />
              Filtros
            </button>
            <button onClick={() => onEdit('students', null)} className="btn btn-primary">
              <Plus size={18} />
              Nuevo Alumno
            </button>
          </div>
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
                Grado
              </label>
              <select
                value={filters.grado}
                onChange={(e) => setFilters({ ...filters, grado: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              >
                <option value="">Todos</option>
                {grados.map(g => (
                  <option key={g} value={g}>{g}°</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>
                Grupo
              </label>
              <select
                value={filters.grupo}
                onChange={(e) => setFilters({ ...filters, grupo: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              >
                <option value="">Todos</option>
                {grupos.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
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
          <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />
              <input
                type="text"
                placeholder="Buscar por nombre, matrícula o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 45px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </form>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Cargando alumnos...
            </div>
          ) : data.students.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <p>No se encontraron alumnos</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Matrícula</th>
                      <th>Nombre</th>
                      <th>Grado/Grupo</th>
                      <th>Correo</th>
                      <th>Teléfono</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.students.map((student) => (
                      <tr key={student.alumno_id}>
                        <td><strong>{student.matricula}</strong></td>
                        <td>
                          {student.nombre} {student.apellido_paterno} {student.apellido_materno}
                        </td>
                        <td>{student.grado}° {student.grupo}</td>
                        <td>{student.correo_institucional}</td>
                        <td>{student.telefono_contacto || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => onEdit('students', student)}
                              className="btn-icon-primary"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(student)}
                              className="btn-icon-danger"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ✅ AGREGAR: Controles de paginación */}
              {pagination.pages > 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '20px',
                  padding: '15px',
                  background: '#f8fafc',
                  borderRadius: '10px'
                }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Mostrando {((currentPage - 1) * 50) + 1} - {Math.min(currentPage * 50, pagination.total)} de {pagination.total} alumnos
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="btn btn-outline"
                      style={{ 
                        padding: '8px 12px',
                        opacity: currentPage === 1 ? 0.5 : 1,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <ChevronLeft size={18} />
                      Anterior
                    </button>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 15px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#334155'
                    }}>
                      Página {currentPage} de {pagination.pages}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                      disabled={currentPage === pagination.pages}
                      className="btn btn-outline"
                      style={{
                        padding: '8px 12px',
                        opacity: currentPage === pagination.pages ? 0.5 : 1,
                        cursor: currentPage === pagination.pages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Siguiente
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <PasswordConfirmModal
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Alumno"
        message={`Estás a punto de eliminar al alumno ${studentToDelete?.nombre} ${studentToDelete?.apellido_paterno}. Todos sus registros de inscripciones y asistencias también serán eliminados.`}
      />
    </>
  );
}
