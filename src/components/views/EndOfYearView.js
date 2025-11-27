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
  RefreshCw,
  ShieldAlert,
  Eraser,
  History,
  Info
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

  const { refresh: refreshGradosGrupos } = useGradosGrupos();
  
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
        return 'Esta acción incrementará el grado de TODOS los alumnos. IMPORTANTE: Asegúrate de haber eliminado a los alumnos de 6to grado antes de continuar, o permanecerán en el sistema sin grado válido.';
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

  // --- Estilos Reutilizables ---
  const cardBaseStyle = {
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%', // Forzar altura completa
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  };

  return (
    <>
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
        
        {/* --- HEADER DE ADVERTENCIA (Más sobrio) --- */}
        <div style={{
          background: '#fff',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '30px',
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-start',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ color: '#f59e0b', marginTop: '4px' }}>
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: '8px', color: '#1e293b', fontSize: '1.4rem', fontWeight: 700 }}>
              Gestión de Fin de Ciclo Escolar
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Las siguientes acciones realizan cambios masivos en la base de datos. 
              Asegúrese de contar con un respaldo y verificar la información antes de proceder. 
              Todas las operaciones requieren contraseña de administrador.
            </p>
          </div>
        </div>

        {/* --- GRID DE ACCIONES PRINCIPALES --- */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px', 
          marginBottom: '40px' 
        }}>
          
          {/* 1. Promover Alumnos */}
          <div className="action-card" style={cardBaseStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '10px', color: '#334155' }}>
                <TrendingUp size={24} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Promover Alumnos</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', flex: 1, marginBottom: '20px' }}>
              Aumenta el grado de todos los alumnos. <br/>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠️ Elimina a los alumnos de 6to antes de ejecutar esto.</span>
            </p>
            <button onClick={() => handleActionClick('promote')} className="btn-action primary">
              Promover Todos
            </button>
          </div>

          {/* 2. Degradar Alumnos */}
          <div className="action-card" style={cardBaseStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '10px', color: '#334155' }}>
                <TrendingDown size={24} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Degradar Alumnos</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', flex: 1, marginBottom: '20px' }}>
              Reduce el grado de todos los alumnos en un nivel. Útil solo para correcciones de promociones erróneas.
            </p>
            <button onClick={() => handleActionClick('demote')} className="btn-action danger-outline">
              Degradar Todos
            </button>
          </div>

          {/* 3. Limpiar Inscripciones */}
          <div className="action-card" style={cardBaseStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '10px', color: '#334155' }}>
                <Eraser size={24} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Reiniciar Inscripciones</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', flex: 1, marginBottom: '20px' }}>
              Elimina todas las relaciones entre alumnos y clases. Mantiene los perfiles de alumnos intactos.
            </p>
            <button onClick={() => handleActionClick('deleteEnrollments')} className="btn-action warning-outline">
              Eliminar Inscripciones
            </button>
          </div>

          {/* 4. Limpiar Asistencias */}
          <div className="action-card" style={cardBaseStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '10px', color: '#334155' }}>
                <History size={24} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Limpiar Asistencias</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', flex: 1, marginBottom: '20px' }}>
              Borra el historial completo de asistencias para liberar espacio al iniciar un nuevo ciclo.
            </p>
            <button onClick={() => handleActionClick('deleteAttendances')} className="btn-action info-outline">
              Eliminar Historial
            </button>
          </div>
        </div>

        {/* --- SECCIÓN: ELIMINAR GRUPOS COMPLETOS (Útil para borrar 6tos) --- */}
        <div style={{ ...cardBaseStyle, border: '1px solid #e2e8f0', padding: '0', overflow: 'hidden', marginBottom: '30px' }}>
          <div style={{ 
            padding: '20px 24px', 
            background: '#f8fafc', 
            borderBottom: '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={20} color="#475569" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 600 }}>Gestión de Grupos Activos</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Utilice esta sección para eliminar grupos salientes (ej. 6to Grado)</p>
              </div>
            </div>
            <button onClick={fetchGruposConAlumnos} disabled={loadingGroups} className="btn-refresh">
              <RefreshCw size={16} className={loadingGroups ? 'spin' : ''} /> Actualizar
            </button>
          </div>

          <div style={{ padding: '24px', background: 'white' }}>
            {loadingGroups ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                <RefreshCw size={24} className="spin" style={{ marginBottom: '10px' }} />
                <p style={{fontSize: '0.9rem'}}>Cargando grupos...</p>
              </div>
            ) : gruposConAlumnos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', border: '1px dashed #e2e8f0', borderRadius: '12px' }}>
                <p style={{ color: '#94a3b8', margin: 0 }}>No hay grupos con alumnos inscritos.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {gruposConAlumnos.map((grupo) => (
                  <div key={`${grupo.grado}-${grupo.grupo}`} className="group-card">
                    <div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#334155' }}>
                        {grupo.grado}° {grupo.grupo}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                        {grupo.total} Alumnos
                      </div>
                    </div>
                    <button 
                      onClick={() => handleActionClick('deleteGroup', grupo)}
                      className="btn-delete-group"
                      title="Eliminar este grupo completo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- RECOMENDACIONES (Actualizado) --- */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Info size={20} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: '0 0 8px', color: '#1e293b', fontSize: '0.95rem', fontWeight: 600 }}>Recomendaciones de Flujo de Trabajo</h4>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <li style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ef4444' }}>Paso 1:</strong> Elimine manualmente los <strong>grupos de 6to grado</strong> (o el grado saliente) utilizando la sección de "Gestión de Grupos Activos" de arriba. Si no hace esto, los alumnos de 6to se acumularán.
              </li>
              <li style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#0284c7' }}>Paso 2:</strong> Ejecute la acción <strong>"Promover Alumnos"</strong>. Esto pasará a 1ro a 2do, 2do a 3ro, etc.
              </li>
              <li>
                <strong style={{ color: '#f59e0b' }}>Paso 3:</strong> (Opcional) Limpie inscripciones y asistencias para preparar la base de datos para las nuevas cargas académicas.
              </li>
            </ul>
          </div>
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

      <style jsx global>{`
        /* Diseño más limpio para los botones de acción */
        .btn-action {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          border: 1px solid transparent;
        }

        .btn-action.primary {
          background: #0f172a;
          color: white;
        }
        .btn-action.primary:hover { background: #334155; }

        .btn-action.danger-outline {
          background: white;
          border-color: #fee2e2;
          color: #ef4444;
        }
        .btn-action.danger-outline:hover { background: #fef2f2; border-color: #ef4444; }

        .btn-action.warning-outline {
          background: white;
          border-color: #fef3c7;
          color: #d97706;
        }
        .btn-action.warning-outline:hover { background: #fffbeb; border-color: #f59e0b; }

        .btn-action.info-outline {
          background: white;
          border-color: #e0e7ff;
          color: #4f46e5;
        }
        .btn-action.info-outline:hover { background: #eef2ff; border-color: #6366f1; }

        .btn-refresh {
          background: white; border: 1px solid #cbd5e1; color: #475569;
          padding: 6px 12px; borderRadius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer;
          display: flex; alignItems: center; gap: 6px; transition: 0.2s;
        }
        .btn-refresh:hover { background: #f1f5f9; color: #1e293b; border-color: #94a3b8; }

        .group-card {
          background: white; border: 1px solid #e2e8f0; border-radius: 8px;
          padding: 16px; display: flex; justify-content: space-between; alignItems: center;
          transition: 0.2s;
        }
        .group-card:hover { border-color: #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        .btn-delete-group {
          background: #fff; border: 1px solid #fee2e2; color: #ef4444;
          width: 32px; height: 32px; border-radius: 6px;
          display: flex; alignItems: center; justifyContent: center;
          cursor: pointer; transition: 0.2s;
        }
        .btn-delete-group:hover { background: #ef4444; color: white; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}