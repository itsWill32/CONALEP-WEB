"use client";
import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit } from 'lucide-react';
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
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <div className="content-card">
        <div className="card-header">
          <h4>Gestión de Maestros</h4>
          <button onClick={() => onEdit('teachers', null)} className="btn btn-primary">
            <Plus size={18} />
            Nuevo Maestro
          </button>
        </div>

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
                placeholder="Buscar por nombre o correo..."
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
              Cargando maestros...
            </div>
          ) : data.teachers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <p>No se encontraron maestros</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.teachers.map((teacher) => (
                    <tr key={teacher.maestro_id}>
                      <td>
                        <strong>
                          {teacher.nombre} {teacher.apellido_paterno} {teacher.apellido_materno}
                        </strong>
                      </td>
                      <td>{teacher.correo_login}</td>
                      <td>{teacher.telefono || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => onEdit('teachers', teacher)}
                            className="btn-icon-primary"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(teacher)}
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
          )}
        </div>
      </div>

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
    </>
  );
}
