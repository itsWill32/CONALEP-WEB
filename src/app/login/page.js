"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/api';
import toast from 'react-hot-toast';
import { Lock, Mail, GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);
      
      // Guardar en localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast.success(`¡Bienvenido ${response.user.nombre}!`);
      
      // Forzar recarga completa de la página para que AuthContext se reinicie
      window.location.href = '/';
      
    } catch (error) {
      const message = error.response?.data?.error || 'Error al iniciar sesión';
      toast.error(message);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #023D54 0%, #2c8769 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '50px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <div style={{
            background: 'linear-gradient(135deg, #2c8769, #023D54)',
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <GraduationCap size={40} color="white" />
          </div>
          <h1 style={{fontSize: '1.8rem', color: '#023D54', marginBottom: '8px', fontWeight: 700}}>
            CONALEP 022
          </h1>
          <p style={{color: '#64748b', fontSize: '0.95rem'}}>Panel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: '20px'}}>
            <label style={{
              display: 'block', 
              marginBottom: '8px', 
              color: '#334155', 
              fontWeight: 500,
              fontSize: '0.9rem'
            }}>
              <Mail size={18} style={{verticalAlign: 'middle', marginRight: '8px'}} />
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@conalep.edu.mx"
              required
              autoComplete="email"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2c8769'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{marginBottom: '30px', position: 'relative'}}>
            <label style={{
              display: 'block', 
              marginBottom: '8px', 
              color: '#334155', 
              fontWeight: 500,
              fontSize: '0.9rem'
            }}>
              <Lock size={18} style={{verticalAlign: 'middle', marginRight: '8px'}} />
              Contraseña
            </label>
            <div style={{position: 'relative'}}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2c8769'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
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
                  color: '#64748b',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2c8769, #246e55)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.05rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: '0.3s',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(44, 135, 105, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#64748b'
        }}>
          <p>¿Problemas para acceder?</p>
          <p style={{marginTop: '5px'}}>Contacta al administrador del sistema</p>
        </div>
      </div>
    </div>
  );
}
