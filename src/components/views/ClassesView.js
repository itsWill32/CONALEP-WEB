"use client";
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Users } from 'lucide-react';
import { useData } from '@/context/DataContext';
import toast from 'react-hot-toast';
import PasswordConfirmModal from '../modals/PasswordConfirmModal';

export default function ClassesView({ onEdit }) {
  const { data, fetchClasses, deleteClass, loading } = useData();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);

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
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <div className="content-card">
        <div className="card-header">
          <h4>Gestión de Clases</h4>
          <button onClick={() => onEdit('classes', null)} className="btn btn-primary">
            <Plus size={18} />
            Nueva Clase
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Cargando clases...
            </div>
          ) : data.classes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <p>No se encontraron clases</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre de la Clase</th>
                    <th>Maestro</th>
                    <th style={{ textAlign: 'center' }}>Alumnos</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.classes.map((classItem) => (
                    <tr key={classItem.clase_id}>
                      <td><strong>{classItem.codigo_clase}</strong></td>
                      <td>{classItem.nombre_clase}</td>
                      <td>
                        {classItem.maestro_nombre} {classItem.maestro_apellido}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          background: '#f0f9ff',
                          color: '#0369a1',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}>
                          <Users size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          {classItem.total_alumnos || 0}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => onEdit('classes', classItem)}
                            className="btn-icon-primary"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(classItem)}
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
          setClassToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Clase"
        message={`Estás a punto de eliminar la clase "${classToDelete?.nombre_clase}". Todos los alumnos inscritos y registros de asistencia serán eliminados.`}
      />
    </>
  );
}
