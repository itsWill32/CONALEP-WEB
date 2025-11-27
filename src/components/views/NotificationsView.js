"use client";
import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, CheckCircle, XCircle, Trash, Clock, Bell, Filter, Calendar, MessageSquare, Users } from 'lucide-react';
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
        toast.success('Notificaciones rechazadas eliminadas');
      } else if (bulkDeleteType === 'old') {
        await deleteOldNotifications(password);
        toast.success('Notificaciones antiguas eliminadas');
      } else if (notificationToDelete) {
        await deleteNotification(notificationToDelete.notificacion_id, password);
        toast.success('Notificación eliminada exitosamente');
      }
      fetchNotifications(); // Recargar lista
    } catch (error) {
      throw error;
    }
  };

  const handleModerate = async (id, accion) => {
    try {
      await moderateNotification(id, accion);
      toast.success(`Notificación ${accion === 'aprobar' ? 'aprobada' : 'rechazada'}`);
    } catch (error) {
      console.error('Error moderating:', error);
      toast.error('Error al moderar notificación');
    }
  };

  const filteredNotifications = data.notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.status === filter;
  });

  const rejectedCount = data.notifications.filter(n => n.status === 'Rechazada').length;

  // ------ FUNCIONES DE FORMATO ------
  const getStatusBadge = (status) => {
    const config = {
      Pendiente: { bg: '#fef3c7', color: '#d97706', icon: Clock, border: '#fcd34d' },
      Aprobada: { bg: '#dcfce7', color: '#16a34a', icon: CheckCircle, border: '#bbf7d0' },
      Rechazada: { bg: '#fee2e2', color: '#dc2626', icon: XCircle, border: '#fca5a5' }
    };
    const style = config[status] || config.Pendiente;
    const Icon = style.icon;
    
    return (
      <span style={{
        background: style.bg, color: style.color, padding: '4px 10px', borderRadius: '20px',
        fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px',
        border: `1px solid ${style.border}`, textTransform: 'uppercase', letterSpacing: '0.5px'
      }}>
        <Icon size={12} strokeWidth={3} />
        {status}
      </span>
    );
  };

  const getDestinatariosLegible = (notif) => {
    const textoBase = notif.destinatarios_texto || notif.tipo_destinatario?.replace(/_/g, ' ');
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 500, color: '#334155' }}>{textoBase}</span>
        {notif.destinatarios_cantidad > 0 && (
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} /> {notif.destinatarios_cantidad} destinatarios
          </span>
        )}
      </div>
    );
  };

  const getModalTitle = () => {
    if (bulkDeleteType === 'rejected') return 'Eliminar Notificaciones Rechazadas';
    if (bulkDeleteType === 'old') return 'Eliminar Notificaciones Antiguas';
    return 'Eliminar Notificación';
  };

  const getModalMessage = () => {
    if (bulkDeleteType === 'rejected') return 'Se eliminarán todas las notificaciones rechazadas permanentemente. Esta acción limpia la base de datos y no se puede deshacer.';
    if (bulkDeleteType === 'old') return 'Se eliminarán todas las notificaciones con más de 30 días de antigüedad. Usa esto para mantener el sistema rápido. No se puede deshacer.';
    return `Estás a punto de eliminar la notificación "${notificationToDelete?.titulo}". Esta acción es irreversible.`;
  };

  // Estilo para cada tarjeta de notificación (Separadas, estilo flotante)
  const notificationCardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'border-color 0.2s ease',
    marginBottom: '12px', // Separación entre notificaciones
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#fff7ed', padding: '8px', borderRadius: '10px', color: '#ea580c', border: '1px solid #ffedd5' }}>
                  <Bell size={24} />
                </div>
                Centro de Notificaciones
              </h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                Gestiona, modera y envía comunicados a la comunidad estudiantil
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
               {rejectedCount > 0 && (
                <button 
                  onClick={() => handleBulkDeleteClick('rejected')} 
                  className="btn-danger-soft"
                  title="Limpiar rechazadas"
                  style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                >
                  <Trash size={16} /> Limpiar Rechazadas ({rejectedCount})
                </button>
              )}
              <button 
                onClick={() => handleBulkDeleteClick('old')} 
                className="btn-outline"
                title="Limpiar antiguas"
                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              >
                <Clock size={16} style={{ marginRight: '6px' }} /> Historial
              </button>
               <button 
                onClick={() => setNotificationModalOpen(true)} 
                className="btn btn-primary"
                style={{ 
                  padding: '10px 20px', borderRadius: '10px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.2)'
                }}
              >
                <Plus size={20} />
                Nueva Notificación
              </button>
            </div>
          </div>

          {/* --- TABS DE FILTRO --- */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: 'all', label: 'Todas', icon: Filter },
              { id: 'Pendiente', label: 'Pendientes', icon: Clock },
              { id: 'Aprobada', label: 'Publicadas', icon: CheckCircle },
              { id: 'Rechazada', label: 'Rechazadas', icon: XCircle }
            ].map(tab => {
              const isActive = filter === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '10px',
                    border: isActive ? '1px solid #fed7aa' : '1px solid transparent',
                    background: isActive ? '#fff7ed' : 'transparent',
                    color: isActive ? '#c2410c' : '#64748b',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer', transition: 'all 0.2s',
                    fontSize: '0.9rem', whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- LISTA DE NOTIFICACIONES (Separadas) --- */}
        <div style={{ padding: '0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <div className="spin" style={{ display: 'inline-block', marginBottom: 10 }}><Clock size={32} color="#cbd5e1" /></div>
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>Cargando notificaciones...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', backgroundColor: 'white', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
              <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <MessageSquare size={40} color="#cbd5e1" />
              </div>
              <h4 style={{ margin: '0 0 8px', color: '#475569', fontSize: '1.1rem' }}>No hay notificaciones</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                {filter !== 'all' ? `No hay notificaciones en estado "${filter}"` : 'Crea una nueva notificación para comenzar'}
              </p>
            </div>
          ) : (
            <div>
              {filteredNotifications.map((notif) => (
                <div 
                  key={notif.notificacion_id} 
                  className="notification-row-hover"
                  style={notificationCardStyle}
                >
                  {/* Izquierda: Título y Mensaje */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 2, minWidth: '280px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>
                      {notif.titulo}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%' }}>
                      {notif.mensaje}
                    </div>
                  </div>

                  {/* Centro: Audiencia y Fecha */}
                  <div style={{ flex: 1.5, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {getDestinatariosLegible(notif)}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <Calendar size={12} />
                      {notif.fecha_creacion?.split('T')[0]}
                    </div>
                  </div>

                  {/* Centro-Derecha: Estado */}
                  <div style={{ flex: 0.5, minWidth: '120px', display: 'flex', justifyContent: 'center' }}>
                    {getStatusBadge(notif.status)}
                  </div>

                  {/* Derecha: Acciones */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => onViewDetail(notif)} 
                      className="btn-icon" 
                      title="Ver Detalle"
                      style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#1e293b'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                    >
                      <Eye size={18} />
                    </button>
                    
                    {notif.status === 'Pendiente' && (
                      <>
                        <button 
                          onClick={() => handleModerate(notif.notificacion_id, 'aprobar')} 
                          className="btn-icon success" 
                          title="Aprobar Publicación"
                          style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#059669', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.borderColor = '#bbf7d0'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleModerate(notif.notificacion_id, 'rechazar')} 
                          className="btn-icon danger" 
                          title="Rechazar Publicación"
                          style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#dc2626', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    
                    <button 
                      onClick={() => handleDeleteClick(notif)} 
                      className="btn-icon delete" 
                      title="Eliminar"
                      style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#ef4444', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#ef4444'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
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

      <style jsx global>{`
        .notification-row-hover:hover {
          border-color: #fed7aa !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }
        .btn-danger-soft {
          background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
          padding: 8px 16px; borderRadius: 8px; cursor: pointer; font-weight: 600;
          display: flex; alignItems: center; gap: 8px; transition: 0.2s; fontSize: 0.85rem;
        }
        .btn-danger-soft:hover { background: #fee2e2; border-color: #fca5a5; }

        .btn-outline {
          background: white; border: 1px solid #e2e8f0; color: #475569;
          padding: 8px 16px; borderRadius: 8px; cursor: pointer; font-weight: 600;
          display: flex; alignItems: center; gap: 8px; transition: 0.2s; fontSize: 0.85rem;
        }
        .btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; }

        .btn-primary {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border: none; color: white; padding: 8px 16px; borderRadius: 8px;
          cursor: pointer; font-weight: 600; display: flex; alignItems: center; gap: 8px;
          transition: 0.2s; fontSize: 0.85rem;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3); }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}