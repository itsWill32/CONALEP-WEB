"use client";
import { useState } from 'react';
import { X, Lock, AlertTriangle } from 'lucide-react';

export default function PasswordConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    try {
      await onConfirm(password);
      setPassword('');
      onClose();
    } catch (error) {
      // El error ya se maneja en el componente padre
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay show" style={{ zIndex: 9999 }}>
      <div className="modal-container" style={{ maxWidth: '500px' }}>
        <div className="modal-header" style={{ borderBottom: '2px solid #fee2e2', background: '#fef2f2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#fecaca',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={24} color="#dc2626" />
            </div>
            <div>
              <h3 style={{ color: '#dc2626', marginBottom: '4px' }}>{title || 'Acción Destructiva'}</h3>
              <p style={{ fontSize: '0.85rem', color: '#991b1b', margin: 0 }}>
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ 
              color: '#64748b', 
              marginBottom: '20px', 
              fontSize: '0.95rem',
              lineHeight: '1.6'
            }}>
              {message || 'Para confirmar esta acción, ingresa tu contraseña de administrador.'}
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                color: '#334155',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}>
                <Lock size={16} />
                Contraseña de Administrador
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                autoFocus
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="btn btn-outline"
                style={{ minWidth: '120px' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="btn"
                style={{
                  minWidth: '120px',
                  background: loading || !password.trim() ? '#94a3b8' : '#dc2626',
                  color: 'white'
                }}
              >
                {loading ? 'Confirmando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
