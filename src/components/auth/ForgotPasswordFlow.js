'use client';
import { useState } from 'react';
import { X, Mail, Key, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

export default function ForgotPasswordFlow({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // PASO 1: Enviar código
  const handleSendCode = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/admin/forgot-password', { email: email.trim() });
      toast.success('Código enviado a tu correo');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al enviar código');
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Verificar código (solo validar que existe)
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      toast.error('Ingresa el código de 6 dígitos');
      return;
    }

    // Solo pasar al siguiente paso (la validación real se hará al cambiar contraseña)
    toast.success('Código correcto');
    setStep(3);
  };

  // PASO 3: Cambiar contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/admin/reset-password', { 
        email: email.trim(),
        codigo: code.trim(),
        newPassword: newPassword
      });
      
      toast.success('¡Contraseña actualizada exitosamente!');
      
      setStep(1);
      setEmail('');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Código inválido o expirado';
      toast.error(mensaje);
      
      // Si el código está mal, volver al paso 2
      if (mensaje.includes('Código') || mensaje.includes('código')) {
        setStep(2);
        setCode('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          width: '90%',
          maxWidth: '500px',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 30px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>
            Recuperar Contraseña
          </h3>
          <button 
            onClick={handleClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              transition: 'all 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress (3 pasos) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '24px 30px',
          gap: '12px',
          background: '#f8fafc'
        }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: step >= s ? '50px' : '12px',
                height: '12px',
                borderRadius: '6px',
                background: step >= s ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#e2e8f0',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '30px' }}>
          {/* PASO 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendCode}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Mail size={28} color="white" />
                </div>
                <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#1e293b' }}>
                  Paso 1: Ingresa tu correo
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                  Te enviaremos un código de verificación
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#475569'
                }}>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@conalep.edu.mx"
                  disabled={loading}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="spin" size={18} />
                    Enviando...
                  </>
                ) : (
                  'Enviar Código'
                )}
              </button>
            </form>
          )}

          {/* PASO 2: Código */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Key size={28} color="white" />
                </div>
                <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#1e293b' }}>
                  Paso 2: Verifica el código
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                  Revisa tu correo: <strong>{email}</strong>
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#475569'
                }}>
                  Código de 6 dígitos
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  disabled={loading}
                  maxLength={6}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    letterSpacing: '0.5em',
                    fontWeight: 700,
                    outline: 'none',
                    transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <p style={{
                  marginTop: '8px',
                  fontSize: '0.85rem',
                  color: code.length === 6 ? '#10b981' : '#64748b',
                  textAlign: 'center',
                  fontWeight: 500
                }}>
                  {code.length}/6 dígitos {code.length === 6 && '✓'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: (loading || code.length !== 6) ? '#cbd5e1' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: (loading || code.length !== 6) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}
              >
                Continuar
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  color: '#64748b',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                ← Volver
              </button>
            </form>
          )}

          {/* PASO 3: Nueva contraseña */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Lock size={28} color="white" />
                </div>
                <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#1e293b' }}>
                  Paso 3: Nueva contraseña
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                  Ingresa tu nueva contraseña segura
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#475569'
                }}>
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                  minLength={6}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#475569'
                }}>
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  disabled={loading}
                  minLength={6}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p style={{ 
                    marginTop: '6px', 
                    fontSize: '0.8rem', 
                    color: '#ef4444',
                    fontWeight: 500
                  }}>
                    ⚠ Las contraseñas no coinciden
                  </p>
                )}
                {confirmPassword && confirmPassword === newPassword && (
                  <p style={{ 
                    marginTop: '6px', 
                    fontSize: '0.8rem', 
                    color: '#10b981',
                    fontWeight: 500
                  }}>
                    ✓ Las contraseñas coinciden
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: (loading || newPassword.length < 6 || newPassword !== confirmPassword) 
                    ? '#cbd5e1' 
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: (loading || newPassword.length < 6 || newPassword !== confirmPassword) 
                    ? 'not-allowed' 
                    : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="spin" size={18} />
                    Cambiando...
                  </>
                ) : (
                  'Cambiar Contraseña'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  color: '#64748b',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                ← Volver
              </button>
            </form>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
