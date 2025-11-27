"use client";
import { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';
import { clasesService } from '@/services/api';
import { useData } from '@/context/DataContext';
import toast from 'react-hot-toast';

export default function EditClassModal({ isOpen, onClose, classItem, onSuccess }) {
  const { data } = useData();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_clase: '',
    codigo_clase: '',
    maestro_id: ''
  });

  useEffect(() => {
    if (classItem) {
      setFormData({
        nombre_clase: classItem.nombre_clase || '',
        codigo_clase: classItem.codigo_clase || '',
        maestro_id: classItem.maestro_id || ''
      });
    } else {
      setFormData({
        nombre_clase: '',
        codigo_clase: '',
        maestro_id: ''
      });
    }
  }, [classItem, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (classItem) {
        await clasesService.update(classItem.clase_id, formData);
        toast.success('Clase actualizada exitosamente');
      } else {
        await clasesService.create(formData);
        toast.success('Clase creada exitosamente');
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
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={20} color="white" />
            </div>
            <h3>{classItem ? 'Editar classes' : 'Nueva Clase'}</h3>
          </div>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nombre de la Clase <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" name="nombre_clase" value={formData.nombre_clase} onChange={handleChange} className="form-input" required disabled={loading} placeholder="Ej: Matemáticas" />
              </div>
              <div className="form-group">
                <label className="form-label">Código de Clase <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" name="codigo_clase" value={formData.codigo_clase} onChange={handleChange} className="form-input" required disabled={loading} placeholder="Ej: MAT-101" />
              </div>
              <div className="form-group">
                <label className="form-label">Maestro Asignado <span style={{ color: '#ef4444' }}>*</span></label>
                <select name="maestro_id" value={formData.maestro_id} onChange={handleChange} className="form-input" required disabled={loading}>
                  <option value="">Seleccionar maestro</option>
                  {data.teachers?.map(t => (
                    <option key={t.maestro_id} value={t.maestro_id}>
                      {t.nombre} {t.apellido_paterno} {t.apellido_materno}
                    </option>
                  ))}
                </select>
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
