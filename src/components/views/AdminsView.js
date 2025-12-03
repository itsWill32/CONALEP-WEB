"use client";
import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Eye, EyeOff, Mail, User, Phone, Loader2, AlertCircle, Crown, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import PasswordConfirmModal from '../modals/PasswordConfirmModal';
import ChangePasswordModal from '../modals/ChangePasswordModal';
import { adminAuthService } from '@/services/api';

export default function AdminsView() {
  const [admins, setAdmins] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    correo_login: '',
    contraseña: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    telefono: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchAdmins();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await adminAuthService.getProfile();
      setCurrentUser(response.data.data);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await adminAuthService.getAll();
      setAdmins(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar administradores:', error);
      if (error.response?.status === 403) {
        toast.error('Solo el administrador principal puede ver esta sección');
      } else {
        toast.error('Error al cargar la lista de administradores');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.correo_login || !formData.contraseña || !formData.nombre || !formData.apellido_paterno) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    if (formData.contraseña.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      await adminAuthService.create(formData);
      toast.success('Administrador creado exitosamente');
      setShowModal(false);
      setFormData({
        correo_login: '',
        contraseña: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        telefono: ''
      });
      fetchAdmins();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error al crear administrador');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (admin) => {
    setAdminToDelete(admin);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (password) => {
    try {
      await adminAuthService.delete(adminToDelete.admin_id);
      toast.success('Administrador eliminado exitosamente');
      setDeleteModalOpen(false);
      setAdminToDelete(null);
      fetchAdmins();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error al eliminar administrador');
      throw error;
    }
  };

  const isPrincipal = currentUser?.es_principal === 1 || currentUser?.es_principal === true;

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '0.95rem',
    color: '#334155',
    backgroundColor: '#f8fafc',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#475569'
  };

  // Si no es admin principal, mostrar mensaje de restricción
  if (!loading && !isPrincipal) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px', 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        border: '1px solid #fef3c7',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
      }}>
        <div style={{ 
          background: '#fef3c7', 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 20px',
          border: '2px solid #fcd34d'
        }}>
          <Shield size={40} color="#d97706" />
        </div>
        <h3 style={{ margin: '0 0 12px', color: '#92400e', fontSize: '1.3rem', fontWeight: 700 }}>
          Acceso Restringido
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: '1rem', color: '#b45309', maxWidth: '500px', margin: '0 auto 20px' }}>
          Solo el administrador principal puede gestionar otros administradores del sistema.
        </p>
        <button 
          onClick={() => setShowChangePasswordModal(true)}
          style={{ 
            padding: '12px 24px', 
            borderRadius: '12px', 
            border: '1px solid #fbbf24',
            background: 'white',
            color: '#d97706',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fef3c7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
          }}
        >
          <Lock size={18} />
          Cambiar mi Contraseña
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="content-card" style={{ borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' }}>
        
        {/* HEADER */}
        <div style={{ 
          padding: '24px', 
          backgroundColor: 'white', 
          borderRadius: '20px', 
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#ede9fe', padding: '8px', borderRadius: '10px', color: '#7c3aed' }}>
                  <Shield size={24} />
                </div>
                Gestión de Administradores
              </h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                Administra los usuarios con acceso al panel
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowChangePasswordModal(true)}
                style={{ 
                  padding: '10px 16px', 
                  borderRadius: '10px', 
                  fontWeight: 600,
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  color: '#6366f1',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.background = '#eef2ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = 'white';
                }}
              >
                <Lock size={18} />
                Mi Contraseña
              </button>

              {isPrincipal && (
                <button 
                  onClick={() => setShowModal(true)}
                  className="btn btn-primary"
                  style={{ 
                    padding: '10px 20px', 
                    borderRadius: '10px', 
                    fontWeight: 600,
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.2)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={20} />
                  Nuevo Administrador
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LISTA DE ADMINS */}
        <div style={{ padding: '0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Loader2 className="spin" size={40} color="#8b5cf6" style={{ marginBottom: '16px' }} />
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>Cargando administradores...</p>
            </div>
          ) : admins.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', backgroundColor: 'white', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
              <Shield size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
              <p style={{ margin: 0, fontSize: '0.95rem' }}>No hay administradores registrados</p>
            </div>
          ) : (
            <div>
              {admins.map((admin) => {
                const isCurrentUser = currentUser?.admin_id === admin.admin_id;
                const isPrincipalAdmin = admin.es_principal === 1 || admin.es_principal === true;
                
                return (
                  <div 
                    key={admin.admin_id} 
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: isPrincipalAdmin ? '2px solid #fbbf24' : '1px solid #e2e8f0',
                      padding: '16px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      marginBottom: '12px',
                      flexWrap: 'wrap',
                      gap: '16px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Badge de Principal */}
                    {isPrincipalAdmin && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        color: 'white',
                        padding: '4px 12px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        borderBottomLeftRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 4px rgba(251, 191, 36, 0.3)'
                      }}>
                        <Crown size={12} />
                        PRINCIPAL
                      </div>
                    )}

                    {/* Info del Admin */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 2, minWidth: '280px' }}>
                      <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '10px', 
                        background: isPrincipalAdmin ? 'linear-gradient(135deg, #fef3c7, #fbbf24)' : '#f3e8ff', 
                        color: isPrincipalAdmin ? '#92400e' : '#7c3aed', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: '700', 
                        fontSize: '1rem', 
                        border: isPrincipalAdmin ? '2px solid #fbbf24' : '1px solid #e9d5ff'
                      }}>
                        {admin.nombre?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {admin.nombre} {admin.apellido_paterno} {admin.apellido_materno}
                          {isCurrentUser && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: '#dbeafe',
                              color: '#1e40af',
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}>
                              TÚ
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} /> {admin.correo_login}
                          </span>
                          {admin.telefono && (
                            <>
                              <span style={{ color: '#cbd5e1' }}>|</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={12} /> {admin.telefono}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badge de rol */}
                    <div style={{ flex: 1, minWidth: '120px', display: 'flex', justifyContent: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: '#f0fdf4',
                        color: '#15803d',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: '1px solid #dcfce7',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Shield size={14} />
                        Administrador
                      </span>
                    </div>

                    {/* Botón eliminar */}
                    {isPrincipal && !isPrincipalAdmin && !isCurrentUser && (
                      <button 
                        onClick={() => handleDeleteClick(admin)}
                        title="Eliminar administrador"
                        style={{ 
                          background: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '8px',
                          padding: '8px', 
                          cursor: 'pointer', 
                          color: '#ef4444', 
                          transition: 'all 0.2s',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.borderColor = '#ef4444'; 
                          e.currentTarget.style.background = '#fef2f2'; 
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.borderColor = '#e2e8f0'; 
                          e.currentTarget.style.background = 'white'; 
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL PARA CREAR ADMIN */}
      {showModal && (
        <div
          className="modal-overlay show"
          onClick={() => !submitting && setShowModal(false)}
          style={{
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '90%',
              maxWidth: '600px',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  padding: '12px',
                  borderRadius: '14px',
                  boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.2)',
                  color: 'white',
                }}>
                  <Shield size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                    Nuevo Administrador
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                    Registra un nuevo usuario con acceso completo
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '32px' }}>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* Alerta de seguridad */}
                  <div style={{
                    padding: '12px 16px',
                    background: '#fef3c7',
                    border: '1px solid #fcd34d',
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'start'
                  }}>
                    <AlertCircle size={20} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: '1.5' }}>
                      <strong>Importante:</strong> El nuevo administrador tendrá acceso completo al sistema.
                    </div>
                  </div>

                  {/* Nombre */}
                  <div>
                    <label style={labelStyle}>Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      style={inputStyle}
                      placeholder="Ej. Juan Carlos"
                    />
                  </div>

                  {/* Apellidos */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Apellido Paterno *</label>
                      <input
                        type="text"
                        name="apellido_paterno"
                        value={formData.apellido_paterno}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Apellido Materno</label>
                      <input
                        type="text"
                        name="apellido_materno"
                        value={formData.apellido_materno}
                        onChange={handleChange}
                        disabled={submitting}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Correo */}
                  <div>
                    <label style={labelStyle}>Correo de Login *</label>
                    <input
                      type="email"
                      name="correo_login"
                      value={formData.correo_login}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      style={inputStyle}
                      placeholder="admin@conalep.edu.mx"
                    />
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label style={labelStyle}>Contraseña *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="contraseña"
                        value={formData.contraseña}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                        style={{...inputStyle, paddingRight: '45px'}}
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94a3b8',
                          padding: '4px',
                          display: 'flex'
                        }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      disabled={submitting}
                      style={inputStyle}
                      placeholder="000 000-0000"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      background: 'white',
                      color: '#475569',
                      fontWeight: 600,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      background: submitting ? '#e2e8f0' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      color: submitting ? '#94a3b8' : 'white',
                      fontWeight: 600,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: submitting ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.2)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {submitting ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
                    {submitting ? 'Creando...' : 'Crear Administrador'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
      <PasswordConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAdminToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Administrador"
        message={`¿Estás seguro de eliminar a ${adminToDelete?.nombre} ${adminToDelete?.apellido_paterno}? Esta acción no se puede deshacer.`}
      />

      {/* MODAL DE CAMBIO DE CONTRASEÑA */}
      <ChangePasswordModal 
        isOpen={showChangePasswordModal} 
        onClose={() => setShowChangePasswordModal(false)} 
      />

      <style jsx global>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}
