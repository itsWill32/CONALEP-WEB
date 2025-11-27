"use client";
import { useState, useEffect } from 'react';
import { X, Send, Bell, Search, UserCheck, UserX, CheckCircle, Users, Loader2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useGradosGrupos } from '@/hooks/useGradosGrupos';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function NotificationModal({ isOpen, onClose, notification }) {
  const { addNotification } = useData();
  const { grados, grupos } = useGradosGrupos();
  const [loadingAlumnos, setLoadingAlumnos] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [clases, setClases] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [filteredAlumnos, setFilteredAlumnos] = useState([]);
  const [searchAlumno, setSearchAlumno] = useState('');
  const [selectedAlumnos, setSelectedAlumnos] = useState([]);
  
  const [formData, setFormData] = useState({
    titulo: '',
    mensaje: '',
    tipo_destinatario: '',
    grado: '',
    grupo: '',
    clase_id: '',
    fecha_expiracion: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchClases();
      fetchAlumnos();
      
      if (notification) {
        setFormData({
          titulo: notification.titulo || '',
          mensaje: notification.mensaje || '',
          tipo_destinatario: notification.tipo_destinatario || '',
          grado: notification.grado || '',
          grupo: notification.grupo || '',
          clase_id: notification.clase_id || '',
          fecha_expiracion: notification.fecha_expiracion || ''
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, notification]);

  useEffect(() => {
    if (formData.tipo_destinatario === 'ALUMNOS_ESPECIFICOS') {
      filterAlumnos();
    }
  }, [searchAlumno, alumnos]);

  const fetchClases = async () => {
    try {
      const response = await api.get('/admin/clases');
      setClases(response.data.data || []);
    } catch (error) {
      console.error('Error fetching clases:', error);
    }
  };

  const fetchAlumnos = async () => {
    setLoadingAlumnos(true); 
    try {
      const response = await api.get('/admin/alumnos', { params: { limit: 10000 } });
      setAlumnos(response.data.data || []);
      setFilteredAlumnos(response.data.data || []);
    } catch (error) {
      console.error('Error fetching alumnos:', error);
      toast.error('Error al cargar alumnos'); 
    } finally {
      setLoadingAlumnos(false); 
    }
  };

  const filterAlumnos = () => {
    if (!searchAlumno.trim()) {
      setFilteredAlumnos(alumnos);
      return;
    }
    const search = searchAlumno.toLowerCase();
    const filtered = alumnos.filter(alumno => 
      alumno.nombre.toLowerCase().includes(search) ||
      alumno.apellido_paterno.toLowerCase().includes(search) ||
      alumno.apellido_materno?.toLowerCase().includes(search) ||
      alumno.matricula.toLowerCase().includes(search) ||
      alumno.correo_institucional.toLowerCase().includes(search)
    );
    setFilteredAlumnos(filtered);
  };

  const toggleAlumno = (alumnoId) => {
    setSelectedAlumnos(prev => 
      prev.includes(alumnoId) ? prev.filter(id => id !== alumnoId) : [...prev, alumnoId]
    );
  };

  const selectAll = () => setSelectedAlumnos(filteredAlumnos.map(a => a.alumno_id));
  const deselectAll = () => setSelectedAlumnos([]);

  const resetForm = () => {
    setFormData({
      titulo: '', mensaje: '', tipo_destinatario: '', grado: '', grupo: '', clase_id: '', fecha_expiracion: ''
    });
    setSelectedAlumnos([]);
    setSearchAlumno('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.mensaje || !formData.tipo_destinatario) {
      toast.error('Completa todos los campos requeridos');
      return;
    }
    if (formData.tipo_destinatario === 'ALUMNOS_ESPECIFICOS' && selectedAlumnos.length === 0) {
      toast.error('Selecciona al menos un alumno');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        titulo: formData.titulo,
        mensaje: formData.mensaje,
        tipo_destinatario: formData.tipo_destinatario,
        fecha_expiracion: formData.fecha_expiracion || null
      };

      if (formData.tipo_destinatario === 'ALUMNOS_GRADO' && formData.grado) payload.grado = formData.grado;
      if (formData.tipo_destinatario === 'ALUMNOS_GRUPO' && formData.grado && formData.grupo) {
        payload.grado = formData.grado;
        payload.grupo = formData.grupo;
      }
      if (formData.tipo_destinatario === 'ALUMNOS_CLASE' && formData.clase_id) payload.clase_id = formData.clase_id;
      if (formData.tipo_destinatario === 'ALUMNOS_ESPECIFICOS') payload.alumno_ids = selectedAlumnos;

      await addNotification(payload);
      onClose();
      resetForm();
      toast.success('Notificación enviada correctamente');
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Error al enviar la notificación');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'tipo_destinatario' && { grado: '', grupo: '', clase_id: '' })
    }));
    if (name === 'tipo_destinatario') {
      setSelectedAlumnos([]);
      setSearchAlumno('');
    }
  };

  const getDestinatariosPreview = () => {
    switch(formData.tipo_destinatario) {
      case 'TODOS_ALUMNOS': return 'Todos los alumnos del plantel';
      case 'ALUMNOS_GRADO': return formData.grado ? `Todos los alumnos de ${formData.grado}° grado` : 'Selecciona un grado';
      case 'ALUMNOS_GRUPO': return formData.grado && formData.grupo ? `Alumnos del grupo ${formData.grado}°${formData.grupo}` : 'Selecciona grado y grupo';
      case 'ALUMNOS_CLASE': 
        if (formData.clase_id) {
          const clase = clases.find(c => c.clase_id === parseInt(formData.clase_id));
          return clase ? `Alumnos de ${clase.nombre_clase}` : 'Clase seleccionada';
        }
        return 'Selecciona una clase';
      case 'ALUMNOS_ESPECIFICOS': 
        return selectedAlumnos.length > 0 
          ? `${selectedAlumnos.length} alumno${selectedAlumnos.length !== 1 ? 's' : ''} seleccionado${selectedAlumnos.length !== 1 ? 's' : ''}`
          : 'Selecciona alumnos';
      default: return 'Selecciona destinatarios';
    }
  };

  // --- Estilos Reutilizables ---
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay show" style={{ 
      zIndex: 1000,
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="modal-container" style={{ 
        width: '90%', maxWidth: '750px',
        maxHeight: '90vh',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex', flexDirection: 'column',
        animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* --- HEADER --- */}
        <div style={{ 
          padding: '24px 32px', 
          borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              padding: '12px',
              borderRadius: '14px',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
              color: 'white'
            }}>
              <Bell size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                {notification ? 'Editar Notificación' : 'Nueva Notificación'}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                Comunicación oficial a estudiantes
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '8px', borderRadius: '50%', color: '#94a3b8', transition: '0.2s'
          }}
          onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#ef4444'}}
          onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'}}
          >
            <X size={24} />
          </button>
        </div>

        {/* --- BODY --- */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            
            {/* Título */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Asunto / Título *</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ej: Aviso Importante: Suspensión de labores"
                required
                disabled={loading}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)' }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Mensaje */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Mensaje del Comunicado *</label>
              <textarea
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                placeholder="Escribe aquí el contenido detallado..."
                required
                rows={5}
                disabled={loading}
                style={{...inputStyle, resize: 'vertical', lineHeight: '1.5'}}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)' }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; e.target.style.boxShadow = 'none' }}
              />
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
                {formData.mensaje.length} caracteres
              </div>
            </div>

            {/* Selector de Destinatarios */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>¿A quién va dirigido? *</label>
              <select
                name="tipo_destinatario"
                value={formData.tipo_destinatario}
                onChange={handleChange}
                required
                disabled={loading}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#fff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; }}
              >
                <option value="">Seleccionar grupo de destino...</option>
                <option value="TODOS_ALUMNOS">Todos los alumnos del plantel</option>
                <option value="ALUMNOS_GRADO">Alumnos de un Grado específico</option>
                <option value="ALUMNOS_GRUPO">Alumnos de un Grupo específico</option>
                <option value="ALUMNOS_CLASE"> Alumnos inscritos en una Materia</option>
                <option value="ALUMNOS_ESPECIFICOS">Alumnos específicos (Selección manual)</option>
              </select>
            </div>

            {/* --- FILTROS CONDICIONALES --- */}
            
            {/* Grado */}
            {formData.tipo_destinatario === 'ALUMNOS_GRADO' && (
              <div style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
                <label style={labelStyle}>Selecciona el Grado *</label>
                <select name="grado" value={formData.grado} onChange={handleChange} required style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  {grados.map(g => <option key={g} value={g}>{g}° Semestre/Grado</option>)}
                </select>
              </div>
            )}

            {/* Grupo */}
            {formData.tipo_destinatario === 'ALUMNOS_GRUPO' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
                <div>
                  <label style={labelStyle}>Grado *</label>
                  <select name="grado" value={formData.grado} onChange={handleChange} required style={inputStyle}>
                    <option value="">Seleccionar...</option>
                    {grados.map(g => <option key={g} value={g}>{g}°</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Grupo *</label>
                  <select name="grupo" value={formData.grupo} onChange={handleChange} required style={inputStyle}>
                    <option value="">Seleccionar...</option>
                    {grupos.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Clase */}
            {formData.tipo_destinatario === 'ALUMNOS_CLASE' && (
              <div style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
                <label style={labelStyle}>Selecciona la Materia *</label>
                <select name="clase_id" value={formData.clase_id} onChange={handleChange} required style={inputStyle}>
                  <option value="">Seleccionar materia...</option>
                  {clases.map(c => (
                    <option key={c.clase_id} value={c.clase_id}>{c.nombre_clase} ({c.codigo_clase})</option>
                  ))}
                </select>
              </div>
            )}

            {/* --- SELECTOR DE ALUMNOS ESPECÍFICOS (MEJORADO) --- */}
            {formData.tipo_destinatario === 'ALUMNOS_ESPECIFICOS' && (
              <div style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
                <label style={labelStyle}>Selección Manual de Alumnos</label>
                
                {/* Buscador y Botones */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      value={searchAlumno}
                      onChange={(e) => setSearchAlumno(e.target.value)}
                      placeholder="Buscar por nombre, matrícula..."
                      style={{...inputStyle, paddingLeft: '40px', backgroundColor: 'white'}}
                    />
                  </div>
                  <button type="button" onClick={selectAll} className="btn-outline" style={{ padding: '0 15px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={16} /> Todos
                  </button>
                  <button type="button" onClick={deselectAll} className="btn-outline" style={{ padding: '0 15px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserX size={16} /> Ninguno
                  </button>
                </div>

                {/* Lista de Alumnos - Tarjetas */}
                <div style={{
                  maxHeight: '350px', overflowY: 'auto',
                  border: '1px solid #e2e8f0', borderRadius: '16px',
                  backgroundColor: '#f8fafc', padding: '12px',
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px'
                }}>
                  {loadingAlumnos ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Loader2 className="spin" size={30} color="#3b82f6" />
                      <span>Cargando lista de estudiantes...</span>
                    </div>
                  ) : filteredAlumnos.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      No se encontraron alumnos con ese criterio.
                    </div>
                  ) : (
                    filteredAlumnos.map(alumno => {
                      const isSelected = selectedAlumnos.includes(alumno.alumno_id);
                      return (
                        <div
                          key={alumno.alumno_id}
                          onClick={() => toggleAlumno(alumno.alumno_id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px', borderRadius: '12px',
                            cursor: 'pointer', transition: 'all 0.2s ease',
                            border: isSelected ? '1px solid #60a5fa' : '1px solid white',
                            backgroundColor: isSelected ? '#eff6ff' : 'white',
                            boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                            transform: isSelected ? 'translateY(-1px)' : 'none'
                          }}
                        >
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '6px',
                            border: isSelected ? 'none' : '2px solid #cbd5e1',
                            backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            {isSelected && <CheckCircle size={14} color="white" />}
                          </div>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, color: isSelected ? '#1e40af' : '#334155', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {alumno.nombre} {alumno.apellido_paterno}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: isSelected ? '#60a5fa' : '#94a3b8' }}>
                              {alumno.grado}°{alumno.grupo} • {alumno.matricula}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Preview Box */}
            {formData.tipo_destinatario && (
              <div style={{
                padding: '20px',
                background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
                border: '1px solid #bae6fd',
                borderRadius: '16px',
                marginBottom: '24px',
                display: 'flex', alignItems: 'center', gap: '16px'
              }}>
                <div style={{ background: '#fff', padding: '10px', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <Users size={24} color="#0284c7" />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0369a1', fontWeight: 700, marginBottom: '4px' }}>
                    Resumen de Envío
                  </div>
                  <div style={{ fontSize: '1rem', color: '#0c4a6e', fontWeight: 600 }}>
                    {getDestinatariosPreview()}
                  </div>
                </div>
              </div>
            )}

            {/* Fecha Expiración */}
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Fecha de Expiración (Opcional)</label>
              <input
                type="date"
                name="fecha_expiracion"
                value={formData.fecha_expiracion}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                disabled={loading}
                style={inputStyle}
              />
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '6px 0 0' }}>
                La notificación dejará de ser visible para los alumnos después de esta fecha.
              </p>
            </div>
          </div>

          {/* --- FOOTER --- */}
          <div style={{
            padding: '24px 32px',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#fff',
            borderRadius: '0 0 24px 24px',
            display: 'flex', justifyContent: 'flex-end', gap: '16px'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: 'white',
                color: '#475569',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 28px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" /> Enviando...
                </>
              ) : (
                <>
                  <Send size={18} /> Enviar Notificación
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Animaciones Globales Inline */}
      <style jsx global>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}