'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import ForgotPasswordFlow from '@/components/auth/ForgotPasswordFlow'; 

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/admin/login', { 
        email: formData.email, 
        password: formData.password 
      });
      
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success(`¡Bienvenido ${response.data.user.nombre}!`);
      
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg,rgb(51, 153, 134) 0%,rgb(1, 95, 65) 100%)',
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '40px 40px 32px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              backdropFilter: 'blur(10px)'
            }}>
              <Shield size={40} color="white" strokeWidth={2.5} />
            </div>
            <h1 style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.5px'
            }}>
              CONALEP 022
            </h1>
            <p style={{
              margin: '8px 0 0',
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              Chiapa de Corzo, Chiapas
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: '40px' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@conalep.edu.mx"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: '#f8fafc',
                    color: '#334155'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#f8fafc';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#475569'
                }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px 45px 12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: '#f8fafc',
                      color: '#334155'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#10b981';
                      e.target.style.backgroundColor = '#fff';
                      e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
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

              {/* 👇 BOTÓN DE RECUPERACIÓN ARREGLADO */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                marginBottom: '24px' 
              }}>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#10b981',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#059669'}
                  onMouseLeave={(e) => e.target.style.color = '#10b981'}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: loading ? '#e2e8f0' : 'linear-gradient(135deg,rgb(71, 205, 160) 0%,rgb(7, 120, 84) 100%)',
                  color: loading ? '#94a3b8' : 'white',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: loading ? 'none' : '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.2s',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 15px 30px -5px rgba(16, 185, 129, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = loading ? 'none' : '0 10px 25px -5px rgba(16, 185, 129, 0.4)';
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="spin" size={20} />
                    Iniciando...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Iniciar Sesión
                  </>
                )}
              </button>
            </form>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: '#f0fdf4',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{
                margin: 0,
                fontSize: '0.85rem',
                color: '#166534'
              }}>
                Buen día
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 👇 MODAL DE RECUPERACIÓN */}
      {showForgotPassword && (
        <ForgotPasswordFlow 
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          onSuccess={() => {
            setShowForgotPassword(false);
            toast.success('Ahora puedes iniciar sesión con tu nueva contraseña');
          }}
        />
      )}

      <style jsx global>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
