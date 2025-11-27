"use client";
import { useState, useEffect } from 'react';
import { X, Send, Bell, Search, UserCheck, UserX } from 'lucide-react';
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
    // Filtros específicos
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
      const response = await api.get('/admin/alumnos', {
        params: { limit: 10000 } 
      });
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
      prev.includes(alumnoId)
        ? prev.filter(id => id !== alumnoId)
        : [...prev, alumnoId]
    );
  };

  const selectAll = () => {
    setSelectedAlumnos(filteredAlumnos.map(a => a.alumno_id));
  };

  const deselectAll = () => {
    setSelectedAlumnos([]);
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      mensaje: '',
      tipo_destinatario: '',
      grado: '',
      grupo: '',
      clase_id: '',
      fecha_expiracion: ''
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

    // Validar alumnos específicos
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

      // Agregar filtros específicos según el tipo
      if (formData.tipo_destinatario === 'ALUMNOS_GRADO' && formData.grado) {
        payload.grado = formData.grado;
      }
      if (formData.tipo_destinatario === 'ALUMNOS_GRUPO' && formData.grado && formData.grupo) {
        payload.grado = formData.grado;
        payload.grupo = formData.grupo;
      }
      if (formData.tipo_destinatario === 'ALUMNOS_CLASE' && formData.clase_id) {
        payload.clase_id = formData.clase_id;
      }
      if (formData.tipo_destinatario === 'ALUMNOS_ESPECIFICOS') {
        payload.alumno_ids = selectedAlumnos;
      }

      await addNotification(payload);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Resetear filtros al cambiar tipo
      ...(name === 'tipo_destinatario' && {
        grado: '',
        grupo: '',
        clase_id: ''
      })
    }));
    
    // Resetear alumnos seleccionados si cambia el tipo
    if (name === 'tipo_destinatario') {
      setSelectedAlumnos([]);
      setSearchAlumno('');
    }
  };

  const getDestinatariosPreview = () => {
    switch(formData.tipo_destinatario) {
      case 'TODOS_ALUMNOS':
        return 'Todos los alumnos del plantel';
      case 'ALUMNOS_GRADO':
        return formData.grado ? `Todos los alumnos de ${formData.grado}° grado` : 'Selecciona un grado';
      case 'ALUMNOS_GRUPO':
        return formData.grado && formData.grupo 
          ? `Alumnos del grupo ${formData.grado}°${formData.grupo}` 
          : 'Selecciona grado y grupo';
      case 'ALUMNOS_CLASE':
        if (formData.clase_id) {
          const clase = clases.find(c => c.clase_id === parseInt(formData.clase_id));
          return clase ? `Alumnos inscritos en ${clase.nombre_clase}` : 'Clase seleccionada';
        }
        return 'Selecciona una clase';
      case 'ALUMNOS_ESPECIFICOS':
        return selectedAlumnos.length > 0 
          ? `${selectedAlumnos.length} alumno${selectedAlumnos.length !== 1 ? 's' : ''} seleccionado${selectedAlumnos.length !== 1 ? 's' : ''}`
          : 'Selecciona alumnos';
      default:
        return 'Selecciona destinatarios';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay show" style={{ zIndex: 1000 }}>
      <div className="modal-container" style={{ 
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header fijo */}
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#dbeafe',
              padding: '10px',
              borderRadius: '10px',
              display: 'flex'
            }}>
              <Bell size={24} color="#2563eb" />
            </div>
            <div>
              <h3>{notification ? 'Editar Notificación' : 'Nueva Notificación'}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Envía mensajes importantes a los estudiantes
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Body con scroll */}
        <form onSubmit={handleSubmit} style={{ 
          display: 'flex', 
          flexDirection: 'column',
          flex: 1,
          minHeight: 0
        }}>
          <div className="modal-body" style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '24px'
          }}>
            {/* Título */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#334155'
              }}>
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ej: Suspensión de clases"
                required
                maxLength={100}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Mensaje */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#334155'
              }}>
                Mensaje *
              </label>
              <textarea
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                placeholder="Escribe el contenido de la notificación..."
                required
                rows={5}
                maxLength={500}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', textAlign: 'right' }}>
                {formData.mensaje.length}/500 caracteres
              </div>
            </div>

            {/* Tipo de destinatario */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#334155'
              }}>
                Destinatarios *
              </label>
              <select
                name="tipo_destinatario"
                value={formData.tipo_destinatario}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem'
                }}
              >
                <option value="">Seleccionar destinatarios...</option>
                <option value="TODOS_ALUMNOS">📚 Todos los alumnos</option>
                <option value="ALUMNOS_GRADO">📖 Alumnos por grado</option>
                <option value="ALUMNOS_GRUPO">👥 Alumnos por grupo específico</option>
                <option value="ALUMNOS_CLASE">📝 Alumnos de una clase/materia</option>
                <option value="ALUMNOS_ESPECIFICOS">🎯 Alumnos específicos</option>
              </select>
            </div>

            {/* Filtros específicos */}
            {formData.tipo_destinatario === 'ALUMNOS_GRADO' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: '#334155'
                }}>
                  Selecciona Grado *
                </label>
                <select
                  name="grado"
                  value={formData.grado}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="">Seleccionar grado...</option>
                  {grados.map(g => (
                    <option key={g} value={g}>{g}° Grado</option>
                  ))}
                </select>
              </div>
            )}

            {formData.tipo_destinatario === 'ALUMNOS_GRUPO' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: '#334155'
                  }}>
                    Grado *
                  </label>
                  <select
                    name="grado"
                    value={formData.grado}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.95rem'
                    }}
                  >
                    <option value="">Grado...</option>
                    {grados.map(g => (
                      <option key={g} value={g}>{g}°</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: '#334155'
                  }}>
                    Grupo *
                  </label>
                  <select
                    name="grupo"
                    value={formData.grupo}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.95rem'
                    }}
                  >
                    <option value="">Grupo...</option>
                    {grupos.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {formData.tipo_destinatario === 'ALUMNOS_CLASE' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: '#334155'
                }}>
                  Selecciona Clase/Materia *
                </label>
                <select
                  name="clase_id"
                  value={formData.clase_id}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="">Seleccionar clase...</option>
                  {clases.map(c => (
                    <option key={c.clase_id} value={c.clase_id}>
                      {c.nombre_clase} ({c.codigo_clase})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Selector de alumnos específicos */}
            {formData.tipo_destinatario === 'ALUMNOS_ESPECIFICOS' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: '#334155'
                }}>
                  Selecciona Alumnos *
                </label>
                
                {/* Buscador */}
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <Search
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }}
                  />
                  <input
                    type="text"
                    value={searchAlumno}
                    onChange={(e) => setSearchAlumno(e.target.value)}
                    placeholder="Buscar por nombre, matrícula o correo..."
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 40px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {/* Botones de selección */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="btn btn-outline"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    <UserCheck size={14} style={{ marginRight: '4px' }} />
                    Seleccionar todos
                  </button>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="btn btn-outline"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    <UserX size={14} style={{ marginRight: '4px' }} />
                    Deseleccionar todos
                  </button>
                </div>

                {/* Lista de alumnos */}
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '8px'
                }}>
                  {loadingAlumnos ? ( // ✅ AGREGAR
                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                      Cargando alumnos...
                    </div>
                  ) : filteredAlumnos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                      No se encontraron alumnos
                    </div>
                  ) : (
                    filteredAlumnos.map(alumno => (
                      <label
                        key={alumno.alumno_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: '0.2s',
                          background: selectedAlumnos.includes(alumno.alumno_id) ? '#f0f9ff' : 'transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = selectedAlumnos.includes(alumno.alumno_id) ? '#dbeafe' : '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = selectedAlumnos.includes(alumno.alumno_id) ? '#f0f9ff' : 'transparent'}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAlumnos.includes(alumno.alumno_id)}
                          onChange={() => toggleAlumno(alumno.alumno_id)}
                          style={{ marginRight: '12px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, color: '#1e293b', fontSize: '0.95rem' }}>
                            {alumno.nombre} {alumno.apellido_paterno} {alumno.apellido_materno}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {alumno.matricula} • {alumno.grado}°{alumno.grupo}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Preview de destinatarios */}
            {formData.tipo_destinatario && (
              <div style={{
                padding: '16px',
                background: '#f0f9ff',
                border: '2px solid #bae6fd',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 600, marginBottom: '6px' }}>
                  📨 Se enviará a:
                </div>
                <div style={{ fontSize: '1rem', color: '#0c4a6e', fontWeight: 700 }}>
                  {getDestinatariosPreview()}
                </div>
              </div>
            )}

            {/* Fecha de expiración */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#334155'
              }}>
                Fecha de Expiración (Opcional)
              </label>
              <input
                type="date"
                name="fecha_expiracion"
                value={formData.fecha_expiracion}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem'
                }}
              />
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                La notificación se ocultará automáticamente después de esta fecha
              </div>
            </div>
          </div>

          {/* Footer fijo */}
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            flexShrink: 0,
            background: 'white'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-outline"
              style={{ minWidth: '120px' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ minWidth: '140px' }}
            >
              <Send size={16} style={{ marginRight: '8px' }} />
              {loading ? 'Enviando...' : 'Enviar Notificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
