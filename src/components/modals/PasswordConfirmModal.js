"use client";
import { useState, useEffect } from 'react';
import { X, Lock, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';

export default function PasswordConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [animateShake, setAnimateShake] = useState(false);

  // Reset password when modal opens
  useEffect(() => {
    if (isOpen) setPassword('');
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      await onConfirm(password);
      setPassword('');
      onClose();
    } catch (error) {
      // El error ya se maneja en el componente padre, pero podemos hacer shake si falla
      setLoading(false);
      triggerShake();
    } finally {
      // Si la promesa se resuelve exitosamente, el modal se cierra, si no, quitamos loading
      // setLoading(false); // Depende de si onConfirm cierra el modal o no.
    }
  };

  const triggerShake = () => {
    setAnimateShake(true);
    setTimeout(() => setAnimateShake(false), 500);
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay show" style={{ 
      zIndex: 9999,
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)', // Fondo oscuro profesional
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div 
        className={`modal-container ${animateShake ? 'shake-animation' : ''}`}
        style={{ 
          width: '90%', maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* --- HEADER DE SEGURIDAD --- */}
        <div style={{ 
          padding: '24px', 
          background: 'linear-gradient(to right, #fef2f2, #fff1f2)', 
          borderBottom: '1px solid #fecaca',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              backgroundColor: '#fee2e2',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #fca5a5',
              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <AlertTriangle size={26} color="#dc2626" strokeWidth={2.5} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#991b1b' }}>
                {title || 'Confirmación de Seguridad'}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#b91c1c', fontWeight: 500 }}>
                Esta acción requiere autorización
              </p>
            </div>
          </div>
          <button onClick={handleClose} style={{
            background: 'white', border: '1px solid #fecaca', cursor: 'pointer',
            padding: '8px', borderRadius: '50%', color: '#ef4444', transition: '0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#ef4444'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* --- BODY --- */}
        <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
          
          <div style={{ marginBottom: '25px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ marginTop: '2px' }}><ShieldCheck size={20} color="#64748b" /></div>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: '#475569' }}>
              {message || 'Estás a punto de realizar una acción sensible. Por favor, ingresa tu contraseña de administrador para confirmar.'}
            </p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block', marginBottom: '10px', fontSize: '0.9rem',
              fontWeight: 600, color: '#334155', letterSpacing: '0.3px'
            }}>
              Contraseña de Administrador
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoFocus
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: '#f8fafc',
                  color: '#1e293b'
                }}
                onFocus={(e) => { 
                  e.target.style.borderColor = '#ef4444'; 
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
                }}
                onBlur={(e) => { 
                  e.target.style.borderColor = '#e2e8f0'; 
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* --- FOOTER BOTONES --- */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid #fecaca',
                background: 'white',
                color: '#ef4444',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#fef2f2';
                e.target.style.borderColor = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#fecaca';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim()}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: loading || !password.trim() 
                  ? '#cbd5e1' 
                  : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                fontWeight: 600,
                cursor: (loading || !password.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: (loading || !password.trim()) ? 'none' : '0 4px 12px rgba(220, 38, 38, 0.3)',
                transition: 'all 0.2s',
                minWidth: '130px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!loading && password.trim()) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                if (!loading && password.trim()) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? <Loader2 size={18} className="spin" /> : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>

      {/* --- ESTILOS GLOBALES DE ANIMACIÓN --- */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        .shake-animation { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
}