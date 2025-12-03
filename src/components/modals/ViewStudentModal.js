'use client';
import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, MapPin, Hash, BookOpen, TrendingUp, Clock, CheckCircle, Loader2, Filter, RefreshCw } from 'lucide-react';
import { alumnosService } from '@/services/api';
import toast from 'react-hot-toast';

export default function ViewStudentModal({ isOpen, onClose, studentId }) {
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  
  // 👇 NUEVO: Estados para el filtro de fechas
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentData();
    }
  }, [isOpen, studentId]);

  const fetchStudentData = async (inicio = '', fin = '') => {
    setLoading(true);
    try {
      // 👇 NUEVO: Agregar parámetros de fecha al request
      const params = {};
      if (inicio && fin) {
        params.fechaInicio = inicio;
        params.fechaFin = fin;
      }
      
      const response = await alumnosService.getById(studentId, params);
      setStudentData(response.data);
    } catch (error) {
      toast.error('Error al cargar información del alumno');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 👇 NUEVO: Aplicar filtro
  const handleApplyFilter = () => {
    if (fechaInicio && fechaFin) {
      if (fechaInicio > fechaFin) {
        toast.error('La fecha de inicio debe ser menor a la fecha fin');
        return;
      }
      fetchStudentData(fechaInicio, fechaFin);
      toast.success('Filtro aplicado correctamente');
    } else {
      toast.error('Selecciona ambas fechas');
    }
  };

  // 👇 NUEVO: Limpiar filtro
  const handleClearFilter = () => {
    setFechaInicio('');
    setFechaFin('');
    fetchStudentData();
    toast.success('Filtro eliminado');
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay show"
      onClick={onClose}
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
          maxWidth: '950px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* HEADER */}
        <div
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
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                padding: '12px',
                borderRadius: '14px',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                color: 'white',
              }}
            >
              <User size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                Información del Alumno
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                Detalle completo del estudiante
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Loader2 className="spin" size={40} color="#3b82f6" style={{ marginBottom: '16px' }} />
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>Cargando información...</p>
            </div>
          ) : studentData ? (
            <>
              {/* Datos Personales */}
              <section style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
                  Datos Personales
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <InfoItem 
                    icon={<User size={18} />} 
                    label="Nombre Completo" 
                    value={`${studentData.nombre || ''} ${studentData.apellido_paterno || ''} ${studentData.apellido_materno || ''}`} 
                  />
                  <InfoItem 
                    icon={<Hash size={18} />} 
                    label="Matrícula" 
                    value={studentData.matricula || 'N/A'} 
                  />
                  <InfoItem 
                    icon={<Mail size={18} />} 
                    label="Correo" 
                    value={studentData.correo_institucional || 'N/A'} 
                  />
                  <InfoItem 
                    icon={<Phone size={18} />} 
                    label="Teléfono" 
                    value={studentData.telefono_contacto || 'N/A'} 
                  />
                  <InfoItem 
                    icon={<Calendar size={18} />} 
                    label="Fecha Nacimiento" 
                    value={studentData.fecha_nacimiento ? new Date(studentData.fecha_nacimiento).toLocaleDateString('es-MX') : 'N/A'} 
                  />
                  <InfoItem 
                    icon={<MapPin size={18} />} 
                    label="Dirección" 
                    value={studentData.direccion || 'N/A'} 
                  />
                </div>
              </section>

              {/* 👇 NUEVO: Sección de Filtros de Asistencia */}
              <section style={{ marginBottom: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 700, 
                    color: '#1e293b', 
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <TrendingUp size={20} />
                    Asistencias por Materia
                  </h4>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      background: showFilters ? '#eff6ff' : 'white',
                      color: showFilters ? '#2563eb' : '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.background = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      if (!showFilters) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                  >
                    <Filter size={16} />
                    {showFilters ? 'Ocultar Filtro' : 'Filtrar por Periodo'}
                  </button>
                </div>

                {/* Panel de Filtros */}
                {showFilters && (
                  <div style={{
                    padding: '20px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '20px',
                    animation: 'slideDown 0.2s ease-out'
                  }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1, minWidth: '160px' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '6px', 
                          fontSize: '0.85rem', 
                          fontWeight: 600, 
                          color: '#475569' 
                        }}>
                          Fecha Inicio
                        </label>
                        <input
                          type="date"
                          value={fechaInicio}
                          onChange={(e) => setFechaInicio(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.9rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: '160px' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '6px', 
                          fontSize: '0.85rem', 
                          fontWeight: 600, 
                          color: '#475569' 
                        }}>
                          Fecha Fin
                        </label>
                        <input
                          type="date"
                          value={fechaFin}
                          onChange={(e) => setFechaFin(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.9rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <button
                        onClick={handleApplyFilter}
                        disabled={!fechaInicio || !fechaFin}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '8px',
                          border: 'none',
                          background: (!fechaInicio || !fechaFin) ? '#e2e8f0' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: (!fechaInicio || !fechaFin) ? '#94a3b8' : 'white',
                          cursor: (!fechaInicio || !fechaFin) ? 'not-allowed' : 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: (!fechaInicio || !fechaFin) ? 'none' : '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                        }}
                      >
                        <Filter size={16} />
                        Aplicar
                      </button>
                      {(fechaInicio || fechaFin) && (
                        <button
                          onClick={handleClearFilter}
                          style={{
                            padding: '10px 18px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            color: '#64748b',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#ef4444';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.color = '#64748b';
                          }}
                        >
                          <RefreshCw size={16} />
                          Limpiar
                        </button>
                      )}
                    </div>

                    {/* Indicador de rango activo */}
                    {studentData.rangoFechas && (
                      <div style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        background: '#dbeafe',
                        borderRadius: '8px',
                        border: '1px solid #bfdbfe',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.85rem',
                        color: '#1e40af'
                      }}>
                        <Calendar size={16} />
                        <span>
                          Mostrando del <strong>{new Date(studentData.rangoFechas.fechaInicio).toLocaleDateString('es-MX')}</strong> al <strong>{new Date(studentData.rangoFechas.fechaFin).toLocaleDateString('es-MX')}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Estadísticas de Asistencia */}
              {studentData.estadisticasAsistencias && studentData.estadisticasAsistencias.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {studentData.estadisticasAsistencias.map((stat) => (
                    <AttendanceCard key={stat.claseid} stat={stat} />
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  background: '#f8fafc', 
                  borderRadius: '16px',
                  border: '1px dashed #e2e8f0',
                  color: '#94a3b8'
                }}>
                  <BookOpen size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>
                    {fechaInicio && fechaFin 
                      ? 'No hay registros de asistencia en este periodo.'
                      : 'El alumno no tiene materias inscritas o no hay registros de asistencia.'}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div>No se encontró información</div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { 
          from { opacity: 0; transform: translateY(-10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
    </div>
  );
}

// Componentes auxiliares (sin cambios)
function InfoItem({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
      <div style={{ color: '#64748b' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}

function AttendanceCard({ stat }) {
  return (
    <div style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen size={20} color="#3b82f6" />
          <div>
            <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{stat.nombreclase}</h5>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{stat.codigoclase}</span>
          </div>
        </div>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
          {stat.total} registros
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
        <StatBadge icon={<CheckCircle size={16} />} label="Asistencias" percentage={stat.porcentajePresentes} color="#10b981" />
        <StatBadge icon={<X size={16} />} label="Faltas" percentage={stat.porcentajeAusentes} color="#ef4444" />
        <StatBadge icon={<Clock size={16} />} label="Retardos" percentage={stat.porcentajeRetardos} color="#f59e0b" />
        <StatBadge icon={<CheckCircle size={16} />} label="Justificados" percentage={stat.porcentajeJustificados} color="#8b5cf6" />
      </div>
    </div>
  );
}

function StatBadge({ icon, label, percentage, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
      <div style={{ color: color, marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: color }}>{percentage}%</div>
      <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>{label}</div>
    </div>
  );
}
