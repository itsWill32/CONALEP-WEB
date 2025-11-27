"use client";
import { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
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

  if (!isOpen) return null;

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

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} color="white" />
            </div>
            <h3>{student ? 'Editar students' : 'Nuevo Alumno'}</h3>
          </div>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nombre <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="form-input" required disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido Paterno <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} className="form-input" required disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido Materno</label>
                <input type="text" name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} className="form-input" disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">Matrícula <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} className="form-input" required disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">Correo <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="email" name="correo_institucional" value={formData.correo_institucional} onChange={handleChange} className="form-input" required disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">Grado <span style={{ color: '#ef4444' }}>*</span></label>
                <select name="grado" value={formData.grado} onChange={handleChange} className="form-input" required disabled={loading}>
                  <option value="">Seleccionar</option>
                  {grados.map(g => <option key={g} value={g}>{g}°</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Grupo <span style={{ color: '#ef4444' }}>*</span></label>
                <select name="grupo" value={formData.grupo} onChange={handleChange} className="form-input" required disabled={loading}>
                  <option value="">Seleccionar</option>
                  {grupos.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="form-input" disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">CURP</label>
                <input type="text" name="curp" value={formData.curp} onChange={handleChange} className="form-input" maxLength={18} disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input type="tel" name="telefono_contacto" value={formData.telefono_contacto} onChange={handleChange} className="form-input" disabled={loading} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Dirección</label>
                <textarea name="direccion" value={formData.direccion} onChange={handleChange} className="form-input" rows={2} disabled={loading} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
