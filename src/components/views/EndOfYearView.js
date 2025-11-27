"use client";
import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Users, 
  Calendar,
  GraduationCap,
  Database,
  RefreshCw
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useGradosGrupos } from '@/hooks/useGradosGrupos';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import PasswordConfirmModal from '../modals/PasswordConfirmModal';

export default function EndOfYearView() {
  const { 
    promoteAllStudents,
    demoteAllStudents,
    deleteAllEnrollments,
    deleteAllAttendances,
    deleteGrupoCompleto
  } = useData();

  const { grados, grupos, refresh: refreshGradosGrupos } = useGradosGrupos();
  
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [gruposConAlumnos, setGruposConAlumnos] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    refreshGradosGrupos();
    fetchGruposConAlumnos();
  }, []);

  const fetchGruposConAlumnos = async () => {
    setLoadingGroups(true);
    try {
      const response = await api.get('/admin/dashboard/stats');
      const distribucion = response.data.data.distribucion_alumnos || [];
      
      const gruposArray = distribucion.map(item => ({
        grado: item.grado,
        grupo: item.grupo,
        total: item.total
      })).sort((a, b) => {
        if (a.grado !== b.grado) return a.grado - b.grado;
        return a.grupo.localeCompare(b.grupo);
      });
      
      setGruposConAlumnos(gruposArray);
    } catch (error) {
      console.error('Error fetching grupos:', error);
      toast.error('Error al cargar grupos');
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleActionClick = (type, group = null) => {
    setActionType(type);
    setSelectedGroup(group);
    setPasswordModalOpen(true);
  };

  const handleConfirmAction = async (password) => {
    try {
      switch(actionType) {
        case 'promote':
          await promoteAllStudents(password);
          toast.success('Todos los alumnos han sido promovidos');
          await fetchGruposConAlumnos();
          await refreshGradosGrupos();
          break;
        case 'demote':
          await demoteAllStudents(password);
          toast.success('Se ha reducido el grado de los alumnos');
          await fetchGruposConAlumnos();
          await refreshGradosGrupos();
          break;
        case 'deleteEnrollments':
          await deleteAllEnrollments(password);
          toast.success('Todas las inscripciones han sido eliminadas');
          break;
        case 'deleteAttendances':
          await deleteAllAttendances(password);
          toast.success('Todas las asistencias han sido eliminadas');
          break;
        case 'deleteGroup':
          if (!selectedGroup) {
            toast.error('Selecciona un grupo');
            throw new Error('Grupo no seleccionado');
          }
          await deleteGrupoCompleto(selectedGroup.grado, selectedGroup.grupo, password);
          toast.success(`Grupo ${selectedGroup.grado}°${selectedGroup.grupo} eliminado`);
          await fetchGruposConAlumnos();
          await refreshGradosGrupos();
          break;
      }
    } catch (error) {
      throw error;
    }
  };

  const getModalTitle = () => {
    switch(actionType) {
      case 'promote': return 'Promover Todos los Alumnos';
      case 'demote': return 'Degradar Todos los Alumnos';
      case 'deleteEnrollments': return 'Eliminar Todas las Inscripciones';
      case 'deleteAttendances': return 'Eliminar Todas las Asistencias';
      case 'deleteGroup': return 'Eliminar Grupo Completo';
      default: return 'Confirmar Acción';
    }
  };

  const getModalMessage = () => {
    switch(actionType) {
      case 'promote':
        return 'Esta acción incrementará el grado de TODOS los alumnos (excepto los de 6to). Los alumnos de 6to no serán afectados. Esta acción no se puede deshacer.';
      case 'demote':
        return 'Esta acción reducirá el grado de TODOS los alumnos en 1 (excepto los de 1er grado). Esta acción no se puede deshacer.';
      case 'deleteEnrollments':
        return 'Se eliminarán TODAS las inscripciones de TODAS las clases. Los alumnos y las clases no serán eliminados, solo las relaciones de inscripción. Esta acción no se puede deshacer.';
      case 'deleteAttendances':
        return 'Se eliminarán TODOS los registros de asistencia de TODAS las clases. Esta acción no se puede deshacer y liberará espacio en la base de datos.';
      case 'deleteGroup':
        return `Se eliminarán TODOS los ${selectedGroup?.total} alumnos del grupo ${selectedGroup?.grado}°${selectedGroup?.grupo}, incluyendo sus inscripciones y asistencias. Esta acción no se puede deshacer.`;
      default:
        return 'Esta acción no se puede deshacer.';
    }
  };

  return (
    <>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header de advertencia */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '30px',
          border: '2px solid #fbbf24',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            background: '#f59e0b',
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={32} color="white" />
          </div>
          <div>
            <h3 style={{ color: '#92400e', marginBottom: '8px', fontSize: '1.3rem' }}>
              Gestión de Fin de Curso
            </h3>
            <p style={{ color: '#78350f', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Esta sección contiene operaciones destructivas que afectan a múltiples registros. 
              Todas las acciones requieren confirmación de contraseña y <strong>no se pueden deshacer</strong>.
            </p>
          </div>
        </div>

        {/* Grid de acciones */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Promover alumnos */}
          <div className="content-card" style={{ border: '2px solid #d1fae5' }}>
            <div style={{ padding: '24px' }}>
              <div style={{
                background: '#d1fae5',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <TrendingUp size={24} color="#059669" />
              </div>
              <h4 style={{ color: '#065f46', marginBottom: '8px' }}>Promover Alumnos</h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>
                Incrementa el grado de todos los alumnos. Los de 6to no serán afectados.
              </p>
              <button
                onClick={() => handleActionClick('promote')}
                className="btn"
                style={{ 
                  width: '100%',
                  background: '#10b981',
                  color: 'white'
                }}
              >
                <TrendingUp size={18} style={{ marginRight: '8px' }} />
                Promover Todos
              </button>
            </div>
          </div>

          {/* Degradar alumnos */}
          <div className="content-card" style={{ border: '2px solid #fee2e2' }}>
            <div style={{ padding: '24px' }}>
              <div style={{
                background: '#fee2e2',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <TrendingDown size={24} color="#dc2626" />
              </div>
              <h4 style={{ color: '#991b1b', marginBottom: '8px' }}>Degradar Alumnos</h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>
                Reduce el grado de todos los alumnos en 1. Los de 1er grado no serán afectados.
              </p>
              <button
                onClick={() => handleActionClick('demote')}
                className="btn"
                style={{ 
                  width: '100%',
                  background: '#ef4444',
                  color: 'white'
                }}
              >
                <TrendingDown size={18} style={{ marginRight: '8px' }} />
                Degradar Todos
              </button>
            </div>
          </div>

          {/* Eliminar inscripciones */}
          <div className="content-card" style={{ border: '2px solid #fef3c7' }}>
            <div style={{ padding: '24px' }}>
              <div style={{
                background: '#fef3c7',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <GraduationCap size={24} color="#d97706" />
              </div>
              <h4 style={{ color: '#92400e', marginBottom: '8px' }}>Limpiar Inscripciones</h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>
                Elimina todas las inscripciones de todas las clases. Los alumnos permanecerán.
              </p>
              <button
                onClick={() => handleActionClick('deleteEnrollments')}
                className="btn"
                style={{ 
                  width: '100%',
                  background: '#f59e0b',
                  color: 'white'
                }}
              >
                <Trash2 size={18} style={{ marginRight: '8px' }} />
                Eliminar Inscripciones
              </button>
            </div>
          </div>

          {/* Eliminar asistencias */}
          <div className="content-card" style={{ border: '2px solid #e0e7ff' }}>
            <div style={{ padding: '24px' }}>
              <div style={{
                background: '#e0e7ff',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Calendar size={24} color="#4f46e5" />
              </div>
              <h4 style={{ color: '#3730a3', marginBottom: '8px' }}>Limpiar Asistencias</h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>
                Elimina todos los registros de asistencia de todas las clases.
              </p>
              <button
                onClick={() => handleActionClick('deleteAttendances')}
                className="btn"
                style={{ 
                  width: '100%',
                  background: '#6366f1',
                  color: 'white'
                }}
              >
                <Calendar size={18} style={{ marginRight: '8px' }} />
                Eliminar Asistencias
              </button>
            </div>
          </div>
        </div>

        {/* Eliminar grupos - Nueva UX */}
        <div className="content-card" style={{ border: '2px solid #fee2e2' }}>
          <div className="card-header" style={{ background: '#fef2f2', borderBottom: '2px solid #fee2e2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: '#fecaca',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <Users size={24} color="#dc2626" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#991b1b' }}>Eliminar Grupos Completos</h4>
                <p style={{ fontSize: '0.85rem', color: '#7f1d1d', margin: 0 }}>
                  Grupos existentes con alumnos registrados
                </p>
              </div>
              <button
                onClick={fetchGruposConAlumnos}
                className="btn btn-outline"
                style={{ padding: '8px 16px' }}
                disabled={loadingGroups}
              >
                <RefreshCw size={16} style={{ marginRight: '6px' }} />
                Actualizar
              </button>
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            {loadingGroups ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                Cargando grupos...
              </div>
            ) : gruposConAlumnos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p>No hay grupos con alumnos registrados</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '12px'
              }}>
                {gruposConAlumnos.map((grupo) => (
                  <div
                    key={`${grupo.grado}-${grupo.grupo}`}
                    style={{
                      padding: '16px',
                      border: '2px solid #fee2e2',
                      borderRadius: '12px',
                      background: '#fef2f2',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: '0.2s'
                    }}
                  >
                    <div>
                      <div style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: 700, 
                        color: '#991b1b',
                        marginBottom: '4px'
                      }}>
                        {grupo.grado}° {grupo.grupo}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>
                        {grupo.total} alumno{grupo.total !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => handleActionClick('deleteGroup', grupo)}
                      className="btn-icon-danger"
                      style={{ padding: '8px' }}
                      title={`Eliminar grupo ${grupo.grado}°${grupo.grupo}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info adicional */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Database size={20} color="#64748b" />
            <h4 style={{ color: '#334155', margin: 0 }}>Recomendaciones</h4>
          </div>
          <ul style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
            <li>Realiza estas operaciones al <strong>final del ciclo escolar</strong></li>
            <li>Se recomienda hacer un <strong>respaldo de la base de datos</strong> antes de ejecutar estas acciones</li>
            <li>Promover alumnos automáticamente pasará a los de 5to a 6to grado</li>
            <li>Limpiar inscripciones y asistencias ayuda a <strong>reducir el tamaño de la base de datos</strong></li>
            <li>Todas estas acciones requieren <strong>contraseña de administrador</strong></li>
          </ul>
        </div>
      </div>

      <PasswordConfirmModal
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setActionType(null);
          setSelectedGroup(null);
        }}
        onConfirm={handleConfirmAction}
        title={getModalTitle()}
        message={getModalMessage()}
      />
    </>
  );
}
