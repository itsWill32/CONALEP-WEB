"use client";
import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, CheckCircle, XCircle, Trash, Clock } from 'lucide-react';
import { useData } from '@/context/DataContext';
import toast from 'react-hot-toast';
import PasswordConfirmModal from '../modals/PasswordConfirmModal';
import NotificationModal from '../modals/NotificationModal';

export default function NotificationsView({ onViewDetail }) {
  const { 
    data, 
    fetchNotifications, 
    deleteNotification, 
    moderateNotification,
    deleteRejectedNotifications,
    deleteOldNotifications,
    loading 
  } = useData();
  
  const [filter, setFilter] = useState('all');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [bulkDeleteType, setBulkDeleteType] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDeleteClick = (notification) => {
    setNotificationToDelete(notification);
    setBulkDeleteType(null);
    setPasswordModalOpen(true);
  };

  const handleBulkDeleteClick = (type) => {
    setBulkDeleteType(type);
    setNotificationToDelete(null);
    setPasswordModalOpen(true);
  };

  const handleConfirmDelete = async (password) => {
    try {
      if (bulkDeleteType === 'rejected') {
        await deleteRejectedNotifications(password);
      } else if (bulkDeleteType === 'old') {
        await deleteOldNotifications(password);
      } else if (notificationToDelete) {
        await deleteNotification(notificationToDelete.notificacion_id, password);
        toast.success('Notificación eliminada exitosamente');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleModerate = async (id, accion) => {
    try {
      await moderateNotification(id, accion);
    } catch (error) {
      console.error('Error moderating:', error);
    }
  };

  const filteredNotifications = data.notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.status === filter;
  });

  // ------ FUNCIONES DE FORMATO ------
  const getStatusBadge = (status) => {
    const styles = {
      Pendiente: { bg: '#fef3c7', color: '#92400e' },
      Aprobada: { bg: '#d1fae5', color: '#065f46' },
      Rechazada: { bg: '#fee2e2', color: '#991b1b' }
    };
    const style = styles[status] || styles.Pendiente;
    
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: 600
      }}>
        {status}
      </span>
    );
  };

  const getModalTitle = () => {
    if (bulkDeleteType === 'rejected') return 'Eliminar Notificaciones Rechazadas';
    if (bulkDeleteType === 'old') return 'Eliminar Notificaciones Antiguas';
    return 'Eliminar Notificación';
  };

  const getModalMessage = () => {
    if (bulkDeleteType === 'rejected') {
      return 'Estás a punto de eliminar todas las notificaciones rechazadas. Esta acción no se puede deshacer.';
    }
    if (bulkDeleteType === 'old') {
      return 'Estás a punto de eliminar todas las notificaciones con más de 1 mes de antigüedad. Esta acción no se puede deshacer.';
    }
    return `Estás a punto de eliminar la notificación "${notificationToDelete?.titulo}". Esta acción no se puede deshacer.`;
  };

  const getDestinatariosLegible = (notif) => {
    // Si el backend ya envió el texto procesado, usarlo
    if (notif.destinatarios_texto) {
      return notif.destinatarios_cantidad 
        ? `${notif.destinatarios_texto} (${notif.destinatarios_cantidad} alumnos)`
        : notif.destinatarios_texto;
    }
  
    // Fallback por si el backend no procesó
    switch (notif.tipo_destinatario) {
      case 'TODOS_ALUMNOS':
        return 'Todos los alumnos';
      case 'ALUMNOS_GRADO':
        return notif.destinatario_grado ? `${notif.destinatario_grado}° Grado` : 'Alumnos Grado';
      case 'ALUMNOS_GRUPO':
        return notif.destinatario_grado && notif.destinatario_grupo
          ? `Grupo ${notif.destinatario_grado}°${notif.destinatario_grupo}`
          : 'Alumnos Grupo';
      case 'ALUMNOS_CLASE':
        return 'Alumnos de una clase';
      case 'ALUMNOS_ESPECIFICOS':
        return 'Alumnos específicos';
      default:
        return notif.tipo_destinatario.replace(/_/g, ' ');
    }
  };
  
  const getFechaLegible = (fechaStr) => {
    // El backend ya formatea la fecha
    if (fechaStr && typeof fechaStr === 'string') {
      return fechaStr;
    }
    return 'Sin fecha';
  };
  

  const rejectedCount = data.notifications.filter(n => n.status === 'Rechazada').length;

  // ------ UI ------
  return (
    <>
      <div className="content-card">
        <div className="card-header">
          <h4>Gestión de Notificaciones</h4>
          <div style={{ display: 'flex', gap: '10px' }}>
            {rejectedCount > 0 && (
              <button 
                onClick={() => handleBulkDeleteClick('rejected')} 
                className="btn"
                style={{ background: '#ef4444', color: 'white' }}
              >
                <Trash size={16} style={{ marginRight: '6px' }} />
                Limpiar Rechazadas ({rejectedCount})
              </button>
            )}
            <button 
              onClick={() => handleBulkDeleteClick('old')} 
              className="btn btn-outline"
            >
              <Clock size={16} style={{ marginRight: '6px' }} />
              Limpiar Antiguas
            </button>
            <button 
              onClick={() => setNotificationModalOpen(true)} 
              className="btn btn-primary"
            >
              <Plus size={18} />
              Nueva Notificación
            </button>
          </div>
        </div>

        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {['all', 'Pendiente', 'Aprobada', 'Rechazada'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: filter === status ? 'var(--primary)' : '#f1f5f9',
                color: filter === status ? 'white' : '#64748b',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.9rem',
                transition: '0.2s'
              }}
            >
              {status === 'all' ? 'Todas' : status}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Cargando notificaciones...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <p>No hay notificaciones {filter !== 'all' ? `con estado "${filter}"` : ''}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Destinatarios</th>
                    <th>Fecha Creación</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map((notif) => (
                    <tr key={notif.notificacion_id}>
                      <td><strong>{notif.titulo}</strong></td>
                      <td>{getDestinatariosLegible(notif)}</td>
                      <td>{getFechaLegible(notif.fecha_creacion)}</td>
                      <td>{getStatusBadge(notif.status)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => onViewDetail(notif)}
                            className="btn-icon-primary"
                            title="Ver detalle"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {notif.status === 'Pendiente' && (
                            <>
                              <button
                                onClick={() => handleModerate(notif.notificacion_id, 'aprobar')}
                                className="btn-icon"
                                style={{ color: '#059669' }}
                                title="Aprobar"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleModerate(notif.notificacion_id, 'rechazar')}
                                className="btn-icon"
                                style={{ color: '#dc2626' }}
                                title="Rechazar"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDeleteClick(notif)}
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
          setNotificationToDelete(null);
          setBulkDeleteType(null);
        }}
        onConfirm={handleConfirmDelete}
        title={getModalTitle()}
        message={getModalMessage()}
      />

      <NotificationModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        notification={null}
      />
    </>
  );
}
