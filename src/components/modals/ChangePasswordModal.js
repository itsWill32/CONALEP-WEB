'use client';
import { useState } from 'react';
import { X, Eye, EyeOff, Lock, KeyRound, Save, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAuthService } from '@/services/api';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const config = {
    color: '#6366f1',
    bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    shadow: 'rgba(79, 70, 229, 0.2)',
    shadowFocus: 'rgba(99, 102, 241, 0.1)'
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mínimo 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.currentPassword && formData.newPassword && 
        formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña debe ser diferente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      await adminAuthService.changePassword(formData.currentPassword, formData.newPassword);
      
      toast.success('Contraseña actualizada exitosamente');
      handleClose();
    } catch (error) {
      console.error('Error:', error);
      
      if (error.response?.data?.code === 'INVALID_PASSWORD') {
        setErrors({ currentPassword: 'Contraseña incorrecta' });
        toast.error('La contraseña actual es incorrecta');
      } else {
        toast.error(error.response?.data?.error || 'Error al cambiar la contraseña');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 45px 12px 42px',
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

  const focusHandler = (e) => {
    e.target.style.borderColor = config.color;
    e.target.style.backgroundColor = '#fff';
    e.target.style.boxShadow = `0 0 0 4px ${config.shadowFocus}`;
  };

  const blurHandler = (e) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.backgroundColor = '#f8fafc';
    e.target.style.boxShadow = 'none';
  };

  const iconLeftStyle = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    pointerEvents: 'none'
  };

  const toggleBtnStyle = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s'
  };

  return (
    <div
      className="modal-overlay show"
      onClick={handleClose}
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
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '500px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
      >
        {/* HEADER */}
        <div
          className="modal-header"
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                background: config.bg,
                padding: '12px',
                borderRadius: '14px',
                boxShadow: `0 4px 6px -1px ${config.shadow}`,
                color: 'white',
              }}
            >
              <Lock size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                Cambiar Contraseña
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                Actualiza tus credenciales de acceso
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              color: '#94a3b8',
              transition: '0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Contraseña Actual */}
              <div>
                <label style={labelStyle}>Contraseña Actual</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={18} style={iconLeftStyle} />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Ingresa tu contraseña actual"
                    disabled={loading}
                    style={{
                      ...inputStyle,
                      borderColor: errors.currentPassword ? '#ef4444' : '#e2e8f0'
                    }}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={toggleBtnStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <span
                    style={{
                      display: 'block',
                      color: '#ef4444',
                      fontSize: '0.85rem',
                      marginTop: '6px',
                      fontWeight: 500,
                    }}
                  >
                    {errors.currentPassword}
                  </span>
                )}
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label style={labelStyle}>Nueva Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={iconLeftStyle} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    disabled={loading}
                    style={{
                      ...inputStyle,
                      borderColor: errors.newPassword ? '#ef4444' : '#e2e8f0'
                    }}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={toggleBtnStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <span
                    style={{
                      display: 'block',
                      color: '#ef4444',
                      fontSize: '0.85rem',
                      marginTop: '6px',
                      fontWeight: 500,
                    }}
                  >
                    {errors.newPassword}
                  </span>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label style={labelStyle}>Confirmar Nueva Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={iconLeftStyle} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repite la nueva contraseña"
                    disabled={loading}
                    style={{
                      ...inputStyle,
                      borderColor: errors.confirmPassword ? '#ef4444' : '#e2e8f0'
                    }}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={toggleBtnStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span
                    style={{
                      display: 'block',
                      color: '#ef4444',
                      fontSize: '0.85rem',
                      marginTop: '6px',
                      fontWeight: 500,
                    }}
                  >
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              {/* Info de seguridad */}
              <div
                style={{
                  background: '#f0f9ff',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px dashed #bae6fd',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'start',
                }}
              >
                <ShieldCheck size={20} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h4
                    style={{
                      margin: '0 0 6px',
                      fontSize: '0.9rem',
                      color: '#075985',
                      fontWeight: 700,
                    }}
                  >
                    Seguridad de la cuenta
                  </h4>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '16px',
                      color: '#334155',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                    }}
                  >
                    <li>Usa al menos 6 caracteres.</li>
                    <li>Combina letras y números para mayor seguridad.</li>
                    <li>No compartas tu contraseña con nadie.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div
              className="modal-footer"
              style={{
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  color: '#475569',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.target.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.target.style.background = 'white')}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: loading ? '#e2e8f0' : config.bg,
                  color: loading ? '#94a3b8' : 'white',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: loading ? 'none' : `0 4px 12px ${config.shadow}`,
                  transition: 'all 0.2s',
                }}
              >
                {loading ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
