"use client";
import { useState } from 'react';
import { X, Eye, EyeOff, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

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
      newErrors.currentPassword = 'Contraseña actual es requerida';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Nueva contraseña es requerida';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/auth/admin/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      toast.success('Contraseña actualizada exitosamente');
      handleClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <div className="modal-overlay show" onClick={handleClose}>
      <div className="modal-container" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={20} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Cambiar Contraseña</h3>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Actualiza tu contraseña de acceso
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="close-btn">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Contraseña Actual */}
            <div className="form-group">
              <label className="form-label">
                Contraseña Actual <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ingresa tu contraseña actual"
                  disabled={loading}
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: '4px'
                  }}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.currentPassword && (
                <span style={{ display: 'block', color: '#ef4444', fontSize: '0.85rem', marginTop: '6px' }}>
                  {errors.currentPassword}
                </span>
              )}
            </div>

            {/* Nueva Contraseña */}
            <div className="form-group">
              <label className="form-label">
                Nueva Contraseña <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: '4px'
                  }}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && (
                <span style={{ display: 'block', color: '#ef4444', fontSize: '0.85rem', marginTop: '6px' }}>
                  {errors.newPassword}
                </span>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div className="form-group">
              <label className="form-label">
                Confirmar Nueva Contraseña <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Repite la nueva contraseña"
                  disabled={loading}
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: '4px'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span style={{ display: 'block', color: '#ef4444', fontSize: '0.85rem', marginTop: '6px' }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Info de seguridad */}
            <div style={{
              background: '#f1f5f9',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.85rem',
              color: '#475569'
            }}>
              <strong>Consejos de seguridad:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>Usa al menos 6 caracteres</li>
                <li>Combina letras, números y símbolos</li>
                <li>No uses información personal obvia</li>
              </ul>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              onClick={handleClose} 
              className="btn btn-outline"
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
