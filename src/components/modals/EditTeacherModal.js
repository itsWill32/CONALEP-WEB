"use client";
import { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import { maestrosService } from '@/services/api';
import toast from 'react-hot-toast';

export default function EditTeacherModal({ isOpen, onClose, teacher, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    correo_login: '',
    telefono: ''
  });

  useEffect(() => {
    if (teacher) {
      setFormData({
        nombre: teacher.nombre || '',
        apellido_paterno: teacher.apellido_paterno || '',
        apellido_materno: teacher.apellido_materno || '',
        correo_login: teacher.correo_login || '',
        telefono: teacher.telefono || ''
      });
    } else {
      setFormData({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        correo_login: '',
        telefono: ''
      });
    }
  }, [teacher, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (teacher) {
        await maestrosService.update(teacher.maestro_id, formData);
        toast.success('Maestro actualizado exitosamente');
      } else {
        await maestrosService.create(formData);
        toast.success('Maestro creado exitosamente');
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
      <div className="modal-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserCheck size={20} color="white" />
            </div>
            <h3>{teacher ? 'Editar teachers' : 'Nuevo Maestro'}</h3>
          </div>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
                <label className="form-label">Correo <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="email" name="correo_login" value={formData.correo_login} onChange={handleChange} className="form-input" required disabled={loading} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Teléfono</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="form-input" disabled={loading} />
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
