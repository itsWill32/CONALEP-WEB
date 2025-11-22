import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function GenericModal({ isOpen, onClose, entity, item }) {
    const { add, update } = useData();
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (item) {
            setFormData(item);
        } else if (entity === 'notification') {
            setFormData({ fecha: new Date().toISOString().split('T')[0], estado: 'Pendiente' });
        } else {
            setFormData({});
        }
    }, [item, entity]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const collection = entity === 'class' ? 'classes' : entity + 's'; 
        if (item) {
            update(collection, item.id, formData);
        } else {
            add(collection, formData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay show">
            <div className="modal-container">
                <div className="modal-header-clean">
                    <h3>{item ? 'Editar' : 'Nuevo'} {entity}</h3>
                    <button className="close-btn" onClick={onClose}><X /></button>
                </div>
                <div className="modal-body">
                    <form id="dynamic-form" onSubmit={handleSubmit}>
                        
                        {entity === 'student' && (
                            <>
                                <div className="form-group"><label>Nombre</label><input name="nombre" value={formData.nombre || ''} onChange={handleChange} required /></div>
                                <div className="form-group"><label>Apellido P</label><input name="apellidoP" value={formData.apellidoP || ''} onChange={handleChange} required /></div>
                                <div className="form-group"><label>Matrícula</label><input name="matricula" value={formData.matricula || ''} onChange={handleChange} /></div>
                                <div className="form-group"><label>Grado</label><input type="number" name="grado" value={formData.grado || ''} onChange={handleChange} /></div>
                                <div className="form-group"><label>Grupo</label><input name="grupo" value={formData.grupo || ''} onChange={handleChange} /></div>
                                <div className="form-group"><label>Email</label><input name="email" value={formData.email || ''} onChange={handleChange} /></div>
                            </>
                        )}

                        {entity === 'teacher' && (
                            <>
                                <div className="form-group"><label>Nombre</label><input name="nombre" value={formData.nombre || ''} onChange={handleChange} required /></div>
                                <div className="form-group"><label>Email</label><input name="email" value={formData.email || ''} onChange={handleChange} /></div>
                                <div className="form-group"><label>Especialidad</label><input name="especialidad" value={formData.especialidad || ''} onChange={handleChange} /></div>
                            </>
                        )}

                        {entity === 'class' && (
                            <>
                                <div className="form-group"><label>Nombre</label><input name="nombre" value={formData.nombre || ''} onChange={handleChange} required /></div>
                                <div className="form-group"><label>Código</label><input name="codigo" value={formData.codigo || ''} onChange={handleChange} /></div>
                                <div className="form-group"><label>Grado</label><input name="grado" value={formData.grado || ''} onChange={handleChange} /></div>
                                <div className="form-group"><label>Grupo</label><input name="grupo" value={formData.grupo || ''} onChange={handleChange} /></div>
                            </>
                        )}

                        {entity === 'notification' && (
                            <>
                                <div className="form-group"><label>Título</label><input name="titulo" value={formData.titulo || ''} onChange={handleChange} required /></div>
                                <div className="form-group"><label>Destinatarios</label>
                                    <select name="destinatarios" value={formData.destinatarios || 'Todos'} onChange={handleChange}>
                                        <option>Todos</option><option>Maestros</option>
                                    </select>
                                </div>
                                <div className="form-group"><label>Estado</label>
                                    <select name="estado" value={formData.estado || 'Pendiente'} onChange={handleChange}>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Aprobada">Aprobada</option>
                                        <option value="Rechazada">Rechazada</option>
                                    </select>
                                </div>
                                <div className="form-group full-width"><label>Mensaje</label>
                                    <textarea name="mensaje" rows="4" style={{width:'100%', padding:'10px'}} required value={formData.mensaje || ''} onChange={handleChange}></textarea>
                                </div>
                            </>
                        )}

                        <div className="modal-footer" style={{border:'none', padding:0, marginTop:20}}>
                            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}