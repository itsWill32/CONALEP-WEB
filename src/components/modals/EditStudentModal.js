"use client";
import { useState, useEffect } from 'react';
import { X, User, Save, Loader2, Mail, Phone, Calendar, MapPin, Hash } from 'lucide-react';
import { alumnosService } from '@/services/api';
import { useGradosGrupos } from '@/hooks/useGradosGrupos';
import toast from 'react-hot-toast';

export default function EditStudentModal({ isOpen, onClose, student, onSuccess }) {
  const { grados, grupos } = useGradosGrupos();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    matricula: '',
    correo_institucional: '',
    grado: '',
    grupo: '',
    curp: '',
    fecha_nacimiento: '',
    telefono_contacto: '',
    direccion: ''
  });

  // Configuración visual para Alumnos (Tema Azul)
  const config = {
    icon: User,
    color: '#3b82f6',
    bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    label: 'Alumno',
    shadow: 'rgba(37, 99, 235, 0.2)',
    shadowFocus: 'rgba(37, 99, 235, 0.1)'
  };

  useEffect(() => {
    if (student) {
      setFormData({
        nombre: student.nombre || '',
        apellido_paterno: student.apellido_paterno || '',
        apellido_materno: student.apellido_materno || '',
        matricula: student.matricula || '',
        correo_institucional: student.correo_institucional || '',
        grado: student.grado || '',
        grupo: student.grupo || '',
        curp: student.curp || '',
        fecha_nacimiento: student.fecha_nacimiento ? student.fecha_nacimiento.split('T')[0] : '',
        telefono_contacto: student.telefono_contacto || '',
        direccion: student.direccion || ''
      });
    } else {
      setFormData({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        matricula: '',
        correo_institucional: '',
        grado: '',
        grupo: '',
        curp: '',
        fecha_nacimiento: '',
        telefono_contacto: '',
        direccion: ''
      });
    }
  }, [student, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (student) {
        await alumnosService.update(student.alumno_id, formData);
        toast.success('Alumno actualizado exitosamente');
      } else {
        await alumnosService.create(formData);
        toast.success('Alumno creado exitosamente');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  // --- Estilos y Manejadores ---
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
    display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#475569'
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay show" onClick={onClose} style={{
        zIndex: 9999,
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{
          width: '90%', maxWidth: '750px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex', flexDirection: 'column',
          animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden'
      }}>
        
        {/* --- HEADER --- */}
        <div className="modal-header" style={{
            padding: '24px 32px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
                background: config.bg,
                padding: '12px',
                borderRadius: '14px',
                boxShadow: `0 4px 6px -1px ${config.shadow}`,
                color: 'white'
            }}>
              <config.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                {student ? 'Editar Alumno' : 'Nuevo Alumno'}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                {student ? 'Modificar datos del estudiante' : 'Registrar un nuevo estudiante'}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '8px', borderRadius: '50%', color: '#94a3b8', transition: '0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                    
                    {/* Sección: Datos Personales */}
                    <div style={{ gridColumn: '1 / -1', marginBottom: '-8px' }}>
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700 }}>Datos Personales</h4>
                    </div>

                    <div><label style={labelStyle}>Nombre *</label>
                        <input name="nombre" value={formData.nombre} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                    <div><label style={labelStyle}>Apellido Paterno *</label>
                        <input name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                    <div><label style={labelStyle}>Apellido Materno</label>
                        <input name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                    
                    <div><label style={labelStyle}><Calendar size={16} style={{display:'inline', marginRight:6, marginBottom:-2}}/>F. Nacimiento</label>
                        <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}><Hash size={16} style={{display:'inline', marginRight:6, marginBottom:-2}}/>CURP</label>
                        <input name="curp" value={formData.curp} onChange={handleChange} maxLength={18} style={{...inputStyle, letterSpacing: '1px'}} onFocus={focusHandler} onBlur={blurHandler} /></div>

                    {/* Sección: Información Académica */}
                    <div style={{ gridColumn: '1 / -1', marginBottom: '-8px', marginTop: '8px' }}>
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700 }}>Información Académica</h4>
                    </div>

                    <div><label style={labelStyle}>Matrícula *</label>
                        <input name="matricula" value={formData.matricula} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                    <div><label style={labelStyle}>Grado *</label>
                        <select name="grado" value={formData.grado} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler}>
                            <option value="">Seleccionar...</option>
                            {grados.map(g => <option key={g} value={g}>{g}° Semestre</option>)}
                        </select></div>
                    <div><label style={labelStyle}>Grupo *</label>
                        <select name="grupo" value={formData.grupo} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler}>
                            <option value="">Seleccionar...</option>
                            {grupos.map(g => <option key={g} value={g}>Grupo {g}</option>)}
                        </select></div>

                    {/* Sección: Contacto */}
                    <div style={{ gridColumn: '1 / -1', marginBottom: '-8px', marginTop: '8px' }}>
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700 }}>Contacto</h4>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}><Mail size={16} style={{display:'inline', marginRight:6, marginBottom:-2}}/>Correo Institucional *</label>
                        <input type="email" name="correo_institucional" value={formData.correo_institucional} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                    
                    <div><label style={labelStyle}><Phone size={16} style={{display:'inline', marginRight:6, marginBottom:-2}}/>Teléfono</label>
                        <input type="tel" name="telefono_contacto" value={formData.telefono_contacto} onChange={handleChange} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                    
                    <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}><MapPin size={16} style={{display:'inline', marginRight:6, marginBottom:-2}}/>Dirección</label>
                        <input name="direccion" value={formData.direccion} onChange={handleChange} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                </div>

                {/* --- FOOTER --- */}
                <div className="modal-footer" style={{
                    marginTop: '32px',
                    paddingTop: '24px',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex', justifyContent: 'flex-end', gap: '12px'
                }}>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={loading} 
                        style={{
                            padding: '12px 20px', borderRadius: '12px', border: '1px solid #cbd5e1',
                            background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.background = '#f8fafc'} 
                        onMouseLeave={e => e.target.style.background = 'white'}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        style={{
                            padding: '12px 24px', borderRadius: '12px', border: 'none',
                            background: config.bg, color: 'white', fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            boxShadow: `0 4px 12px ${config.shadow}`, transition: 'all 0.2s'
                        }}
                    >
                        {loading ? <Loader2 className="spin" size={18} /> : <><Save size={18} /> Guardar Cambios</>}
                    </button>
                </div>
            </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalSlideIn { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}